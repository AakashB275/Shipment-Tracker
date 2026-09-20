import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initializeDatabase } from './services/db.js';
import { shipmentRoutes } from './routes/shipmentRoutes.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/shipments', shipmentRoutes);
app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
	console.error(error);
	response.status(500).json({ message: 'Internal server error' });
});

initializeDatabase()
	.then(() => app.listen(port, () => console.log(`Shipment API listening on http://localhost:${port}`)))
	.catch((error) => {
		console.error('Could not initialize database', error);
		process.exit(1);
	});
