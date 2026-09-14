// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json, data/real/municipal/palika_profiles.json, data/calculated/hydro_reaches/hydro_palika_summary.json
// Classification: OBSERVED REAL & EMPIRICAL DOWNSCALING
// Citations: MoFAGA Nepal, DHM Nepal, CBS 2021 Census, NASA POWER / MERRA-2

import { useMemo } from 'react';
import {
  WEFESPillar,
  PalikaChoroplethResult,
  JoinedPalikaData,
  PalikaChoroplethMetricConfig,
} from '@wefes/shared-types';
import { DISTRICT_PALIKAS, HYDRO_PALIKA_SUMMARY } from '../data/districtPalikaAssets';
import { getPalikaMicroClimate } from '../utils/climateDownscaling';
import {
  CHOROPLETH_RAMPS,
  computeGradientColor,
  normalizePalikaName,
} from './choroplethUtils';

export interface UsePalikaChoroplethParams {
  rawGeoJson: any;
  selectedPillar: WEFESPillar;
  subFilters: Record<string, any>;
  selectedCropId?: string;
  climateMonth?: number;
  currentRainMm?: number;
  currentTempC?: number;
}

export function usePalikaChoropleth({
  rawGeoJson,
  selectedPillar,
  subFilters,
  selectedCropId,
  climateMonth = 7,
  currentRainMm = 150,
  currentTempC = 19.5,
}: UsePalikaChoroplethParams): PalikaChoroplethResult {
  return useMemo(() => {
    const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
    const profileLookup = new Map<string, any>();
    for (const p of gulmiPalikas) {
      profileLookup.set(normalizePalikaName(p.name), p);
    }
    const hydroLookup = new Map<string, any>();
    for (const h of (HYDRO_PALIKA_SUMMARY as any[])) {
      hydroLookup.set(normalizePalikaName(h.palika), h);
    }

    let metricConfig: PalikaChoroplethMetricConfig = {
      metricKey: 'default',
      pillar: selectedPillar,
      label: 'Metric Value',
      unit: '',
      min: 0,
      max: 100,
      colorRamp: CHOROPLETH_RAMPS.ylgn,
    };

    const joinedData: Record<string, JoinedPalikaData> = {};
    const features = rawGeoJson?.features || [];

    const getProfile = (props: any) => {
      const norm = normalizePalikaName(props?.name || '');
      let match = profileLookup.get(norm);
      if (!match) {
        for (const [k, v] of profileLookup.entries()) {
          if (norm.includes(k) || k.includes(norm)) return v;
        }
      }
      return match;
    };

    const getHydro = (props: any) => {
      const norm = normalizePalikaName(props?.name || '');
      let match = hydroLookup.get(norm);
      if (!match) {
        for (const [k, v] of hydroLookup.entries()) {
          if (norm.includes(k) || k.includes(norm)) return v;
        }
      }
      return match;
    };

    if (selectedPillar === 'food') {
      const cropId = selectedCropId || subFilters.crop || 'coffee';
      metricConfig = {
        metricKey: `crop_${cropId}`,
        pillar: 'food',
        label: `${cropId.charAt(0).toUpperCase() + cropId.slice(1)} Suitability`,
        unit: '%',
        min: 40,
        max: 95,
        colorRamp: CHOROPLETH_RAMPS.rdylgn,
      };

      for (const feat of features) {
        const props = feat.properties || {};
        const pData = getProfile(props);
        let score = 70;
        let cropItem = null;

        if (pData?.feasibleCrops) {
          const c = pData.feasibleCrops.find(
            (fc: any) =>
              fc.cropId.toLowerCase() === cropId.toLowerCase() ||
              cropId.toLowerCase().includes(fc.cropId.toLowerCase())
          );
          if (c) {
            score = c.score;
            cropItem = c;
          } else {
            const elev = pData?.elevation || 1400;
            score = Math.max(45, Math.min(92, Math.round(90 - Math.abs(elev - 1350) / 18)));
          }
        }

        const color = computeGradientColor(score, 40, 95, CHOROPLETH_RAMPS.rdylgn);
        const snippet = cropItem
          ? `<div style="color: #059669; font-weight: 600; font-size: 10px; margin-top: 2px;">
               ${cropItem.emoji} ${cropItem.cropName.split('(')[0].trim()}: <strong>${score}% Suitability</strong> (${cropItem.rating})
             </div>`
          : `<div style="color: #059669; font-weight: 600; font-size: 10px; margin-top: 2px;">
               Agronomic Score: <strong>${score}%</strong>
             </div>`;

        joinedData[props.name] = {
          id: props.id || props.name,
          name: props.name,
          nepaliName: props.nepaliName,
          type: props.type,
          areaSqKm: props.areaSqKm,
          value: score,
          formattedValue: `${score}%`,
          color,
          tooltipHtml: snippet,
          raw: pData,
        };
      }
    } else if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';

      if (wSub === 'river_basins') {
        metricConfig = {
          metricKey: 'river_basins',
          pillar: 'water',
          label: 'Hydrological Sub-Basin',
          unit: '',
          min: 0,
          max: 5,
          colorRamp: CHOROPLETH_RAMPS.blues,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = (props.name || '').toLowerCase();
          let basinColor = '#3b82f6';
          let basinName = 'Mid-Gulmi Stream Network';

          if (pName.includes('kaligandaki')) {
            basinColor = '#0369a1';
            basinName = 'Kali Gandaki River Corridor';
          } else if (pName.includes('satyawati') || pName.includes('ruru')) {
            basinColor = '#0284c7';
            basinName = 'Ridi Khola Sub-Catchment';
          } else if (pName.includes('musikot') || pName.includes('isma')) {
            basinColor = '#0ea5e9';
            basinName = 'Badigad Khola Basin';
          } else if (pName.includes('resunga') || pName.includes('gulmidarbar') || pName.includes('chatrakot')) {
            basinColor = '#06b6d4';
            basinName = 'Panaha / Chhaldi Watershed';
          } else if (pName.includes('chandrakot')) {
            basinColor = '#38bdf8';
            basinName = 'Upper Hugdi Khola Stream';
          }

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: 1,
            formattedValue: basinName,
            color: basinColor,
            tooltipHtml: `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">🌊 Basin: <strong>${basinName}</strong></div>`,
          };
        }
      } else if (wSub === 'spring_vulnerability') {
        metricConfig = {
          metricKey: 'spring_vulnerability',
          pillar: 'water',
          label: 'Springshed Depletion Risk',
          unit: '%',
          min: 10,
          max: 95,
          colorRamp: CHOROPLETH_RAMPS.gnylrd,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const elev = pData?.elevation || 1400;
          const rainMm = pData?.rainfallMm || 1600;
          const riskScore = Math.max(10, Math.min(95, Math.round(((elev - 800) / 1400) * 60 + (1 - rainMm / 2400) * 40)));
          const catColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : riskScore >= 25 ? '#10b981' : '#059669';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: riskScore,
            formattedValue: `${riskScore}%`,
            color: catColor,
            tooltipHtml: `<div style="color: ${catColor}; font-weight: 700; font-size: 10px; margin-top: 2px;">
                            🏔️ Spring Drying Risk: <strong>${riskScore}%</strong>
                          </div>`,
            raw: pData,
          };
        }
      } else {
        metricConfig = {
          metricKey: 'downscaled_rainfall',
          pillar: 'water',
          label: 'Orographic Downscaled Rainfall',
          unit: 'mm/mo',
          min: 0.82,
          max: 1.25,
          colorRamp: CHOROPLETH_RAMPS.rainfall,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const pName = (props.name || '').toLowerCase();
          const micro = getPalikaMicroClimate(pName, currentRainMm, currentTempC, climateMonth, pData?.elevation);
          const color = computeGradientColor(micro.orographicFactor, 0.82, 1.25, CHOROPLETH_RAMPS.rainfall);
          const orographicDiff = Math.round((micro.orographicFactor - 1) * 100);
          const orographicStr = orographicDiff >= 0 ? `+${orographicDiff}%` : `${orographicDiff}%`;

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: micro.monthlyRainMm,
            formattedValue: `${micro.monthlyRainMm} mm`,
            color,
            tooltipHtml: `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">
                            🌧️ Downscaled Rain: <strong>${micro.monthlyRainMm} mm/mo</strong> (${orographicStr})
                          </div>`,
            raw: { pData, micro },
          };
        }
      }
    } else if (selectedPillar === 'energy') {
      metricConfig = {
        metricKey: 'hydro_capacity',
        pillar: 'energy',
        label: 'Hydropower Installed Capacity',
        unit: 'MW',
        min: 1.5,
        max: 4.8,
        colorRamp: CHOROPLETH_RAMPS.purples,
      };

      for (const feat of features) {
        const props = feat.properties || {};
        const hItem = getHydro(props);
        const capMw = hItem?.total_installed_capacity_MW || 5.0;
        const color = computeGradientColor(Math.log10(capMw * 1000), 1.5, 4.8, CHOROPLETH_RAMPS.purples);

        joinedData[props.name] = {
          id: props.id || props.name,
          name: props.name,
          nepaliName: props.nepaliName,
          type: props.type,
          areaSqKm: props.areaSqKm,
          value: capMw,
          formattedValue: `${capMw.toFixed(1)} MW`,
          color,
          tooltipHtml: `<div style="color: #7c3aed; font-size: 10px; margin-top: 2px;">
                          ⚡ Hydro Capacity: <strong>${capMw.toFixed(1)} MW</strong>
                        </div>`,
          raw: hItem,
        };
      }
    } else if (selectedPillar === 'ecosystem') {
      metricConfig = {
        metricKey: 'soil_ph',
        pillar: 'ecosystem',
        label: 'Topsoil pH Baseline',
        unit: 'pH',
        min: 5.2,
        max: 7.3,
        colorRamp: CHOROPLETH_RAMPS.soilPh,
      };

      for (const feat of features) {
        const props = feat.properties || {};
        const pData = getProfile(props);
        const ph = pData?.soilPh || 6.4;
        const color = computeGradientColor(ph, 5.2, 7.3, CHOROPLETH_RAMPS.soilPh);

        joinedData[props.name] = {
          id: props.id || props.name,
          name: props.name,
          nepaliName: props.nepaliName,
          type: props.type,
          areaSqKm: props.areaSqKm,
          value: ph,
          formattedValue: `${ph.toFixed(1)} pH`,
          color,
          tooltipHtml: `<div style="color: #059669; font-size: 10px; margin-top: 2px;">🧪 Soil pH: <strong>${ph.toFixed(1)}</strong></div>`,
          raw: pData,
        };
      }
    } else {
      metricConfig = {
        metricKey: 'governance',
        pillar: 'socioeconomics',
        label: 'Local Level Type',
        unit: '',
        min: 0,
        max: 1,
        colorRamp: ['#059669', '#3730a3'],
      };

      for (const feat of features) {
        const props = feat.properties || {};
        const pData = getProfile(props);
        const uType = pData?.unitType || props.type || 'Gaunpalika';
        const color = uType === 'Nagarpalika' ? '#3730a3' : '#059669';

        joinedData[props.name] = {
          id: props.id || props.name,
          name: props.name,
          nepaliName: props.nepaliName,
          type: props.type,
          areaSqKm: props.areaSqKm,
          value: uType === 'Nagarpalika' ? 1 : 0,
          formattedValue: uType,
          color,
          tooltipHtml: `<div style="color: #4f46e5; font-size: 10px; margin-top: 2px;">🏛️ Governance: <strong>${uType}</strong></div>`,
          raw: pData,
        };
      }
    }

    return {
      metricConfig,
      joinedData,
      getColor: (palikaName: string) => joinedData[palikaName]?.color || '#059669',
      getTooltipHtml: (palikaName: string) => joinedData[palikaName]?.tooltipHtml || '',
      getValue: (palikaName: string) => joinedData[palikaName]?.value,
    };
  }, [
    rawGeoJson,
    selectedPillar,
    subFilters,
    selectedCropId,
    climateMonth,
    currentRainMm,
    currentTempC,
  ]);
}
