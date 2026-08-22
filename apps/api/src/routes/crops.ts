import { Router } from 'express';
import { db } from '@wefes/database';

export const cropRouter = Router();

// GET /api/v1/crops - List all crop definitions
cropRouter.get('/', (req, res) => {
  try {
    const crops = db.getAllCrops();
    res.json({ success: true, count: crops.length, data: crops });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/crops/:id - Crop detail
cropRouter.get('/:id', (req, res) => {
  try {
    const crop = db.getCropById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, error: `Crop '${req.params.id}' not found` });
    }
    res.json({ success: true, data: crop });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
