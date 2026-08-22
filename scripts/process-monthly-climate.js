const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processClimateData() {
  const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  const allGeoIds = geojson.features.map(f => f.properties.id || f.id);

  const csvPath = path.resolve(process.cwd(), 'data/geojson/district_monthly_climate.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  const years = new Set();

  // Primary raw data map by raw normalized CSV name
  const rawMap = {};

  function normalizeName(rawName) {
    if (!rawName) return '';
    return rawName.trim().toLowerCase().replace(/\s+/g, '_');
  }

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue;

    const parts = line.split(',');
    if (parts.length < 24) continue;

    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const rawName = parts[3];
    const key = normalizeName(rawName);

    if (isNaN(year) || isNaN(month) || !key) continue;

    years.add(year);

    const prectot = parseFloat(parts[6]) || 0; // mm/day -> convert to monthly total mm
    const ps = parseFloat(parts[7]) || 0;     // kPa
    const qv2m = parseFloat(parts[8]) || 0;   // g/kg
    const rh2m = parseFloat(parts[9]) || 0;   // %
    const t2m = parseFloat(parts[10]) || 0;   // C
    const t2mwet = parseFloat(parts[11]) || 0;// C
    const t2mMax = parseFloat(parts[12]) || 0;// C
    const t2mMin = parseFloat(parts[13]) || 0;// C
    const t2mRange = parseFloat(parts[14]) || 0; // C
    const ts = parseFloat(parts[15]) || 0;    // C
    const ws10m = parseFloat(parts[16]) || 0; // m/s
    const ws10mMax = parseFloat(parts[17]) || 0;
    const ws10mMin = parseFloat(parts[18]) || 0;
    const ws10mRange = parseFloat(parts[19]) || 0;
    const ws50m = parseFloat(parts[20]) || 0; // m/s
    const ws50mMax = parseFloat(parts[21]) || 0;
    const ws50mMin = parseFloat(parts[22]) || 0;
    const ws50mRange = parseFloat(parts[23]) || 0;

    // In CSV: 1981-2017 is accumulated monthly mm; 2018-2019 is daily rate in mm/day.
    const monthDays = [31, (year % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const daysInMonth = monthDays[month - 1] || 30;
    const monthlyRainfallMm = year >= 2018
      ? Number((prectot * daysInMonth).toFixed(1))
      : Number(prectot.toFixed(1));
    const dailyRainfallMm = year >= 2018
      ? Number(prectot.toFixed(2))
      : Number((prectot / daysInMonth).toFixed(2));

    if (!rawMap[key]) rawMap[key] = {};
    if (!rawMap[key][year]) rawMap[key][year] = {};

    rawMap[key][year][month] = {
      prectot: monthlyRainfallMm, // Monthly rainfall in mm
      prectotDaily: dailyRainfallMm,
      ps: Number(ps.toFixed(2)),
      qv2m: Number(qv2m.toFixed(2)),
      rh2m: Number(rh2m.toFixed(2)),
      t2m: Number(t2m.toFixed(2)),
      t2mwet: Number(t2mwet.toFixed(2)),
      t2mMax: Number(t2mMax.toFixed(2)),
      t2mMin: Number(t2mMin.toFixed(2)),
      t2mRange: Number(t2mRange.toFixed(2)),
      ts: Number(ts.toFixed(2)),
      ws10m: Number(ws10m.toFixed(2)),
      ws10mMax: Number(ws10mMax.toFixed(2)),
      ws50m: Number(ws50m.toFixed(2)),
      ws50mMax: Number(ws50mMax.toFixed(2))
    };
  }

  const sortedYears = Array.from(years).sort((a, b) => a - b);

  // Mapping from GeoJSON District ID -> Raw CSV Key (with neighbor grid fallbacks)
  const GEO_TO_RAW_MAP = {
    'humla': 'humla',
    'darchula': 'darchula',
    'bajhang': 'bajang',
    'mugu': 'mugu',
    'bajura': 'bajang',
    'baitadi': 'baitadi',
    'dolpa': 'dolpa',
    'jumla': 'jumla',
    'kalikot': 'jumla',
    'doti': 'doti',
    'dadeldhura': 'dadeldhura',
    'achham': 'doti',
    'mustang': 'mustang',
    'dailekh': 'dailekh',
    'jajarkot': 'dailekh',
    'kanchanpur': 'kanchanpur',
    'kailali': 'kailali',
    'western_rukum': 'rukum',
    'surkhet': 'surkhet',
    'manang': 'manang',
    'myagdi': 'myagdi',
    'gorkha': 'gorkha',
    'bardiya': 'bardiya',
    'salyan': 'salyan',
    'baglung': 'baglung',
    'kaski': 'kaski',
    'rolpa': 'rukum',
    'lamjung': 'lamjung',
    'parbat': 'parbat',
    'rasuwa': 'rasuwa',
    'pyuthan': 'arghakhanchi',
    'dhading': 'dhading',
    'banke': 'banke',
    'gulmi': 'gulmi',
    'dang': 'dang',
    'syangja': 'syangja',
    'sindhupalchok': 'dolkha',
    'dolakha': 'dolkha',
    'tanahun': 'tanahun',
    'arghakhanchi': 'arghakhanchi',
    'solukhumbu': 'solukhumbu',
    'nuwakot': 'nuwakot',
    'sankhuwasabha': 'sankhuwasabha',
    'palpa': 'palpa',
    'taplejung': 'taplejung',
    'chitwan': 'chitawan',
    'nawalpur': 'nawalparasi',
    'kapilvastu': 'rupandehi',
    'ramechhap': 'dolkha',
    'kathmandu': 'kathmandu',
    'rupandehi': 'rupandehi',
    'kavrepalanchok': 'kabhre',
    'bhaktapur': 'bhaktapur',
    'makwanpur': 'makwanpur',
    'lalitpur': 'lalitpur',
    'okhaldhunga': 'okhaldhunga',
    'bhojpur': 'sankhuwasabha',
    'parsa': 'bara',
    'sindhuli': 'sindhuli',
    'khotang': 'okhaldhunga',
    'panchthar': 'panchther',
    'bara': 'bara',
    'terhathum': 'terhathum',
    'rautahat': 'routahat',
    'dhankuta': 'dhankuta',
    'sarlahi': 'sarlahi',
    'udayapur': 'udayapur',
    'mahottari': 'mahottari',
    'ilam': 'ilam',
    'dhanusha': 'dhanusa',
    'siraha': 'saptari',
    'saptari': 'saptari',
    'morang': 'morang',
    'sunsari': 'sunsari',
    'jhapa': 'jhapa'
  };

  const finalClimateMap = {};
  for (const geoId of allGeoIds) {
    const rawKey = GEO_TO_RAW_MAP[geoId] || geoId;
    if (rawMap[rawKey]) {
      finalClimateMap[geoId] = rawMap[rawKey];
    }
  }

  // Compute long-term monthly climatology (1981-2019) per district for fast default views
  const climatologyMap = {};
  for (const [geoId, yearData] of Object.entries(finalClimateMap)) {
    climatologyMap[geoId] = {};
    for (let m = 1; m <= 12; m++) {
      let count = 0;
      let sumPrectot = 0, sumPs = 0, sumQv2m = 0, sumRh2m = 0, sumT2m = 0;
      let sumT2mwet = 0, sumT2mMax = 0, sumT2mMin = 0, sumTs = 0, sumWs10m = 0, sumWs50m = 0;

      for (const yr of sortedYears) {
        if (yearData[yr] && yearData[yr][m]) {
          const d = yearData[yr][m];
          sumPrectot += d.prectot;
          sumPs += d.ps;
          sumQv2m += d.qv2m;
          sumRh2m += d.rh2m;
          sumT2m += d.t2m;
          sumT2mwet += d.t2mwet;
          sumT2mMax += d.t2mMax;
          sumT2mMin += d.t2mMin;
          sumTs += d.ts;
          sumWs10m += d.ws10m;
          sumWs50m += d.ws50m;
          count++;
        }
      }

      if (count > 0) {
        climatologyMap[geoId][m] = {
          prectot: Number((sumPrectot / count).toFixed(1)),
          ps: Number((sumPs / count).toFixed(2)),
          qv2m: Number((sumQv2m / count).toFixed(2)),
          rh2m: Number((sumRh2m / count).toFixed(2)),
          t2m: Number((sumT2m / count).toFixed(2)),
          t2mwet: Number((sumT2mwet / count).toFixed(2)),
          t2mMax: Number((sumT2mMax / count).toFixed(2)),
          t2mMin: Number((sumT2mMin / count).toFixed(2)),
          ts: Number((sumTs / count).toFixed(2)),
          ws10m: Number((sumWs10m / count).toFixed(2)),
          ws50m: Number((sumWs50m / count).toFixed(2))
        };
      }
    }
  }

  const outputData = {
    minYear: sortedYears[0],
    maxYear: sortedYears[sortedYears.length - 1],
    years: sortedYears,
    climateMap: finalClimateMap,
    climatologyMap
  };

  const outputPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-climate-monthly.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData), 'utf-8');
  console.log(`Successfully compiled 100% complete climate dataset for all ${Object.keys(finalClimateMap).length} GeoJSON districts!`);
  console.log(`Output file size: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB`);
}

processClimateData().catch(console.error);
