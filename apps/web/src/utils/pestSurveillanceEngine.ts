export interface PestDiseaseAlert {
  pestId: string;
  commonName: string;
  scientificName: string;
  targetCrops: string[];
  vectorType: 'Fungal Pathogen' | 'Insect Pest (Leaf-Feeding)' | 'Insect Pest (Sap-Sucking)' | 'Viral / Bacterial Complex' | 'Soil-Borne Nematode/Rot';
  currentThreatLevel: 'High Alert (Outbreak Imminent)' | 'Moderate Surveillance Required' | 'Low Seasonal Risk';
  riskScore: number; // 0 - 100
  degreeDayThermalThresholdGdd: number;
  environmentalBiophysicalTrigger: string;
  potentialYieldLossPct: number;
  symptomsAndDiagnosticSigns: string;
  plantVillageAiDetectionProtocol: string;
  ipmIntegratedManagementAction: string;
  calibratedNexusFactors: {
    gddThermalStatus: string;
    moistureStressModulation: string;
    soilFactorImpact: string;
  };
}

interface RawPestDefinition {
  id: string;
  commonName: string;
  scientificName: string;
  targetCrops: string[];
  vectorType: PestDiseaseAlert['vectorType'];
  baseGddThreshold: number;
  moistureSensitivity: 'Spikes in High Humidity / Rain' | 'Spikes in Dry Moisture Stress' | 'Moderate / Constant';
  soilPhSensitivity?: 'Acidic Soils (<5.5)' | 'Alkaline Soils (>7.5)' | 'Any';
  potentialYieldLossPct: number;
  symptoms: string;
  aiProtocol: string;
  ipmAction: string;
}

const NEPAL_PEST_MASTER_CATALOG: RawPestDefinition[] = [
  // ── RICE / CEREALS ────────────────────────────────────────────────────────
  {
    id: 'rice-blast',
    commonName: 'Rice Blast (Leaf & Neck Blast)',
    scientificName: 'Magnaporthe oryzae',
    targetCrops: ['Rice', 'Paddy', 'Millet', 'Finger Millet'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 1100,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    soilPhSensitivity: 'Acidic Soils (<5.5)',
    potentialYieldLossPct: 38.0,
    symptoms: 'Diamond spindle-shaped lesions with whitish-grey centres on leaves, black girdling lesions at panicle base (neck rot causing blank grains).',
    aiProtocol: 'Leaf diagnostic pattern recognition via PlantVillage Nepal image pipeline (98.4% model accuracy).',
    ipmAction: 'Adopt certified blast-resistant seeds (Khumal-18, Sukhadhan-6), avoid excessive basal urea, and apply Tricyclazole 75 WP (0.6g/L) at boot stage.',
  },
  {
    id: 'rice-blb',
    commonName: 'Bacterial Leaf Blight (BLB)',
    scientificName: 'Xanthomonas oryzae pv. oryzae',
    targetCrops: ['Rice', 'Paddy'],
    vectorType: 'Viral / Bacterial Complex',
    baseGddThreshold: 1250,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 30.0,
    symptoms: 'Water-soaked wavy yellowish lesions along leaf margins spreading downwards, bacterial ooze beads on young morning leaves.',
    aiProtocol: 'Symptom matching via NARC NRRP Khumaltar digital extension portal.',
    ipmAction: 'Drain stagnant field water for 3–4 days, balance nitrogen with higher potassium (MOP), apply Streptocycline (1g in 10L water).',
  },
  {
    id: 'rice-bph',
    commonName: 'Brown Planthopper (BPH)',
    scientificName: 'Nilaparvata lugens',
    targetCrops: ['Rice', 'Paddy'],
    vectorType: 'Insect Pest (Sap-Sucking)',
    baseGddThreshold: 1300,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 45.0,
    symptoms: 'Circular patches of drying and lodged plants termed "hopper burn" in dense irrigated crop canopies.',
    aiProtocol: 'Stem base photo inspection on PlantVillage Nepal mobile app.',
    ipmAction: 'Alternate wetting and drying (AWD) water management, conserve predatory mirid bugs (Cyrtorhinus), spray Pymetrozine 50 WG (0.6g/L).',
  },

  // ── MAIZE ─────────────────────────────────────────────────────────────────
  {
    id: 'faw-spodoptera',
    commonName: 'Fall Armyworm (FAW)',
    scientificName: 'Spodoptera frugiperda',
    targetCrops: ['Maize', 'Corn', 'Sweetcorn', 'Sorghum', 'Millet'],
    vectorType: 'Insect Pest (Leaf-Feeding)',
    baseGddThreshold: 1350,
    moistureSensitivity: 'Moderate / Constant',
    potentialYieldLossPct: 55.0,
    symptoms: 'Window-paning on leaf whorls, heavy sawdust-like fecal frass accumulation in funnels, larval feeding on developing cobs.',
    aiProtocol: 'Upload close-up photo of leaf funnel to PlantVillage Nepal app for automated CNN verification.',
    ipmAction: 'Deploy Spodoptera sex pheromone traps (5 traps/ha) + apply bio-pesticide Bacillus thuringiensis (Bt) or Spinosad 45 SC (0.3ml/L).',
  },
  {
    id: 'maize-turcicum',
    commonName: 'Turcicum Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    targetCrops: ['Maize', 'Corn'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 1050,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 35.0,
    symptoms: 'Large elliptical greyish-green to tan necrosis streaks parallel to leaf veins leading to premature canopy dieback.',
    aiProtocol: 'Leaf necrosis scanner via National Maize Research Program (NMRP) Rampur.',
    ipmAction: 'Plant resistant hybrid varieties (Poshilo Makai-2, Rampur Hybrid-10), spray Mancozeb 75 WP (2.5g/L).',
  },

  // ── WHEAT & BARLEY ────────────────────────────────────────────────────────
  {
    id: 'wheat-yellow-rust',
    commonName: 'Yellow / Stripe Rust (Haldi Rog)',
    scientificName: 'Puccinia striiformis f. sp. tritici',
    targetCrops: ['Wheat', 'Barley'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 850,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 50.0,
    symptoms: 'Linear yellow-orange powdery pustule stripes parallel to leaf veins, releasing dust on fingers when touched.',
    aiProtocol: 'Rust leaf scan matching via CIMMYT-NARC Global Rust Reference Center protocols.',
    ipmAction: 'Sow resistant varieties (WK-1204, Banganga, Tilottama), spray Propiconazole 25 EC (Tilt @ 1ml/L) at first sign of pustules.',
  },
  {
    id: 'wheat-aphid',
    commonName: 'Wheat Aphid Complex (Lahi)',
    scientificName: 'Rhopalosiphum padi & Sitobion avenae',
    targetCrops: ['Wheat', 'Barley'],
    vectorType: 'Insect Pest (Sap-Sucking)',
    baseGddThreshold: 900,
    moistureSensitivity: 'Spikes in Dry Moisture Stress',
    potentialYieldLossPct: 25.0,
    symptoms: 'Dense colonies of green aphids clustering on ear heads and flag leaves, secreting sticky honeydew attracting sooty mold.',
    aiProtocol: 'Earhead colony density scanner on PlantVillage.',
    ipmAction: 'Conserve coccinellid ladybird beetles, spray botanical Azadirachtin (Neem 1500 ppm @ 3ml/L) or Dimethoate 30 EC (1.5ml/L).',
  },

  // ── MUSTARD & OILSEEDS ───────────────────────────────────────────────────
  {
    id: 'mustard-aphid',
    commonName: 'Mustard Aphid (Lahi Kera)',
    scientificName: 'Lipaphis erysimi',
    targetCrops: ['Mustard', 'Rapeseed', 'Tori', 'Sarson', 'Sunflower'],
    vectorType: 'Insect Pest (Sap-Sucking)',
    baseGddThreshold: 800,
    moistureSensitivity: 'Spikes in Dry Moisture Stress',
    potentialYieldLossPct: 65.0,
    symptoms: 'Massive colonies suffocating inflorescences, curling tender leaves, causing stunted pod formation with shriveled seeds.',
    aiProtocol: 'Inflorescence clustering image recognition via Oilseed Research Program Nawalpur.',
    ipmAction: 'Early sowing (Kartik 1st–2nd week) to escape peak aphid flight, install yellow sticky traps (15 traps/ha), spray Oxydemeton-methyl (1ml/L).',
  },
  {
    id: 'mustard-alternaria',
    commonName: 'Alternaria Leaf & Pod Blight',
    scientificName: 'Alternaria brassicae',
    targetCrops: ['Mustard', 'Rapeseed', 'Tori', 'Cole Crops', 'Cauliflower', 'Cabbage'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 950,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 32.0,
    symptoms: 'Concentric dark brown target-board circular spots on lower leaves spreading to siliquae pods causing seed shattering.',
    aiProtocol: 'Concentric target leaf symptom classifier.',
    ipmAction: 'Seed treatment with Trichoderma viride (5g/kg seed), spray Iprodione 50 WP (2g/L) or Mancozeb.',
  },

  // ── PULSES & LENTILS ──────────────────────────────────────────────────────
  {
    id: 'lentil-stemphylium',
    commonName: 'Stemphylium Blight of Lentil',
    scientificName: 'Stemphylium botryosum',
    targetCrops: ['Lentil', 'Musuro', 'Chickpea', 'Blackgram', 'Soybean'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 900,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 60.0,
    symptoms: 'Pinhead brown spots rapidly enlarging into irregular leaf blights, defoliation leaving bare twigs under heavy morning fog.',
    aiProtocol: 'Foliar blight scanner via National Grain Legumes Research Program (NGLRP) Khajura.',
    ipmAction: 'Plant tolerant cultivars (Shital, Khajura-2, Sagun), prophylactic foliar spray of Chlorothalonil (2g/L) before canopy closure.',
  },
  {
    id: 'pulse-pod-borer',
    commonName: 'Gram Pod Borer',
    scientificName: 'Helicoverpa armigera',
    targetCrops: ['Lentil', 'Chickpea', 'Chana', 'Soybean', 'Pigeonpea', 'Tomato'],
    vectorType: 'Insect Pest (Leaf-Feeding)',
    baseGddThreshold: 1150,
    moistureSensitivity: 'Moderate / Constant',
    potentialYieldLossPct: 40.0,
    symptoms: 'Circular neat entry holes bored into developing green pods with larvae feeding with head thrust inside the pod.',
    aiProtocol: 'Pod perforation visual recognition model.',
    ipmAction: 'Deploy Helicoverpa pheromone traps (Helilure @ 5 traps/ha) + spray Nuclear Polyhedrosis Virus (HaNPV @ 250 LE/ha).',
  },

  // ── POTATO & TOMATO / HORTICULTURE ───────────────────────────────────────
  {
    id: 'late-blight-solanaceae',
    commonName: 'Late Blight (Daduwa Rog)',
    scientificName: 'Phytophthora infestans',
    targetCrops: ['Potato', 'Tomato', 'Aalu', 'Golbheda', 'Eggplant', 'Chilli', 'Capsicum'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 900,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    soilPhSensitivity: 'Acidic Soils (<5.5)',
    potentialYieldLossPct: 75.0,
    symptoms: 'Water-soaked purplish-brown lesions with white cottony mildew on leaf undersides on foggy mornings, rotten tubers with brown dry decay.',
    aiProtocol: 'Late Blight AI Diagnostic module developed with CIP and NARC NPRP Khumaltar.',
    ipmAction: 'Plant field-resistant Janakdev or Kufri Jyoti potato, apply systemic Cymoxanil + Mancozeb (2.5g/L) before monsoon cloudbursts.',
  },
  {
    id: 'tuta-absoluta',
    commonName: 'Tomato Leafminer / Pinworm',
    scientificName: 'Tuta absoluta',
    targetCrops: ['Tomato', 'Golbheda', 'Potato', 'Eggplant'],
    vectorType: 'Insect Pest (Leaf-Feeding)',
    baseGddThreshold: 1200,
    moistureSensitivity: 'Moderate / Constant',
    potentialYieldLossPct: 80.0,
    symptoms: 'Blotchy irregular translucent mines on leaves, pinholes on tomato fruits near calyx with black frass contamination.',
    aiProtocol: 'Tomato foliar mine geometry detection via PlantVillage Nepal.',
    ipmAction: 'Install Tuta lure pheromone water traps (10/ha), install 40-mesh insect netting in polyhouses, spray Bacillus thuringiensis (Bt).',
  },

  // ── GINGER & SPICES ──────────────────────────────────────────────────────
  {
    id: 'ginger-rhizome-rot',
    commonName: 'Ginger Soft Rot / Rhizome Rot',
    scientificName: 'Pythium aphanidermatum & Ralstonia solanacearum',
    targetCrops: ['Ginger', 'Turmeric', 'Aduwa', 'Besar', 'Cardamom'],
    vectorType: 'Soil-Borne Nematode/Rot',
    baseGddThreshold: 1100,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    soilPhSensitivity: 'Acidic Soils (<5.5)',
    potentialYieldLossPct: 65.0,
    symptoms: 'Yellowing of lower leaf margins spreading upward, pseudostem collar soft and water-soaked, foul-smelling rotting rhizomes.',
    aiProtocol: 'Collar rot symptom verification with Ginger Research Program Kapurkot.',
    ipmAction: 'Construct raised beds (15–20cm high) for rapid drainage, solarize soil with clear plastic, treat seed rhizomes with Trichoderma.',
  },
  {
    id: 'cardamom-viral-complex',
    commonName: 'Cardamom Chirke & Furkey Viral Complex',
    scientificName: 'Cardamom Bushy Dwarf Virus (CBDV) & Macluravirus',
    targetCrops: ['Cardamom', 'Large Cardamom', 'Alainchi'],
    vectorType: 'Viral / Bacterial Complex',
    baseGddThreshold: 850,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 50.0,
    symptoms: 'Chirke: Mosaic mosaic flecking parallel to veins; Furkey: Stunted bushy clump proliferation with sterile rosettes.',
    aiProtocol: 'Cardamom canopy mosaic scanner via CDC Fikkal Ilam.',
    ipmAction: 'Immediate eradication and burning of infected clumps, vector aphid control using mineral oil sprays, plant virus-free tissue culture seedlings.',
  },

  // ── TEA & COFFEE ──────────────────────────────────────────────────────────
  {
    id: 'tea-red-spider-mite',
    commonName: 'Tea Red Spider Mite',
    scientificName: 'Oligonychus coffeae',
    targetCrops: ['Tea', 'Coffee', 'Chiya', 'Kafi'],
    vectorType: 'Insect Pest (Sap-Sucking)',
    baseGddThreshold: 1000,
    moistureSensitivity: 'Spikes in Dry Moisture Stress',
    potentialYieldLossPct: 35.0,
    symptoms: 'Rusty copper-bronze discoloration on upper leaf surfaces along main veins, fine webbing, premature defoliation in dry springs.',
    aiProtocol: 'Tea leaf bronzing index on National Tea and Coffee Development Board app.',
    ipmAction: 'Ensure adequate shade tree canopy (Albizia), spray wettable sulphur 80 WP (2.5g/L) or neem extract during dry spells.',
  },
  {
    id: 'coffee-stem-borer',
    commonName: 'Coffee White Stem Borer',
    scientificName: 'Xylotrechus quadripes',
    targetCrops: ['Coffee', 'Kafi'],
    vectorType: 'Insect Pest (Leaf-Feeding)',
    baseGddThreshold: 1100,
    moistureSensitivity: 'Moderate / Constant',
    potentialYieldLossPct: 60.0,
    symptoms: 'Ridges and rings forming on main stem bark, bore holes with wood frass, wilting of top branches and stem dieback.',
    aiProtocol: 'Coffee trunk bark ring visual inspection protocol.',
    ipmAction: 'Maintain 50% shade cover over coffee bushes, bark tracing and stem swabbing with 10% lime wash + neem oil before October flight.',
  },

  // ── FRUITS (APPLE & CITRUS) ───────────────────────────────────────────────
  {
    id: 'apple-scab',
    commonName: 'Apple Scab (Syau ko Khosta Rog)',
    scientificName: 'Venturia inaequalis',
    targetCrops: ['Apple', 'Syau', 'Pear', 'Peach'],
    vectorType: 'Fungal Pathogen',
    baseGddThreshold: 750,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    potentialYieldLossPct: 55.0,
    symptoms: 'Olive-green velvety spots on young spring leaves turning into dark brown scabby corky lesions and cracks on apple fruits.',
    aiProtocol: 'Apple fruit scab image detection via Temperate Horticulture Centre Marpha.',
    ipmAction: 'Post-harvest urea spray (5%) to accelerate fallen leaf decomposition, apply Dodine 65 WP or Captan 50 WP (2g/L) at pink bud stage.',
  },
  {
    id: 'citrus-hlb-psyllid',
    commonName: 'Citrus Greening (HLB) & Asian Citrus Psyllid',
    scientificName: 'Candidatus Liberibacter asiaticus & Diaphorina citri',
    targetCrops: ['Citrus', 'Orange', 'Mandarin', 'Suntala', 'Junar', 'Lemon'],
    vectorType: 'Viral / Bacterial Complex',
    baseGddThreshold: 1200,
    moistureSensitivity: 'Moderate / Constant',
    potentialYieldLossPct: 70.0,
    symptoms: 'Asymmetrical blotchy mottle chlorosis across leaf veins, upright twig dieback, small misshapen lopsided bitter fruits remaining green.',
    aiProtocol: 'Citrus foliar mottle pattern recognition via National Citrus Research Program Paripatle.',
    ipmAction: 'Use certified disease-free grafted saplings from screen houses, control vector psyllid using yellow sticky traps and Imidacloprid (0.5ml/L).',
  },

  // ── COLE CROPS (CAULIFLOWER / CABBAGE) ─────────────────────────────────────
  {
    id: 'dbm-cauliflower',
    commonName: 'Diamondback Moth (DBM)',
    scientificName: 'Plutella xylostella',
    targetCrops: ['Cauliflower', 'Cabbage', 'Broccoli', 'Cole Crops', 'Kauli', 'Banda'],
    vectorType: 'Insect Pest (Leaf-Feeding)',
    baseGddThreshold: 950,
    moistureSensitivity: 'Spikes in Dry Moisture Stress',
    potentialYieldLossPct: 60.0,
    symptoms: 'Numerous small shot-holes eaten through leaves, delicate silk webbing, small green larvae wriggling backwards when disturbed.',
    aiProtocol: 'Cole crop windowing and larval classifier on PlantVillage.',
    ipmAction: 'Intercrop with Indian mustard as a trap crop (2 rows mustard every 25 rows cabbage), spray Bt (Dipel @ 1.5g/L) or Spinetoram.',
  },
  {
    id: 'clubroot-brassica',
    commonName: 'Clubroot of Crucifers',
    scientificName: 'Plasmodiophora brassicae',
    targetCrops: ['Cauliflower', 'Cabbage', 'Broccoli', 'Cole Crops', 'Mustard'],
    vectorType: 'Soil-Borne Nematode/Rot',
    baseGddThreshold: 850,
    moistureSensitivity: 'Spikes in High Humidity / Rain',
    soilPhSensitivity: 'Acidic Soils (<5.5)',
    potentialYieldLossPct: 50.0,
    symptoms: 'Daytime wilting of leaves followed by nighttime recovery, massive spindle-shaped gall swellings (clubs) on roots restricting water uptake.',
    aiProtocol: 'Root gall symptom identification with Horticulture Research Division.',
    ipmAction: 'Apply agricultural agricultural lime (CaCO3 @ 2.5 t/ha) to raise soil pH above 7.2, rotate with non-brassica crops for 4+ years.',
  },
];

export function computePestSurveillance(
  districtName: string,
  cropName: string,
  gddAccumulation: number,
  waterStressIndex: number = 35,
  soilPh: number = 6.2,
  soilTexture: string = 'Sandy Loam'
): PestDiseaseAlert[] {
  const normCrop = cropName.toLowerCase();

  // Find all matched pests for this crop
  const matched = NEPAL_PEST_MASTER_CATALOG.filter(pest => {
    return pest.targetCrops.some(t => {
      const normT = t.toLowerCase();
      return normCrop.includes(normT) || normT.includes(normCrop);
    });
  });

  // Fallback: If niche crop without specific match, associate with broad agronomic family
  let selectedPests = matched;
  if (selectedPests.length === 0) {
    if (normCrop.includes('cereal') || normCrop.includes('grain')) {
      selectedPests = NEPAL_PEST_MASTER_CATALOG.filter(p => p.id === 'faw-spodoptera' || p.id === 'rice-blast');
    } else if (normCrop.includes('vegetable') || normCrop.includes('fruit')) {
      selectedPests = NEPAL_PEST_MASTER_CATALOG.filter(p => p.id === 'late-blight-solanaceae' || p.id === 'dbm-cauliflower');
    } else if (normCrop.includes('spice') || normCrop.includes('cash')) {
      selectedPests = NEPAL_PEST_MASTER_CATALOG.filter(p => p.id === 'ginger-rhizome-rot' || p.id === 'cardamom-viral-complex');
    } else {
      // General resilient pest profile
      selectedPests = [NEPAL_PEST_MASTER_CATALOG[0], NEPAL_PEST_MASTER_CATALOG[3]];
    }
  }

  // Calculate Biophysical Composite Risk for each vector
  return selectedPests.map(pest => {
    let score = 40; // Base baseline surveillance score

    // 1. GDD Thermal Accumulation Modulation
    let gddStatus = 'Thermal window approaching baseline.';
    if (gddAccumulation >= pest.baseGddThreshold) {
      score += 25;
      gddStatus = `Degree-Days (${gddAccumulation} GDD) exceed thermal threshold (${pest.baseGddThreshold} GDD), accelerating generation emergence.`;
    } else {
      score -= 10;
      gddStatus = `Degree-Days (${gddAccumulation} GDD) remain below threshold (${pest.baseGddThreshold} GDD), suppressing rapid reproduction.`;
    }

    // 2. Moisture / Water Stress Modulation
    let moistureStatus = 'Standard ambient seasonal moisture.';
    if (pest.moistureSensitivity === 'Spikes in High Humidity / Rain') {
      if (waterStressIndex < 35) { // High moisture / saturated soil
        score += 25;
        moistureStatus = 'High soil saturation and humidity accelerate fungal zoospore release and foliar infection.';
      } else {
        score -= 15;
        moistureStatus = 'Dry canopy aeration suppresses fungal spore germination.';
      }
    } else if (pest.moistureSensitivity === 'Spikes in Dry Moisture Stress') {
      if (waterStressIndex > 45) { // Dry conditions
        score += 28;
        moistureStatus = 'Dry moisture stress concentrates plant sap sugars, triggering explosive sap-sucking pest proliferation.';
      } else {
        score -= 10;
        moistureStatus = 'Rain showers mechanically wash insect nymphs from foliage.';
      }
    }

    // 3. Soil pH and Soil Texture Modulation
    let soilStatus = 'Soil environment neutral for pathogen persistence.';
    if (pest.soilPhSensitivity === 'Acidic Soils (<5.5)' && soilPh < 5.8) {
      score += 15;
      soilStatus = `Acidic soil pH (${soilPh}) and clay moisture retention strongly favor root rot and damping-off complexes.`;
    } else if (pest.soilPhSensitivity === 'Alkaline Soils (>7.5)' && soilPh > 7.3) {
      score += 12;
      soilStatus = `Calcareous alkaline soil pH (${soilPh}) increases root stress vulnerability.`;
    }

    // Clamp score between 10 and 95
    const clampedScore = Math.max(10, Math.min(95, score));

    let currentThreatLevel: PestDiseaseAlert['currentThreatLevel'] = 'Moderate Surveillance Required';
    if (clampedScore >= 68) {
      currentThreatLevel = 'High Alert (Outbreak Imminent)';
    } else if (clampedScore < 38) {
      currentThreatLevel = 'Low Seasonal Risk';
    }

    return {
      pestId: pest.id,
      commonName: pest.commonName,
      scientificName: pest.scientificName,
      targetCrops: pest.targetCrops,
      vectorType: pest.vectorType,
      currentThreatLevel,
      riskScore: clampedScore,
      degreeDayThermalThresholdGdd: pest.baseGddThreshold,
      environmentalBiophysicalTrigger: pest.moistureSensitivity,
      potentialYieldLossPct: pest.potentialYieldLossPct,
      symptomsAndDiagnosticSigns: pest.symptoms,
      plantVillageAiDetectionProtocol: pest.aiProtocol,
      ipmIntegratedManagementAction: pest.ipmAction,
      calibratedNexusFactors: {
        gddThermalStatus: gddStatus,
        moistureStressModulation: moistureStatus,
        soilFactorImpact: soilStatus,
      },
    };
  });
}
