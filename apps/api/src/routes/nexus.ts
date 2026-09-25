import { Router } from 'express';
import { db } from '@wefes/database';
import { calculateHarvestImpact, simulateScenario } from '@wefes/wefes-engine';
import { AnalyzeRequestSchema, ScenarioRequestSchema, ScenarioParameters } from '@wefes/shared-types';

export const nexusRouter = Router();

// POST /api/v1/nexus/analyze
nexusRouter.post('/analyze', (req, res) => {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.errors });
    }

    const { districtId, cropId, quantity, unit } = parseResult.data;

    const district = db.getDistrictById(districtId);
    if (!district) {
      return res.status(404).json({ success: false, error: `District '${districtId}' not found` });
    }

    const crop = db.getCropById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, error: `Crop '${cropId}' not found` });
    }

    const result = calculateHarvestImpact(district, crop, quantity, unit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/nexus/simulate
nexusRouter.post('/simulate', (req, res) => {
  try {
    const parseResult = ScenarioRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.errors });
    }

    const { districtId, cropId, quantity, unit, parameters } = parseResult.data;

    const district = db.getDistrictById(districtId);
    if (!district) {
      return res.status(404).json({ success: false, error: `District '${districtId}' not found` });
    }

    const crop = db.getCropById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, error: `Crop '${cropId}' not found` });
    }

    const baseline = calculateHarvestImpact(district, crop, quantity, unit);
    const simulatedResult = simulateScenario(baseline, parameters as unknown as ScenarioParameters);

    res.json({ success: true, data: simulatedResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
