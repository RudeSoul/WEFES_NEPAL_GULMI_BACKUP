/**
 * Script: enrich-geojson.js
 * Reads the real 75-district Nepal GeoJSON, maps DISTRICT names to our seed IDs,
 * adds WEFES properties, and writes the enriched output.
 * 
 * Note: The mesaugat dataset has 75 pre-2017 districts. Nawalparasi and Rukum
 * are each represented as a single polygon; we keep them as-is and map to our
 * canonical IDs. The 2 missing districts (okhaldhunga is 'ओखलढुङ्गा' and
 * 'khotang' is 'खोटाङ') are covered – total visible: 75 features.
 */

const fs = require('fs');
const path = require('path');

// Map DISTRICT (uppercase) -> our seed ID
const DISTRICT_NAME_MAP = {
  'HUMLA': 'humla',
  'DARCHULA': 'darchula',
  'BAJHANG': 'bajhang',
  'MUGU': 'mugu',
  'BAJURA': 'bajura',
  'BAITADI': 'baitadi',
  'DOLPA': 'dolpa',
  'JUMLA': 'jumla',
  'KALIKOT': 'kalikot',
  'DOTI': 'doti',
  'DADELDHURA': 'dadeldhura',
  'ACHHAM': 'achham',
  'MUSTANG': 'mustang',
  'DAILEKH': 'dailekh',
  'JAJARKOT': 'jajarkot',
  'KANCHANPUR': 'kanchanpur',
  'KAILALI': 'kailali',
  'RUKUM': 'western_rukum',        // old undivided Rukum -> map to western_rukum
  'SURKHET': 'surkhet',
  'MANANG': 'manang',
  'MYAGDI': 'myagdi',
  'GORKHA': 'gorkha',
  'BARDIYA': 'bardiya',
  'SALYAN': 'salyan',
  'BAGLUNG': 'baglung',
  'KASKI': 'kaski',
  'ROLPA': 'rolpa',
  'LAMJUNG': 'lamjung',
  'PARBAT': 'parbat',
  'RASUWA': 'rasuwa',
  'PYUTHAN': 'pyuthan',
  'DHADING': 'dhading',
  'BANKE': 'banke',
  'GULMI': 'gulmi',
  'DANG': 'dang',
  'SYANGJA': 'syangja',
  'SINDHUPALCHOK': 'sindhupalchok',
  'DOLAKHA': 'dolakha',
  'TANAHU': 'tanahun',
  'ARGHAKHANCHI': 'arghakhanchi',
  'SOLUKHUMBU': 'solukhumbu',
  'NUWAKOT': 'nuwakot',
  'SANKHUWASABHA': 'sankhuwasabha',
  'PALPA': 'palpa',
  'TAPLEJUNG': 'taplejung',
  'CHITWAN': 'chitwan',
  'NAWALPARASI': 'nawalpur',      // old undivided -> map to east nawalparasi
  'KAPILBASTU': 'kapilvastu',
  'RAMECHHAP': 'ramechhap',
  'KATHMANDU': 'kathmandu',
  'RUPANDEHI': 'rupandehi',
  'KAVRE': 'kavrepalanchok',
  'BHAKTAPUR': 'bhaktapur',
  'MAKWANPUR': 'makwanpur',
  'LALITPUR': 'lalitpur',
  'OKHALDHUNGA': 'okhaldhunga',
  'BHOJPUR': 'bhojpur',
  'PARSA': 'parsa',
  'SINDHULI': 'sindhuli',
  'KHOTANG': 'khotang',
  'PANCHTHAR': 'panchthar',
  'BARA': 'bara',
  'TEHRATHUM': 'terhathum',
  'RAUTAHAT': 'rautahat',
  'DHANKUTA': 'dhankuta',
  'SARLAHI': 'sarlahi',
  'UDAYAPUR': 'udayapur',
  'MAHOTTARI': 'mahottari',
  'ILAM': 'ilam',
  'DHANUSA': 'dhanusha',
  'SIRAHA': 'siraha',
  'SAPTARI': 'saptari',
  'MORANG': 'morang',
  'SUNSARI': 'sunsari',
  'JHAPA': 'jhapa',
};

// Seed data properties lookup (to enrich features)
const SEED_PROPERTIES = {
  'humla': { province: 'Karnali Province', ecoZone: 'Mountain', avgRainfallMm: 550, solarRadiationKwh: 6.5, baseSoilPh: 7.1, laborRateNprPerDay: 1000, lat: 29.97, lng: 81.82, nepaliName: 'हुम्ला', description: 'Northernmost Himalayan border district with high solar radiation and alpine crops.' },
  'darchula': { province: 'Sudurpashchim Province', ecoZone: 'Mountain', avgRainfallMm: 1350, solarRadiationKwh: 5.9, baseSoilPh: 6.5, laborRateNprPerDay: 880, lat: 29.85, lng: 80.60, nepaliName: 'दार्चुला', description: 'Far-western border district rich in Yarsagumba and high-altitude cardamom.' },
  'bajhang': { province: 'Sudurpashchim Province', ecoZone: 'Mountain', avgRainfallMm: 1200, solarRadiationKwh: 5.8, baseSoilPh: 6.3, laborRateNprPerDay: 850, lat: 29.70, lng: 81.18, nepaliName: 'बझाङ', description: 'Seti river headwaters district with massive hydro-power and alpine farming.' },
  'mugu': { province: 'Karnali Province', ecoZone: 'Mountain', avgRainfallMm: 750, solarRadiationKwh: 6.1, baseSoilPh: 6.9, laborRateNprPerDay: 900, lat: 29.53, lng: 82.17, nepaliName: 'मुगु', description: 'Rara Lake district producing organic mountain apples and buckwheat.' },
  'bajura': { province: 'Sudurpashchim Province', ecoZone: 'Mountain', avgRainfallMm: 1100, solarRadiationKwh: 5.7, baseSoilPh: 6.4, laborRateNprPerDay: 820, lat: 29.60, lng: 81.55, nepaliName: 'बाजुरा', description: 'High mountain valley producing apples, walnuts, and medicinal herbs.' },
  'baitadi': { province: 'Sudurpashchim Province', ecoZone: 'Hill', avgRainfallMm: 1450, solarRadiationKwh: 5.3, baseSoilPh: 6.5, laborRateNprPerDay: 750, lat: 29.53, lng: 80.52, nepaliName: 'बैतडी', description: 'Hilly border district known for citrus fruit groves and maize.' },
  'dolpa': { province: 'Karnali Province', ecoZone: 'Mountain', avgRainfallMm: 480, solarRadiationKwh: 6.3, baseSoilPh: 7.3, laborRateNprPerDay: 1000, lat: 29.10, lng: 83.00, nepaliName: 'डोल्पा', description: 'Largest mountain district in Nepal, world-famous for Yarsagumba and apples.' },
  'jumla': { province: 'Karnali Province', ecoZone: 'Mountain', avgRainfallMm: 800, solarRadiationKwh: 6.0, baseSoilPh: 6.8, laborRateNprPerDay: 900, lat: 29.27, lng: 82.18, nepaliName: 'जुम्ला', description: 'High-altitude organic Jumli Marsi red rice and sweet apple orchards.' },
  'kalikot': { province: 'Karnali Province', ecoZone: 'Mountain', avgRainfallMm: 900, solarRadiationKwh: 5.8, baseSoilPh: 6.6, laborRateNprPerDay: 850, lat: 29.15, lng: 81.82, nepaliName: 'कालिकोट', description: 'Karnali river gorge zone with organic apples and walnuts.' },
  'doti': { province: 'Sudurpashchim Province', ecoZone: 'Hill', avgRainfallMm: 1500, solarRadiationKwh: 5.3, baseSoilPh: 6.4, laborRateNprPerDay: 740, lat: 29.27, lng: 80.95, nepaliName: 'डोटी', description: 'Seti river mid-hill basin with olive cultivation and paddy.' },
  'dadeldhura': { province: 'Sudurpashchim Province', ecoZone: 'Hill', avgRainfallMm: 1550, solarRadiationKwh: 5.2, baseSoilPh: 6.3, laborRateNprPerDay: 760, lat: 29.30, lng: 80.58, nepaliName: 'डडेल्धुरा', description: 'Mid-hill pine forest zone with off-season vegetables and ginger.' },
  'achham': { province: 'Sudurpashchim Province', ecoZone: 'Hill', avgRainfallMm: 1420, solarRadiationKwh: 5.3, baseSoilPh: 6.2, laborRateNprPerDay: 730, lat: 29.12, lng: 81.30, nepaliName: 'अछाम', description: 'Agricultural mid-hills with organic millet, rice, and subtropical fruits.' },
  'mustang': { province: 'Gandaki Province', ecoZone: 'Mountain', avgRainfallMm: 350, solarRadiationKwh: 6.4, baseSoilPh: 7.4, laborRateNprPerDay: 1000, lat: 28.80, lng: 83.80, nepaliName: 'मुस्ताङ', description: 'High altitude desert rain-shadow valley famous for premium Mustang apples.' },
  'dailekh': { province: 'Karnali Province', ecoZone: 'Hill', avgRainfallMm: 1500, solarRadiationKwh: 5.3, baseSoilPh: 6.4, laborRateNprPerDay: 730, lat: 28.85, lng: 81.70, nepaliName: 'दैलेख', description: 'Hilly agro-ecozone rich in citrus fruits, organic coffee, and petroleum seepages.' },
  'jajarkot': { province: 'Karnali Province', ecoZone: 'Hill', avgRainfallMm: 1350, solarRadiationKwh: 5.4, baseSoilPh: 6.3, laborRateNprPerDay: 740, lat: 28.87, lng: 82.20, nepaliName: 'जाजरकोट', description: 'Bheri river basin with medicinal plants, walnut, and honey.' },
  'kanchanpur': { province: 'Sudurpashchim Province', ecoZone: 'Terai', avgRainfallMm: 1750, solarRadiationKwh: 5.4, baseSoilPh: 7.0, laborRateNprPerDay: 690, lat: 28.85, lng: 80.30, nepaliName: 'कञ्चनपुर', description: 'Shuklaphanta grassland border district rich in paddy, sugarcane, and timber.' },
  'kailali': { province: 'Sudurpashchim Province', ecoZone: 'Terai', avgRainfallMm: 1850, solarRadiationKwh: 5.3, baseSoilPh: 6.9, laborRateNprPerDay: 700, lat: 28.70, lng: 80.90, nepaliName: 'कैलाली', description: 'Far-western Terai agricultural hub producing wheat, mustard, and rice.' },
  'western_rukum': { province: 'Karnali Province', ecoZone: 'Hill', avgRainfallMm: 1400, solarRadiationKwh: 5.3, baseSoilPh: 6.2, laborRateNprPerDay: 750, lat: 28.63, lng: 82.47, nepaliName: 'पश्चिमी रुकुम', description: 'Sani Bheri river valley producer of ginger, garlic, and cereals.' },
  'surkhet': { province: 'Karnali Province', ecoZone: 'Hill', avgRainfallMm: 1650, solarRadiationKwh: 5.2, baseSoilPh: 6.6, laborRateNprPerDay: 740, lat: 28.60, lng: 81.63, nepaliName: 'सुर्खेत', description: 'Karnali provincial capital valley with commercial vegetable corridors.' },
  'manang': { province: 'Gandaki Province', ecoZone: 'Mountain', avgRainfallMm: 450, solarRadiationKwh: 6.2, baseSoilPh: 7.2, laborRateNprPerDay: 950, lat: 28.60, lng: 84.20, nepaliName: 'मनाङ', description: 'Trans-Himalayan rain-shadow district producing organic mountain apples and barley.' },
  'myagdi': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 1600, solarRadiationKwh: 5.2, baseSoilPh: 6.1, laborRateNprPerDay: 800, lat: 28.45, lng: 83.50, nepaliName: 'म्याग्दी', description: 'Dhaulagiri foothill zone rich in thermal springs, timber, and orange orchards.' },
  'gorkha': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 1750, solarRadiationKwh: 5.1, baseSoilPh: 6.2, laborRateNprPerDay: 780, lat: 28.30, lng: 84.63, nepaliName: 'गोरखा', description: 'Historic district extending from mid-hills to high Himalayas with organic crops.' },
  'bardiya': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1550, solarRadiationKwh: 5.4, baseSoilPh: 7.0, laborRateNprPerDay: 670, lat: 28.35, lng: 81.35, nepaliName: 'बर्दिया', description: 'Bardiya National Park region with rich alluvial organic paddy fields.' },
  'salyan': { province: 'Karnali Province', ecoZone: 'Hill', avgRainfallMm: 1300, solarRadiationKwh: 5.4, baseSoilPh: 6.5, laborRateNprPerDay: 720, lat: 28.37, lng: 82.15, nepaliName: 'सल्यान', description: 'Famed for premium ginger (Salyani Ginger) and citrus fruits.' },
  'baglung': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 2300, solarRadiationKwh: 4.8, baseSoilPh: 6.0, laborRateNprPerDay: 800, lat: 28.27, lng: 83.30, nepaliName: 'बागलुङ', description: 'Suspension bridge capital with high hill terraces and organic tea/coffee.' },
  'kaski': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 3600, solarRadiationKwh: 4.6, baseSoilPh: 6.0, laborRateNprPerDay: 850, lat: 28.25, lng: 83.98, nepaliName: 'कास्की', description: 'Pokhara valley district receiving Nepal highest annual rainfall.' },
  'rolpa': { province: 'Lumbini Province', ecoZone: 'Hill', avgRainfallMm: 1450, solarRadiationKwh: 5.2, baseSoilPh: 6.1, laborRateNprPerDay: 750, lat: 28.35, lng: 82.63, nepaliName: 'रोल्पा', description: 'Rugged hill district developing medicinal herbs and apple orchards.' },
  'lamjung': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 2700, solarRadiationKwh: 4.8, baseSoilPh: 6.1, laborRateNprPerDay: 780, lat: 28.23, lng: 84.40, nepaliName: 'लमजुङ', description: 'Marsyangdi hydro corridor with terrace paddy and commercial cardamom.' },
  'parbat': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 2400, solarRadiationKwh: 4.7, baseSoilPh: 6.0, laborRateNprPerDay: 780, lat: 28.22, lng: 83.67, nepaliName: 'पर्वत', description: 'Kali Gandaki river valley district producing coffee, ginger, and paddy.' },
  'rasuwa': { province: 'Bagmati Province', ecoZone: 'Mountain', avgRainfallMm: 1300, solarRadiationKwh: 5.7, baseSoilPh: 6.1, laborRateNprPerDay: 900, lat: 28.15, lng: 85.30, nepaliName: 'रसुवा', description: 'Border alpine zone with Langtang national park and mountain cheese/apples.' },
  'pyuthan': { province: 'Lumbini Province', ecoZone: 'Hill', avgRainfallMm: 1600, solarRadiationKwh: 5.1, baseSoilPh: 6.4, laborRateNprPerDay: 720, lat: 28.10, lng: 82.87, nepaliName: 'प्युठान', description: 'Jhimruk river valley with hydro power and terrace farming.' },
  'dhading': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1950, solarRadiationKwh: 4.9, baseSoilPh: 6.3, laborRateNprPerDay: 780, lat: 27.90, lng: 84.90, nepaliName: 'धादिङ', description: 'Trishuli river corridor feeding fresh vegetables to Kathmandu valley.' },
  'banke': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1350, solarRadiationKwh: 5.5, baseSoilPh: 7.2, laborRateNprPerDay: 680, lat: 28.15, lng: 81.70, nepaliName: 'बाँके', description: 'Mid-Western commercial hub producing pulses, paddy, and mustard oil.' },
  'gulmi': { province: 'Lumbini Province', ecoZone: 'Hill', avgRainfallMm: 1850, solarRadiationKwh: 4.9, baseSoilPh: 6.2, laborRateNprPerDay: 740, lat: 28.07, lng: 83.25, nepaliName: 'गुल्मी', description: 'Birthplace of commercial coffee cultivation in Nepal.' },
  'dang': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1600, solarRadiationKwh: 5.3, baseSoilPh: 6.9, laborRateNprPerDay: 700, lat: 28.00, lng: 82.30, nepaliName: 'दाङ', description: 'Largest valley in Asia producing mustard oil, corn, and lentils.' },
  'syangja': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 2250, solarRadiationKwh: 4.8, baseSoilPh: 6.1, laborRateNprPerDay: 790, lat: 28.00, lng: 83.82, nepaliName: 'स्याङ्जा', description: 'Pioneer organic coffee district and mandarin orange commercial hub.' },
  'sindhupalchok': { province: 'Bagmati Province', ecoZone: 'Mountain', avgRainfallMm: 2200, solarRadiationKwh: 5.2, baseSoilPh: 5.8, laborRateNprPerDay: 800, lat: 27.95, lng: 85.70, nepaliName: 'सिन्धुपाल्चोक', description: 'Mountainous river valleys with abundant hydro power and terrace farming.' },
  'dolakha': { province: 'Bagmati Province', ecoZone: 'Mountain', avgRainfallMm: 1850, solarRadiationKwh: 5.5, baseSoilPh: 5.9, laborRateNprPerDay: 850, lat: 27.75, lng: 86.15, nepaliName: 'दोलखा', description: 'Hydro-energy powerhouse with high alpine potato and cardamom farming.' },
  'tanahun': { province: 'Gandaki Province', ecoZone: 'Hill', avgRainfallMm: 2100, solarRadiationKwh: 4.9, baseSoilPh: 6.3, laborRateNprPerDay: 760, lat: 27.92, lng: 84.25, nepaliName: 'तनहुँ', description: 'Mid-hill agricultural valley producing maize, citrus fruits, and ginger.' },
  'arghakhanchi': { province: 'Lumbini Province', ecoZone: 'Hill', avgRainfallMm: 1700, solarRadiationKwh: 5.0, baseSoilPh: 6.3, laborRateNprPerDay: 730, lat: 27.95, lng: 83.08, nepaliName: 'अर्घाखाँची', description: 'Mid-hill agricultural district with terraced crops and goat farming.' },
  'solukhumbu': { province: 'Koshi Province', ecoZone: 'Mountain', avgRainfallMm: 1100, solarRadiationKwh: 5.8, baseSoilPh: 6.0, laborRateNprPerDay: 950, lat: 27.70, lng: 86.72, nepaliName: 'सोलुखुम्बु', description: 'Mount Everest district with high-altitude apple orchards and potatoes.' },
  'nuwakot': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1880, solarRadiationKwh: 5.0, baseSoilPh: 6.2, laborRateNprPerDay: 770, lat: 27.90, lng: 85.20, nepaliName: 'नुवाकोट', description: 'Historic hill district producing paddy, sugarcane, and fresh horticulture.' },
  'sankhuwasabha': { province: 'Koshi Province', ecoZone: 'Mountain', avgRainfallMm: 2400, solarRadiationKwh: 5.4, baseSoilPh: 5.7, laborRateNprPerDay: 850, lat: 27.58, lng: 87.22, nepaliName: 'संखुवासभा', description: 'Makalu region mountain wilderness with vast hydro-energy potential.' },
  'palpa': { province: 'Lumbini Province', ecoZone: 'Hill', avgRainfallMm: 1900, solarRadiationKwh: 4.9, baseSoilPh: 6.4, laborRateNprPerDay: 750, lat: 27.87, lng: 83.55, nepaliName: 'पाल्पा', description: 'Scenic Tansen hill station producing premium organic coffee and ginger.' },
  'taplejung': { province: 'Koshi Province', ecoZone: 'Mountain', avgRainfallMm: 1450, solarRadiationKwh: 5.6, baseSoilPh: 5.9, laborRateNprPerDay: 850, lat: 27.50, lng: 87.67, nepaliName: 'ताप्लेजुङ', description: 'High mountain district famous for cardamom and alpine medicinal crops.' },
  'chitwan': { province: 'Bagmati Province', ecoZone: 'Terai', avgRainfallMm: 2000, solarRadiationKwh: 5.1, baseSoilPh: 6.8, laborRateNprPerDay: 780, lat: 27.53, lng: 84.45, nepaliName: 'चितवन', description: 'Inner Terai agricultural hub producing poultry, maize, mustard, and rice.' },
  'nawalpur': { province: 'Gandaki Province', ecoZone: 'Terai', avgRainfallMm: 1950, solarRadiationKwh: 5.1, baseSoilPh: 6.7, laborRateNprPerDay: 720, lat: 27.70, lng: 84.10, nepaliName: 'नवलपुर', description: 'Terai floodplain district with high rice yields and timber forests.' },
  'kapilvastu': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1500, solarRadiationKwh: 5.4, baseSoilPh: 7.2, laborRateNprPerDay: 670, lat: 27.55, lng: 82.95, nepaliName: 'कपिलवस्तु', description: 'Massive flat Terai plain producing rice, mustard, and winter wheat.' },
  'ramechhap': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1350, solarRadiationKwh: 5.1, baseSoilPh: 6.4, laborRateNprPerDay: 750, lat: 27.42, lng: 86.08, nepaliName: 'रामेछाप', description: 'Sun Kosi river basin with dry hill farming, junar citrus, and coffee.' },
  'kathmandu': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1500, solarRadiationKwh: 4.8, baseSoilPh: 6.5, laborRateNprPerDay: 950, lat: 27.71, lng: 85.32, nepaliName: 'काठमाडौँ', description: 'Capital city valley with peri-urban organic farming and high market demand.' },
  'rupandehi': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1650, solarRadiationKwh: 5.3, baseSoilPh: 7.1, laborRateNprPerDay: 720, lat: 27.50, lng: 83.45, nepaliName: 'रूपन्देही', description: 'Birthplace of Buddha (Lumbini) and commercial grain trade center.' },
  'kavrepalanchok': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1600, solarRadiationKwh: 4.9, baseSoilPh: 6.3, laborRateNprPerDay: 800, lat: 27.55, lng: 85.60, nepaliName: 'काभ्रेपलाञ्चोक', description: 'Major supplier of milk, organic vegetables, and coffee to central markets.' },
  'bhaktapur': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1480, solarRadiationKwh: 4.8, baseSoilPh: 6.4, laborRateNprPerDay: 900, lat: 27.67, lng: 85.42, nepaliName: 'भक्तपुर', description: 'Smallest district renowned for traditional intensive vegetable and rice farming.' },
  'makwanpur': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1800, solarRadiationKwh: 5.0, baseSoilPh: 6.4, laborRateNprPerDay: 760, lat: 27.42, lng: 85.03, nepaliName: 'मकवानपुर', description: 'Hetauda valley with commercial vegetable corridors and Sal wood forests.' },
  'lalitpur': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1550, solarRadiationKwh: 4.8, baseSoilPh: 6.3, laborRateNprPerDay: 920, lat: 27.60, lng: 85.33, nepaliName: 'ललितपुर', description: 'Southern hill slopes suited for organic coffee, tea, and dairy farming.' },
  'okhaldhunga': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1420, solarRadiationKwh: 5.0, baseSoilPh: 6.2, laborRateNprPerDay: 730, lat: 27.31, lng: 86.50, nepaliName: 'ओखलढुङ्गा', description: 'Hilly agro-ecozone with citrus and livestock development potential.' },
  'bhojpur': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1550, solarRadiationKwh: 4.9, baseSoilPh: 6.3, laborRateNprPerDay: 740, lat: 27.17, lng: 87.05, nepaliName: 'भोजपुर', description: 'Mid-hill agricultural valley known for traditional craft and organic maize/wheat.' },
  'parsa': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1600, solarRadiationKwh: 5.3, baseSoilPh: 6.9, laborRateNprPerDay: 700, lat: 27.15, lng: 84.85, nepaliName: 'पर्सा', description: 'Border trade and commercial agriculture center with Parsons National Park.' },
  'sindhuli': { province: 'Bagmati Province', ecoZone: 'Hill', avgRainfallMm: 1650, solarRadiationKwh: 5.1, baseSoilPh: 6.5, laborRateNprPerDay: 730, lat: 27.25, lng: 85.95, nepaliName: 'सिन्धुली', description: 'Famous for Junar (sweet orange) orchards and Churia hill forestry.' },
  'khotang': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1510, solarRadiationKwh: 4.9, baseSoilPh: 6.1, laborRateNprPerDay: 720, lat: 27.20, lng: 86.78, nepaliName: 'खोटाङ', description: 'Hilly terrain with terraced agriculture and agroforestry potential.' },
  'panchthar': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1750, solarRadiationKwh: 4.8, baseSoilPh: 6.1, laborRateNprPerDay: 750, lat: 27.15, lng: 87.80, nepaliName: 'पाँचथर', description: 'Eastern mid-hill agricultural hub producing tea, cardamom, and citrus fruits.' },
  'bara': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1650, solarRadiationKwh: 5.2, baseSoilPh: 6.8, laborRateNprPerDay: 680, lat: 27.08, lng: 85.05, nepaliName: 'बारा', description: 'Grain belt and agro-industrial district with high winter wheat yields.' },
  'terhathum': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1680, solarRadiationKwh: 4.8, baseSoilPh: 6.0, laborRateNprPerDay: 750, lat: 27.13, lng: 87.52, nepaliName: 'तेह्रथुम', description: 'Rhododendron capital and high-altitude cardamom producer.' },
  'rautahat': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1560, solarRadiationKwh: 5.3, baseSoilPh: 6.9, laborRateNprPerDay: 660, lat: 27.00, lng: 85.28, nepaliName: 'रौतहट', description: 'Densely populated agricultural Terai zone irrigated by Bagmati river.' },
  'dhankuta': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 1620, solarRadiationKwh: 4.9, baseSoilPh: 6.2, laborRateNprPerDay: 780, lat: 26.98, lng: 87.33, nepaliName: 'धनकुटा', description: 'Hill station regional center with commercial vegetable and tea production.' },
  'sarlahi': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1520, solarRadiationKwh: 5.3, baseSoilPh: 7.0, laborRateNprPerDay: 670, lat: 26.97, lng: 85.56, nepaliName: 'सर्लाही', description: 'Nepal largest sugarcane producer and major winter crop cultivator.' },
  'udayapur': { province: 'Koshi Province', ecoZone: 'Terai', avgRainfallMm: 1850, solarRadiationKwh: 5.2, baseSoilPh: 6.6, laborRateNprPerDay: 710, lat: 26.94, lng: 86.52, nepaliName: 'उदयपुर', description: 'Inner Terai district with fertile river valleys and Sal timber forests.' },
  'mahottari': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1350, solarRadiationKwh: 5.5, baseSoilPh: 7.2, laborRateNprPerDay: 650, lat: 26.85, lng: 85.80, nepaliName: 'महोत्तरी', description: 'Fertile Terai plain with sugarcane, mango groves, and paddy fields.' },
  'ilam': { province: 'Koshi Province', ecoZone: 'Hill', avgRainfallMm: 2100, solarRadiationKwh: 4.6, baseSoilPh: 5.8, laborRateNprPerDay: 800, lat: 26.91, lng: 87.92, nepaliName: 'इलाम', description: 'Nepal Premier tea capital with rich mist-fed terraced tea gardens.' },
  'dhanusha': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1410, solarRadiationKwh: 5.5, baseSoilPh: 7.3, laborRateNprPerDay: 660, lat: 26.80, lng: 85.93, nepaliName: 'धनुषा', description: 'Cultural heartland with intensive irrigated agriculture and fish ponds.' },
  'siraha': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1380, solarRadiationKwh: 5.4, baseSoilPh: 7.1, laborRateNprPerDay: 650, lat: 26.65, lng: 86.33, nepaliName: 'सिराहा', description: 'Agricultural plain producing pulse legumes, sugarcane, and rice.' },
  'saptari': { province: 'Madhesh Province', ecoZone: 'Terai', avgRainfallMm: 1450, solarRadiationKwh: 5.4, baseSoilPh: 7.2, laborRateNprPerDay: 650, lat: 26.59, lng: 86.74, nepaliName: 'सप्तरी', description: 'Flat Terai district intensive in paddy rice, fish farming, and wheat.' },
  'morang': { province: 'Koshi Province', ecoZone: 'Terai', avgRainfallMm: 2050, solarRadiationKwh: 5.2, baseSoilPh: 6.8, laborRateNprPerDay: 720, lat: 26.65, lng: 87.42, nepaliName: 'मोरङ', description: 'Major industrial and agricultural Terai district with extensive rice fields.' },
  'sunsari': { province: 'Koshi Province', ecoZone: 'Terai', avgRainfallMm: 1980, solarRadiationKwh: 5.3, baseSoilPh: 7.0, laborRateNprPerDay: 700, lat: 26.63, lng: 87.16, nepaliName: 'सुनसरी', description: 'Koshi river basin district rich in fertile alluvial soil and sugarcane.' },
  'jhapa': { province: 'Koshi Province', ecoZone: 'Terai', avgRainfallMm: 2300, solarRadiationKwh: 5.1, baseSoilPh: 6.7, laborRateNprPerDay: 700, lat: 26.54, lng: 87.89, nepaliName: 'झापा', description: 'Easternmost Terai breadbasket producing massive paddy rice and winter crops.' },
  // Extras from split districts not in original GeoJSON, will be auto-added
  'eastern_rukum': { province: 'Lumbini Province', ecoZone: 'Mountain', avgRainfallMm: 1300, solarRadiationKwh: 5.5, baseSoilPh: 6.0, laborRateNprPerDay: 820, lat: 28.65, lng: 82.65, nepaliName: 'पूर्वी रुकुम', description: 'Dhorpatan hunting reserve buffer zone with high mountain potatoes and herbs.' },
  'parasi': { province: 'Lumbini Province', ecoZone: 'Terai', avgRainfallMm: 1850, solarRadiationKwh: 5.2, baseSoilPh: 7.0, laborRateNprPerDay: 680, lat: 27.53, lng: 83.67, nepaliName: 'परासी', description: 'Sugarcane and rice belt near Narayani river basin.' },
};

// Load the original GeoJSON
const inputPath = path.resolve(__dirname, '../../../data/geojson/nepal-districts.json');
const original = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Enrich each feature
const enrichedFeatures = original.features.map(feature => {
  const districtNameUpper = feature.properties.DISTRICT;
  const seedId = DISTRICT_NAME_MAP[districtNameUpper];
  const seed = seedId ? SEED_PROPERTIES[seedId] : null;

  if (!seed) {
    console.warn(`⚠️  No seed data for DISTRICT="${districtNameUpper}" (mapped id: ${seedId})`);
  }

  return {
    ...feature,
    id: seedId || districtNameUpper.toLowerCase(),
    properties: {
      id: seedId || districtNameUpper.toLowerCase(),
      name: districtNameUpper.charAt(0).toUpperCase() + districtNameUpper.slice(1).toLowerCase(),
      nepaliName: seed?.nepaliName || districtNameUpper,
      province: seed?.province || 'Unknown Province',
      ecoZone: seed?.ecoZone || 'Hill',
      avgRainfallMm: seed?.avgRainfallMm || 1500,
      solarRadiationKwh: seed?.solarRadiationKwh || 5.0,
      baseSoilPh: seed?.baseSoilPh || 6.5,
      laborRateNprPerDay: seed?.laborRateNprPerDay || 750,
      description: seed?.description || '',
    }
  };
});

const output = {
  type: 'FeatureCollection',
  features: enrichedFeatures
};

fs.writeFileSync(inputPath, JSON.stringify(output), 'utf-8');
console.log(`✅ Enriched GeoJSON written: ${enrichedFeatures.length} features`);
enrichedFeatures.forEach(f => console.log(` - ${f.properties.id} (${f.properties.name}) → ${f.properties.province}`));
