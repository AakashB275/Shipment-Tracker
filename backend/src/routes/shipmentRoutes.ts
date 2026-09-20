import { Router } from 'express';
import { getShipment, getShipments, patchShipmentStatus, postShipment } from '../controllers/shipmentController.js';

export const shipmentRoutes = Router();
shipmentRoutes.get('/', getShipments);
shipmentRoutes.get('/:idOrReference', getShipment);
shipmentRoutes.post('/', postShipment);
shipmentRoutes.patch('/:idOrReference/status', patchShipmentStatus);