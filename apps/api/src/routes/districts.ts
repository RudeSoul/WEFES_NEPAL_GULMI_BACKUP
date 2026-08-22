import { Router } from 'express';
import { db } from '@wefes/database';

export const districtRouter = Router();

// GET /api/v1/districts - List all 77 districts
districtRouter.get('/', (req, res) => {
  try {
    const districts = db.getAllDistricts();
    res.json({ success: true, count: districts.length, data: districts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/districts/geojson - Nepal 77 Districts GeoJSON
districtRouter.get('/geojson', (req, res) => {
  try {
    const geoJson = db.getGeoJSON();
    res.json(geoJson);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/districts/:id - District detail
districtRouter.get('/:id', (req, res) => {
  try {
    const district = db.getDistrictById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, error: `District '${req.params.id}' not found` });
    }
    res.json({ success: true, data: district });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/districts/:id/crops - District available crops & suitability scores
districtRouter.get('/:id/crops', (req, res) => {
  try {
    const districtCrops = db.getDistrictCrops(req.params.id);
    if (!districtCrops || districtCrops.length === 0) {
      return res.status(404).json({ success: false, error: `District '${req.params.id}' not found` });
    }
    res.json({ success: true, districtId: req.params.id, count: districtCrops.length, data: districtCrops });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
