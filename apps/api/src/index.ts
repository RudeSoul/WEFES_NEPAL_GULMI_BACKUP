import express from 'express';
import cors from 'cors';
import { districtRouter } from './routes/districts';
import { cropRouter } from './routes/crops';
import { nexusRouter } from './routes/nexus';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WEFES Nexus Nepal API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/districts', districtRouter);
app.use('/api/v1/crops', cropRouter);
app.use('/api/v1/nexus', nexusRouter);

app.listen(PORT, () => {
  console.log(`🚀 WEFES Nexus Nepal API Server running on port http://localhost:${PORT}`);
});
