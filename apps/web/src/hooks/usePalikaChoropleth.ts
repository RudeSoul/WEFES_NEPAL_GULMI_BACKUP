// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json, data/real/municipal/palika_profiles.json, data/calculated/hydro_reaches/hydro_palika_summary.json, data/real/climate/gulmi_solar_pvout_opta.geojson, data/real/infrastructure/cooking_household.geojson, data/real/infrastructure/gulmi_nea_substations.geojson, data/real/hydrology/gulmi_dhm_stations.geojson, data/real/agriculture/gulmi_agricultural_landholding.geojson, data/real/land_and_soil/gulmi_soil_points_81.json
// Classification: OBSERVED REAL & EMPIRICAL DOWNSCALING
// Citations: MoALD Nepal, MoFAGA Nepal, DHM Nepal, CBS/NSO 2021 Census, NASA POWER / MERRA-2, Global Solar Atlas 2.0, Nepal Electricity Authority (NEA), NARC Soil Science Division, OpenStreetMap Contributors

import { useMemo } from 'react';
import {
  WEFESPillar,
  PalikaChoroplethResult,
  JoinedPalikaData,
  PalikaChoroplethMetricConfig,
  SUBFILTER_LEGENDS,
} from '@wefes/shared-types';
import { DISTRICT_PALIKAS, HYDRO_PALIKA_SUMMARY } from '../data/districtPalikaAssets';
import palikaGhiData from '../data/gulmi_palika_ghi.json';
import palikaCookingData from '../data/gulmi_palika_cooking.json';
import palikaGridData from '../data/gulmi_palika_grid.json';
import palikaLandholdingData from '../data/gulmi_palika_landholding.json';
import palikaSoilData from '../data/gulmi_palika_soil.json';
import {
  VALIDATED_CROPS,
  WaterStressSeason,
  getCropGrowingSeasonTemp,
  evaluateCropSuitability,
  evaluateCropWaterStress,
} from '../data/cropSuitabilityAssets';
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

export function computePalikaChoropleth({
  rawGeoJson,
  selectedPillar,
  subFilters,
  selectedCropId,
  climateMonth = 7,
  currentRainMm = 150,
  currentTempC = 19.5,
}: UsePalikaChoroplethParams): PalikaChoroplethResult {
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
      const foodMode = subFilters.foodMode || 'single_crop';

      if (foodMode === 'crop_water_stress') {
        const cropId = selectedCropId || subFilters.crop || 'coffee';
        const waterSeason = (subFilters.waterSeason as WaterStressSeason) || 'cycle';
        const cropMeta = VALIDATED_CROPS[cropId] || VALIDATED_CROPS.coffee;

        const seasonTitles: Record<WaterStressSeason, string> = {
          cycle: 'Full Growing Cycle',
          winter_dry: 'Winter Dry Period (Nov–Feb)',
          pre_monsoon: 'Pre-Monsoon Dry Spell (Mar–May)',
          monsoon_wet: 'Monsoon Wet Period (Jun–Sep)',
        };

        metricConfig = {
          metricKey: `water_stress_${cropId}`,
          pillar: 'food',
          label: `${cropMeta.name} Moisture Stress (${seasonTitles[waterSeason]})`,
          unit: '% Deficit',
          min: 0,
          max: 100,
          colorRamp: ['#0284c7', '#0d9488', '#f59e0b', '#dc2626'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const palikaName = props.name || '';

          const micro = getPalikaMicroClimate(
            palikaName,
            currentRainMm ?? 0,
            currentTempC ?? 0,
            climateMonth ?? 7,
            pData?.elevation
          );

          const stressRes = evaluateCropWaterStress({
            cropId,
            season: waterSeason,
            annualRainMm: pData?.rainfallMm ?? 0,
            avgTempC: pData?.avgTempC ?? 0,
            monthlyRainMm: micro.monthlyRainMm,
            monthlyTempC: micro.monthlyTempC,
          });

          const snippet = `
            <div style="font-size: 10px; margin-top: 2px;">
              <div style="color: ${stressRes.color}; font-weight: 700;">
                ${cropMeta.emoji} ${cropMeta.name}: <strong>${stressRes.stressScorePct}% Moisture Stress</strong>
              </div>
              <div style="color: #0284c7; font-size: 9px; font-weight: 600; margin-top: 1px;">
                📅 <strong>Period:</strong> ${seasonTitles[waterSeason]}
              </div>
              <div style="color: #475569; font-size: 9px; margin-top: 2px;">
                💧 Water Footprint: <strong>${cropMeta.waterFootprintLitersPerKg.toLocaleString()} L/kg</strong>
              </div>
              <div style="font-size: 9px; color: #334155; margin-top: 1px;">
                🌧️ Rain: <strong>${stressRes.receivedRainMm} mm</strong> | 📈 Demand: <strong>${stressRes.demandMm} mm</strong>
              </div>
              <div style="color: #b45309; font-size: 9px; margin-top: 1px;">
                ${stressRes.irrigationNeededMm > 0 ? `🚨 Deficit: ~${stressRes.irrigationNeededMm} mm irrigation required` : `✅ Rainfed Sufficient (No critical deficit)`}
              </div>
              <div style="color: #64748b; font-size: 8.5px; margin-top: 2px; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 2px;">
                ${stressRes.summaryText}
              </div>
            </div>
          `;

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: stressRes.stressScorePct,
            formattedValue: `${stressRes.stressScorePct}%`,
            color: stressRes.color,
            tooltipHtml: snippet,
            raw: {
              ...pData,
              stressRes,
            },
          };
        }
      } else if (foodMode === 'land_typology') {
        const landMetric = subFilters.landMetric || 'khet_pct';
        const landholdingMap = (palikaLandholdingData as any).palikas || {};

        metricConfig = {
          metricKey: `land_typology_${landMetric}`,
          pillar: 'food',
          label: landMetric === 'khet_pct' ? 'Lowland Irrigated Terraces (Khet)'
               : landMetric === 'bari_pct' ? 'Sloping Rainfed Terraces (Bari)'
               : 'Average Parcels per Holding',
          unit: landMetric === 'parcel_density' ? 'parcels' : '%',
          min: landMetric === 'parcel_density' ? 2.5 : 5,
          max: landMetric === 'parcel_density' ? 4.5 : 95,
          colorRamp: landMetric === 'khet_pct' ? ['#fde68a', '#86efac', '#10b981', '#047857']
                   : landMetric === 'bari_pct' ? ['#a7f3d0', '#fde047', '#f59e0b', '#d97706']
                   : ['#e0e7ff', '#a5b4fc', '#6366f1', '#4338ca'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = props.name || '';
          const matched = landholdingMap[pName] ||
            Object.entries(landholdingMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1] || {};

          const khetPct = matched.khetPercentage ?? 0;
          const bariPct = matched.bariPercentage ?? 0;
          const khetHa = matched.khetLandHa ?? 0;
          const bariHa = matched.bariLandHa ?? 0;
          const parcels = matched.avgParcelsPerHolding ?? 0;
          const totalHoldings = matched.agriculturalHoldings2021 ?? 0;

          let displayVal = khetPct;
          let formattedVal = `${khetPct}%`;
          let color = khetPct >= 30 ? '#047857' : khetPct >= 20 ? '#10b981' : khetPct >= 10 ? '#f59e0b' : '#d97706';

          if (landMetric === 'bari_pct') {
            displayVal = bariPct;
            formattedVal = `${bariPct}%`;
            color = bariPct >= 90 ? '#d97706' : bariPct >= 80 ? '#f59e0b' : bariPct >= 70 ? '#10b981' : '#047857';
          } else if (landMetric === 'parcel_density') {
            displayVal = parcels;
            formattedVal = `${parcels} parcels`;
            color = parcels >= 3.8 ? '#4338ca' : parcels >= 3.4 ? '#6366f1' : parcels >= 3.0 ? '#a5b4fc' : '#e0e7ff';
          }

          const snippet = `
            <div style="font-size: 10px; margin-top: 2px;">
              <div style="color: #047857; font-weight: 700;">
                🌾 Land Typology & Terraces (NSO 2021)
              </div>
              <div style="font-size: 9.5px; color: #334155; margin-top: 3px; line-height: 1.4;">
                <div>🌊 <strong>Khet (Irrigated):</strong> ${khetPct}% (${Math.round(khetHa)} ha)</div>
                <div>⛰️ <strong>Bari (Rainfed):</strong> ${bariPct}% (${Math.round(bariHa)} ha)</div>
                <div>🧩 <strong>Parcel Fragmentation:</strong> ${parcels} parcels/holding (${totalHoldings.toLocaleString()} holdings)</div>
              </div>
              <div style="color: #64748b; font-size: 8.5px; margin-top: 3px; border-top: 1px dashed #cbd5e1; padding-top: 2px;">
                Source: National Sample Census of Agriculture 2021/22 (NSO Nepal)
              </div>
            </div>
          `;

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: displayVal,
            formattedValue: formattedVal,
            color,
            tooltipHtml: snippet,
            raw: matched,
          };
        }
      } else if (foodMode === 'barkhe_summer' || foodMode === 'hiunde_winter' || foodMode === 'double_cropping') {
        // Backward-compatible fallback for legacy presets
        const isBarkhe = foodMode === 'barkhe_summer';
        const isHiunde = foodMode === 'hiunde_winter';
        metricConfig = {
          metricKey: foodMode,
          pillar: 'food',
          label: isBarkhe ? 'Barkhe Feasibility' : isHiunde ? 'Hiunde Feasibility' : 'Cropping Intensity',
          unit: '%',
          min: isBarkhe ? 70 : isHiunde ? 80 : 150,
          max: isBarkhe ? 100 : isHiunde ? 100 : 260,
          colorRamp: CHOROPLETH_RAMPS.rdylgn,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const score = isBarkhe ? (pData?.seasonalRotations?.barkhe?.score ?? 0)
                      : isHiunde ? (pData?.seasonalRotations?.hiunde?.score ?? 0)
                      : Math.round(150 + ((pData?.feasibleCropsCount ?? 0) / 11) * 105);
          const color = score >= 85 ? '#047857' : score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: score,
            formattedValue: `${score}%`,
            color,
            tooltipHtml: `<div style="font-size: 10px; color: #047857;"><strong>${props.name}</strong>: ${score}%</div>`,
            raw: pData,
          };
        }
      } else {
        // Default: 🌱 Crop Suitability (Agro-Climatic Fit)
        const cropId = selectedCropId || subFilters.crop || 'coffee';
        const cropMeta = VALIDATED_CROPS[cropId] || VALIDATED_CROPS.coffee;

        metricConfig = {
          metricKey: `crop_${cropId}`,
          pillar: 'food',
          label: `${cropMeta.name} Suitability`,
          unit: '%',
          min: 30,
          max: 100,
          colorRamp: ['#ef4444', '#f59e0b', '#84cc16', '#047857'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const palikaName = props.name || '';

          const micro = getPalikaMicroClimate(
            palikaName,
            currentRainMm ?? 0,
            currentTempC ?? 0,
            climateMonth ?? 7,
            pData?.elevation
          );

          const elevation = pData?.elevation ?? 0;
          const avgAnnualTemp = pData?.avgTempC ?? 0;
          const growingTempC = getCropGrowingSeasonTemp(cropId, avgAnnualTemp);
          const rainMm = pData?.rainfallMm ?? 0;
          const soilPh = pData?.soilPh ?? 0;

          const cropKey = cropId === 'finger_millet' ? 'millet' : cropId === 'large_cardamom' ? 'cardamom' : cropId;
          const surveyedCrop = (pData?.feasibleCrops || []).find((c: any) => c.cropId === cropId || c.cropId === cropKey);

          const evalRes = evaluateCropSuitability(
            cropId,
            growingTempC,
            rainMm,
            elevation,
            soilPh,
            surveyedCrop ? { score: surveyedCrop.score, rating: surveyedCrop.rating, limitingFactor: surveyedCrop.limitingFactor } : undefined
          );

          const ratingLabel = evalRes.surveyRating || evalRes.suitabilityClass.replace('_', ' ').toUpperCase();

          const surveyBadge = evalRes.surveyScore !== undefined
            ? `<div style="color: #0369a1; font-size: 9px; font-weight: 600; margin-top: 1px;">
                🏛️ <strong>Municipal Feasibility:</strong> ${evalRes.surveyScore}% (${evalRes.surveyRating}) · MoFAGA/MoALD
               </div>`
            : `<div style="color: #64748b; font-size: 9px; margin-top: 1px;">
                🌿 <strong>Biophysical Model Score:</strong> ${evalRes.suitabilityScore}% (${ratingLabel})
               </div>`;

          const limitSnippet = evalRes.limitingFactors.length > 0
            ? `<div style="color: #b45309; font-size: 9px; margin-top: 2px;">⚠️ <strong>Limiting:</strong> ${evalRes.limitingFactors.join(', ')}</div>`
            : `<div style="color: #047857; font-size: 9px; margin-top: 2px;">✅ <strong>Optimal:</strong> All agro-climatic criteria within envelope</div>`;

          const treeAudit = `
            <div style="font-size: 8.5px; color: #475569; margin-top: 3px; line-height: 1.35; border-top: 1px dashed #cbd5e1; padding-top: 2px;">
              <div>🌡️ <strong>Temp:</strong> ${growingTempC.toFixed(1)}°C <span style="color:#64748b;">(Opt: ${cropMeta.tempOptimalC[0]}–${cropMeta.tempOptimalC[1]}°C)</span> | 🌧️ <strong>Rain:</strong> ${Math.round(rainMm)}mm</div>
              <div>🧪 <strong>Soil pH:</strong> ${soilPh.toFixed(1)} <span style="color:#64748b;">(Opt: ${cropMeta.soilPhOptimal[0]}–${cropMeta.soilPhOptimal[1]})</span> | ⛰️ <strong>Elevation:</strong> ${elevation}m</div>
            </div>
          `;

          const snippet = `
            <div style="font-size: 10px; margin-top: 2px;">
              <div style="color: ${evalRes.color}; font-weight: 700; font-size: 11px;">
                ${cropMeta.emoji} ${cropMeta.name}: <strong>${evalRes.suitabilityScore}% (${ratingLabel})</strong>
              </div>
              ${surveyBadge}
              ${limitSnippet}
              ${treeAudit}
            </div>
          `;

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: evalRes.suitabilityScore,
            formattedValue: `${evalRes.suitabilityScore}%`,
            color: evalRes.color,
            tooltipHtml: snippet,
            raw: {
              ...pData,
              microClimate: micro,
              growingTempC,
              evalRes,
            },
          };
        }
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
      } else if (wSub === 'spring_vulnerability' || wSub === 'springshed_vulnerability') {
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
          const elev = pData?.elevation ?? 0;
          const rainMm = pData?.rainfallMm ?? 0;
          const riskScore = elev === 0 || rainMm === 0 ? 0 : Math.max(10, Math.min(95, Math.round(((elev - 800) / 1400) * 60 + (1 - rainMm / 2400) * 40)));
          const catColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : riskScore >= 25 ? '#10b981' : riskScore > 0 ? '#059669' : '#94a3b8';

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
      } else if (wSub === 'irrigation_potential') {
        metricConfig = {
          metricKey: 'irrigation_potential',
          pillar: 'water',
          label: 'Lift & Canal Irrigation Feasibility',
          unit: '%',
          min: 30,
          max: 90,
          colorRamp: CHOROPLETH_RAMPS.ylgn,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const elev = pData?.elevation ?? 0;
          const irrScore = elev === 0 ? 0 : elev < 1100 ? 88 : elev < 1400 ? 68 : 38;
          const color = irrScore >= 80 ? '#047857' : irrScore >= 60 ? '#10b981' : irrScore >= 40 ? '#f59e0b' : irrScore > 0 ? '#ef4444' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: irrScore,
            formattedValue: `${irrScore}%`,
            color,
            tooltipHtml: `<div style="color: #047857; font-size: 10px; margin-top: 2px;">
                            🌾 Irrigation Feasibility: <strong>${irrScore}%</strong>
                          </div>`,
            raw: pData,
          };
        }
      } else if (wSub === 'dhm_station') {
        metricConfig = {
          metricKey: 'dhm_station',
          pillar: 'water',
          label: 'DHM Hydro-Meteorological Stations',
          unit: 'Station Domain',
          min: 494,
          max: 1626,
          colorRamp: CHOROPLETH_RAMPS.blues,
        };

        const DHM_PALIKA_MAP: Record<string, { station: string; type: string; elev: number; color: string }> = {
          'resunga': { station: 'Tamghas (#725 Climatology & AWS)', type: 'Climatology / AWS', elev: 1547, color: '#10b981' },
          'musikot': { station: 'Musikot (#722 Precipitation)', type: 'Precipitation', elev: 1353, color: '#0284c7' },
          'ruru': { station: 'Ridi Bazar (#701 Precipitation)', type: 'Precipitation', elev: 494, color: '#0284c7' },
          'chandrakot': { station: 'Anp Chour (#732 Climatology)', type: 'Climatology', elev: 738, color: '#8b5cf6' },
          'satyawati': { station: 'Bharse (#733 Precipitation)', type: 'Precipitation', elev: 1626, color: '#0284c7' },
          'chatrakot': { station: 'Daugha (#734 Precipitation)', type: 'Precipitation', elev: 960, color: '#0284c7' },
          'malika': { station: 'Agimir (#731 Precipitation)', type: 'Precipitation', elev: 1493, color: '#0284c7' },
          'madane': { station: 'Agimir Catchment (#731)', type: 'Precipitation', elev: 1493, color: '#0284c7' },
          'dhurkot': { station: 'Tamghas-Agimir Corridor (#725/#731)', type: 'Climatology/Rain', elev: 1520, color: '#8b5cf6' },
          'isma': { station: 'Musikot-Tamghas Basin (#722)', type: 'Precipitation', elev: 1353, color: '#0284c7' },
          'gulmidarbar': { station: 'Tamghas-Daugha Perimeter (#725/#734)', type: 'Climatology/Rain', elev: 1250, color: '#8b5cf6' },
          'kaligandaki': { station: 'Ridi-Anp Chour Confluence (#701/#732)', type: 'River Gauging', elev: 616, color: '#0284c7' }
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pKey = normalizePalikaName(props.name || '');
          const info = DHM_PALIKA_MAP[pKey] || {
            station: 'Unmapped Station',
            type: 'N/A',
            elev: 0,
            color: '#94a3b8'
          };

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: info.elev,
            formattedValue: info.station,
            color: info.color,
            tooltipHtml: `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">
                            💧 DHM Station: <strong>${info.station}</strong>
                            <div style="color: #64748b; font-size: 9px; margin-top: 1px;">Type: ${info.type} • Gauge Elev: ${info.elev}m masl</div>
                          </div>`,
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
    } else if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_ph';

      if (ecoSub === 'elevation_zones') {
        metricConfig = {
          metricKey: 'elevation_zones',
          pillar: 'ecosystem',
          label: 'Elevation Zone (AMSL)',
          unit: 'm',
          min: 800,
          max: 2000,
          colorRamp: ['#10b981', '#0ea5e9', '#7c3aed', '#4c1d95'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const elev = pData?.elevation ?? 0;
          const color = elev === 0 ? '#94a3b8' : elev >= 1700 ? '#4c1d95' : elev >= 1450 ? '#7c3aed' : elev >= 1100 ? '#0ea5e9' : '#10b981';
          const tier = elev === 0 ? 'Unmapped' : elev >= 1700 ? 'Alpine Ridge' : elev >= 1450 ? 'Cool Temperate' : elev >= 1100 ? 'Mid-Hills' : 'Low Valley';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: elev,
            formattedValue: elev > 0 ? `${elev}m (${tier})` : 'N/A',
            color,
            tooltipHtml: `<div style="color: #7c3aed; font-size: 10px; margin-top: 2px;">
                            🏔️ Elevation: <strong>${elev}m AMSL</strong> (${tier})
                          </div>`,
            raw: pData,
          };
        }
      } else if (ecoSub === 'agroforestry_belt') {
        metricConfig = {
          metricKey: 'agroforestry_belt',
          pillar: 'ecosystem',
          label: 'Community Forest & Canopy Cover',
          unit: '%',
          min: 20,
          max: 70,
          colorRamp: CHOROPLETH_RAMPS.ylgn,
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const elev = pData?.elevation ?? 0;
          const cover = elev === 0 ? 0 : Math.max(25, Math.min(68, Math.round(25 + ((elev - 890) / 1000) * 40)));
          const color = cover >= 60 ? '#047857' : cover >= 40 ? '#10b981' : cover >= 25 ? '#f59e0b' : cover > 0 ? '#ef4444' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: cover,
            formattedValue: `${cover}%`,
            color,
            tooltipHtml: `<div style="color: #047857; font-size: 10px; margin-top: 2px;">
                            🌲 Canopy Cover: <strong>${cover}%</strong>
                          </div>`,
            raw: pData,
          };
        }
      } else if (ecoSub === 'soil_nitrogen') {
        metricConfig = {
          metricKey: 'soil_nitrogen',
          pillar: 'ecosystem',
          label: 'NARC Available Nitrogen (N)',
          unit: '%',
          min: 0.14,
          max: 0.20,
          colorRamp: CHOROPLETH_RAMPS.ylgn,
        };

        const soilMap = (palikaSoilData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = props.name || '';
          const matched = soilMap[pName] ||
            Object.entries(soilMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1] || {
              nitrogenPct: 0,
              phosphorusKgHa: 0,
              potassiumKgHa: 0,
              ph: 0,
            };

          const nVal = matched.nitrogenPct;
          const color = nVal >= 0.175 ? '#047857' : nVal >= 0.165 ? '#10b981' : nVal > 0 ? '#f59e0b' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: nVal,
            formattedValue: `${nVal.toFixed(3)}%`,
            color,
            tooltipHtml: `<div style="color: #047857; font-size: 10px; margin-top: 2px;">
                            🌱 Soil N: <strong>${nVal.toFixed(3)}%</strong> (${nVal >= 0.175 ? 'High' : nVal > 0 ? 'Medium' : 'N/A'})
                            <div style="color: #64748b; font-size: 8.5px; margin-top: 1px;">
                               🔬 NARC 81-Point Lab Observation Inverse Distance Weighted
                            </div>
                          </div>`,
            raw: matched,
          };
        }
      } else if (ecoSub === 'soil_phosphorus') {
        metricConfig = {
          metricKey: 'soil_phosphorus',
          pillar: 'ecosystem',
          label: 'NARC Available Phosphorus (P₂O₅)',
          unit: 'kg/ha',
          min: 120,
          max: 170,
          colorRamp: CHOROPLETH_RAMPS.blues,
        };

        const soilMap = (palikaSoilData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = props.name || '';
          const matched = soilMap[pName] ||
            Object.entries(soilMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1] || {
              nitrogenPct: 0,
              phosphorusKgHa: 0,
              potassiumKgHa: 0,
              ph: 0,
            };

          const pVal = matched.phosphorusKgHa;
          const color = pVal >= 145 ? '#0284c7' : pVal >= 135 ? '#38bdf8' : pVal > 0 ? '#93c5fd' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: pVal,
            formattedValue: `${pVal} kg/ha`,
            color,
            tooltipHtml: `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">
                            🌱 Soil P₂O₅: <strong>${pVal} kg/ha</strong> (${pVal >= 140 ? 'High' : pVal > 0 ? 'Medium' : 'N/A'})
                            <div style="color: #64748b; font-size: 8.5px; margin-top: 1px;">
                               🔬 NARC 81-Point Lab Observation Inverse Distance Weighted
                            </div>
                          </div>`,
            raw: matched,
          };
        }
      } else if (ecoSub === 'soil_potassium') {
        metricConfig = {
          metricKey: 'soil_potassium',
          pillar: 'ecosystem',
          label: 'NARC Available Potassium (K₂O)',
          unit: 'kg/ha',
          min: 220,
          max: 270,
          colorRamp: CHOROPLETH_RAMPS.blues,
        };

        const soilMap = (palikaSoilData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = props.name || '';
          const matched = soilMap[pName] ||
            Object.entries(soilMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1] || {
              nitrogenPct: 0,
              phosphorusKgHa: 0,
              potassiumKgHa: 0,
              ph: 0,
            };

          const kVal = matched.potassiumKgHa;
          const color = kVal >= 250 ? '#0284c7' : kVal >= 235 ? '#38bdf8' : kVal > 0 ? '#93c5fd' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: kVal,
            formattedValue: `${kVal} kg/ha`,
            color,
            tooltipHtml: `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">
                            🌱 Soil K₂O: <strong>${kVal} kg/ha</strong> (${kVal >= 250 ? 'High' : kVal > 0 ? 'Medium' : 'N/A'})
                            <div style="color: #64748b; font-size: 8.5px; margin-top: 1px;">
                               🔬 NARC 81-Point Lab Observation Inverse Distance Weighted
                            </div>
                          </div>`,
            raw: matched,
          };
        }
      } else {
        metricConfig = {
          metricKey: 'soil_ph',
          pillar: 'ecosystem',
          label: 'Topsoil pH Baseline',
          unit: 'pH',
          min: 5.2,
          max: 7.3,
          colorRamp: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const ph = pData?.soilPh ?? 0;
          // NARC & FAO classification matching SUBFILTER_LEGENDS['soil_ph']
          const color =
            ph === 0 ? '#94a3b8' :
            ph < 5.0 ? '#ef4444' :
            ph < 6.0 ? '#f59e0b' :
            ph <= 7.2 ? '#10b981' : '#3b82f6';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: ph,
            formattedValue: ph > 0 ? `${ph.toFixed(1)} pH` : 'N/A',
            color,
            tooltipHtml: `<div style="color: #059669; font-size: 10px; margin-top: 2px;">🧪 Soil pH: <strong>${ph > 0 ? ph.toFixed(1) : 'N/A'}</strong></div>`,
            raw: pData,
          };
        }
      }
    } else if (selectedPillar === 'energy') {
      const eSub = subFilters.energySubFilter || 'hydro_corridor';

      if (eSub === 'solar_irradiance') {
        metricConfig = {
          metricKey: 'solar_irradiance',
          pillar: 'energy',
          label: 'Photovoltaic Power Potential (PVOUT)',
          unit: 'kWh/kWp/d',
          min: 3.90,
          max: 4.30,
          colorRamp: ['#fbbf24', '#f59e0b', '#b45309'],
        };

        const palikaGhiMap = (palikaGhiData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const pName = props.name || '';
          const matchedGhi = palikaGhiMap[pName] || Object.entries(palikaGhiMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1];
          const ghiMean = matchedGhi?.mean ?? 0;
          const ghiMin = matchedGhi?.min ?? 0;
          const ghiMax = matchedGhi?.max ?? 0;
          const opta = matchedGhi?.opta ?? 0;
          const ptCount = matchedGhi?.count ?? 0;
          const color = ghiMean >= 4.25 ? '#b45309' : ghiMean >= 4.10 ? '#f59e0b' : ghiMean > 0 ? '#fbbf24' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: ghiMean,
            formattedValue: ghiMean > 0 ? `${ghiMean} kWh/kWp/d` : 'N/A',
            color,
            tooltipHtml: `<div style="color: #b45309; font-size: 10px; margin-top: 2px;">
                            ⚡ PV Potential: <strong>${ghiMean > 0 ? `${ghiMean} kWh/kWp/day` : 'N/A'}</strong> (Range: ${ghiMin}–${ghiMax} | ${ptCount} Cells)
                            <div style="color: #d97706; font-size: 9.5px; margin-top: 1px;">
                               📐 Optimum Module Tilt: <strong>${opta > 0 ? `${opta}°` : 'N/A'}</strong> (Yearly Generation Maxima)
                            </div>
                          </div>`,
            raw: { ...pData, ghi: matchedGhi },
          };
        }
      } else if (eSub === 'clean_cooking_biomass' || eSub === 'clean_cooking') {
        metricConfig = {
          metricKey: 'clean_cooking',
          pillar: 'energy',
          label: 'Biomass Firewood Reliance (Census 2021)',
          unit: '%',
          min: 55,
          max: 98,
          colorRamp: ['#10b981', '#f59e0b', '#ef4444', '#991b1b'],
        };

        const cookingPalikas = (palikaCookingData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const pName = props.name || '';
          
          // Match palika entry
          const matchedCook = cookingPalikas[pName] || 
            Object.entries(cookingPalikas).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1];

          const fwPct = matchedCook?.firewoodPct ?? 0;
          const fwCount = matchedCook?.firewood ?? 0;
          const totHH = matchedCook?.totalHouseholds ?? 0;
          const lpgCount = matchedCook?.lpg ?? 0;
          const lpgPct = matchedCook?.lpgPct ?? 0;
          const cleanPct = matchedCook?.cleanCookingPct ?? 0;
          const elecCount = (matchedCook?.electricity ?? 0) + (matchedCook?.biogas ?? 0);

          const color = fwPct >= 92 ? '#991b1b' : fwPct >= 85 ? '#ef4444' : fwPct >= 75 ? '#f59e0b' : fwPct > 0 ? '#10b981' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: fwPct,
            formattedValue: `${fwPct}%`,
            color,
            tooltipHtml: `<div style="color: ${color}; font-size: 10px; margin-top: 2px;">
                            🪵 Firewood Reliance: <strong>${fwPct}%</strong> (${fwCount.toLocaleString()} / ${totHH.toLocaleString()} HHs)
                            <div style="color: #0284c7; font-size: 9.5px; margin-top: 1px;">
                               💨 LPG Gas Adoption: <strong>${lpgPct}%</strong> (${lpgCount.toLocaleString()} HHs)
                            </div>
                            <div style="color: #059669; font-size: 9.5px; margin-top: 1px;">
                               ⚡ Clean Fuel (LPG/Elec/Biogas): <strong>${cleanPct}%</strong> (${(lpgCount + elecCount).toLocaleString()} HHs)
                            </div>
                          </div>`,
            raw: { ...pData, cooking: matchedCook },
          };
        }
      } else if (eSub === 'grid_electrification' || eSub === 'grid_reach') {
        metricConfig = {
          metricKey: 'grid_reach',
          pillar: 'energy',
          label: 'NEA Substation Grid Reach',
          unit: 'Hub Voltage',
          min: 1,
          max: 4,
          colorRamp: ['#047857', '#0ea5e9', '#8b5cf6', '#f59e0b'],
        };

        const gridPalikas = (palikaGridData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const pName = props.name || '';
          const matchedGrid = gridPalikas[pName] ||
            Object.entries(gridPalikas).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1];

          const subName = matchedGrid?.substationName || 'Unmapped Substation';
          const subNp = matchedGrid?.substationNepali || 'अवर्गीकृत सबस्टेसन';
          const hubVolt = matchedGrid?.hubVoltage || 'N/A';
          const capMva = matchedGrid?.capacityMVA ?? 0;
          const tierLabel = matchedGrid?.tierLabel || 'Unmapped Grid Tier';
          const tierKey = matchedGrid?.tierKey || 'unmapped';
          const color = matchedGrid?.color || (tierKey === 'hub_132kv' ? '#047857' : tierKey === 'trunk_132kv' ? '#0ea5e9' : tierKey === 'rural_33kv' ? '#8b5cf6' : tierKey === 'hydro_33kv' ? '#f59e0b' : '#94a3b8');
          const distKm = matchedGrid?.feederDistanceKm ?? 0;
          const lossPct = matchedGrid?.lineLossEstimatePct ?? 0;
          const techDetails = matchedGrid?.technicalDetails || 'No official NEA grid connection recorded for this boundary.';

          const rankVal = tierKey === 'hub_132kv' ? 4 : tierKey === 'trunk_132kv' ? 3 : tierKey === 'rural_33kv' ? 2 : 1;

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: rankVal,
            formattedValue: `${subName} (${hubVolt})`,
            color,
            tooltipHtml: `<div style="color: ${color}; font-size: 10px; margin-top: 2px;">
                            ⚡ Servicing Substation: <strong>${subName}</strong>
                            <div style="font-size: 9px; opacity: 0.85;">(${subNp})</div>
                            <div style="color: #0f172a; font-size: 9.5px; margin-top: 2px;">
                               🔌 <strong>${hubVolt}</strong> • Transformer: <strong>${capMva} MVA</strong>
                            </div>
                            <div style="color: #475569; font-size: 9px; margin-top: 1px;">
                              📍 Feeder Route: ~<strong>${distKm} km</strong> | Line Loss Est: ~<strong>${lossPct}%</strong>
                            </div>
                            <div style="color: #64748b; font-size: 8.5px; margin-top: 2px; line-height: 1.25;">
                              ℹ️ ${techDetails}
                            </div>
                          </div>`,
            raw: { ...pData, grid: matchedGrid },
          };
        }
      } else {
        metricConfig = {
          metricKey: 'hydro_capacity',
          pillar: 'energy',
          label: 'Hydropower Installed Capacity',
          unit: 'MW',
          min: 1.5,
          max: 4.8,
          colorRamp: ['#10b981', '#7c3aed', '#4c1d95'],
        };

        for (const feat of features) {
          const props = feat.properties || {};
          const hItem = getHydro(props);
          const capMw = hItem?.total_installed_capacity_MW ?? 0;
          // DOED classification matching SUBFILTER_LEGENDS['hydro_corridor']
          const capKw = capMw * 1000;
          const color =
            capKw >= 1000 ? '#4c1d95' :
            capKw >= 100 ? '#7c3aed' : capKw > 0 ? '#10b981' : '#94a3b8';

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
      }
    } else {
      const sSub = subFilters.socioSubFilter || 'local_governance';

      if (sSub === 'agri_landholding' || sSub === 'landholding') {
        metricConfig = {
          metricKey: 'landholding',
          pillar: 'socioeconomics',
          label: 'Agricultural Landholding per Holding',
          unit: 'Ropani / Holding',
          min: 8.0,
          max: 18.0,
          colorRamp: CHOROPLETH_RAMPS.ylgn,
        };

        const landholdingMap = (palikaLandholdingData as any).palikas || {};

        for (const feat of features) {
          const props = feat.properties || {};
          const pName = props.name || '';
          const matched = landholdingMap[pName] ||
            Object.entries(landholdingMap).find(([k]) => pName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pName.toLowerCase()))?.[1] || {
              avgHoldingRopaniPerHh: 0,
              avgHoldingHaPerHh: 0,
              totalAgriLandHa: 0,
              khetLandHa: 0,
              bariLandHa: 0,
              khetPercentage: 0,
              bariPercentage: 0,
              censusHouseholds2021: 0,
              osmBuildingCount: 0,
            };

          const ropani = matched.avgHoldingRopaniPerHh;
          const color = ropani >= 14.0 ? '#047857' : ropani >= 11.0 ? '#10b981' : ropani > 0 ? '#f59e0b' : '#94a3b8';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: ropani,
            formattedValue: `${ropani} Ropani/HH`,
            color,
            tooltipHtml: `<div style="color: #047857; font-size: 10px; margin-top: 2px;">
                            🚜 Avg Holding: <strong>${ropani} Ropani/HH</strong> (~${matched.avgHoldingHaPerHh} ha)
                            <div style="color: #0284c7; font-size: 9.5px; margin-top: 2px;">
                               🌾 Cultivated Land: <strong>${matched.totalAgriLandHa.toLocaleString()} ha</strong>
                            </div>
                            <div style="color: #475569; font-size: 9px; margin-top: 1px;">
                              • Khet (Lowland/Irrigated): <strong>${matched.khetLandHa.toLocaleString()} ha</strong> (${matched.khetPercentage}%)
                            </div>
                            <div style="color: #475569; font-size: 9px; margin-top: 0.5px;">
                              • Bari (Upland Rainfed): <strong>${matched.bariLandHa.toLocaleString()} ha</strong> (${matched.bariPercentage}%)
                            </div>
                            <div style="color: #64748b; font-size: 8.5px; margin-top: 2px; border-top: 1px dashed #cbd5e1; pt-0.5;">
                              👥 Census HHs: <strong>${matched.censusHouseholds2021.toLocaleString()}</strong> | 🏠 OSM Buildings: <strong>${matched.osmBuildingCount.toLocaleString()}</strong>
                            </div>
                          </div>`,
            raw: matched,
          };
        }
      } else {
        metricConfig = {
          metricKey: 'governance',
          pillar: 'socioeconomics',
          label: 'Local Government Body Classification',
          unit: '',
          min: 0,
          max: 5,
          colorRamp: ['#3730a3', '#4f46e5', '#059669', '#10b981', '#0ea5e9', '#14b8a6'],
        };

        const govLegend = SUBFILTER_LEGENDS['local_governance'];
        const govCategories = govLegend?.categories || [];

        for (const feat of features) {
          const props = feat.properties || {};
          const pData = getProfile(props);
          const pName = (props.name || '').toLowerCase();
          const catIndex = govCategories.findIndex((cat) =>
            (cat.description && cat.description.toLowerCase().includes(pName)) ||
            (pName === 'rurukshetra' && cat.key === 'religious_trade')
          );
          const matchedCat = catIndex >= 0 ? govCategories[catIndex] : null;
          const color = matchedCat?.color || (props.type === 'Nagarpalika' ? '#3730a3' : '#059669');
          const label = matchedCat?.label || props.type || 'Local Body';

          joinedData[props.name] = {
            id: props.id || props.name,
            name: props.name,
            nepaliName: props.nepaliName,
            type: props.type,
            areaSqKm: props.areaSqKm,
            value: catIndex >= 0 ? catIndex + 1 : (props.type === 'Nagarpalika' ? 1 : 0),
            formattedValue: label,
            color,
            tooltipHtml: `<div style="color: ${color}; font-size: 10px; margin-top: 2px;">🏛️ <strong>${label}</strong> (${props.type || 'Palika'})</div>`,
            raw: pData,
          };
        }
      }
    }

    return {
      metricConfig,
      joinedData,
      getColor: (palikaName: string) => joinedData[palikaName]?.color || '#059669',
      getTooltipHtml: (palikaName: string) => joinedData[palikaName]?.tooltipHtml || '',
      getValue: (palikaName: string) => joinedData[palikaName]?.value,
    };
}

export function usePalikaChoropleth(params: UsePalikaChoroplethParams): PalikaChoroplethResult {
  return useMemo(
    () => computePalikaChoropleth(params),
    [
      params.rawGeoJson,
      params.selectedPillar,
      params.subFilters,
      params.selectedCropId,
      params.climateMonth,
      params.currentRainMm,
      params.currentTempC,
    ]
  );
}

