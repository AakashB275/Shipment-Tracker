import type { Request, Response } from 'express';
import { createShipment, findShipment, isShipmentStatus, listShipments, updateShipmentStatus } from '../services/shipmentService.js';

export async function getShipments(_request: Request, response: Response) {
  response.json(await listShipments());
}

export async function getShipment(request: Request, response: Response) {
  const idOrReference = String(request.params.idOrReference);
  const shipment = await findShipment(idOrReference);
  if (!shipment) return response.status(404).json({ message: 'Shipment not found' });
  response.json(shipment);
}

export async function postShipment(request: Request, response: Response) {
  const body = request.body;
  if (!body.origin || !body.destination || !body.expectedDeliveryDate || !isShipmentStatus(body.currentStatus)) {
    return response.status(400).json({ message: 'origin, destination, expectedDeliveryDate, and a valid currentStatus are required' });
  }
  const shipment = await createShipment(body);
  response.status(201).json(shipment);
}

export async function patchShipmentStatus(request: Request, response: Response) {
  const body = request.body;
  if (!isShipmentStatus(body.status) || !body.location) {
    return response.status(400).json({ message: 'A valid status and location are required' });
  }
  const shipment = await updateShipmentStatus(String(request.params.idOrReference), body);
  if (!shipment) return response.status(404).json({ message: 'Shipment not found' });
  response.json(shipment);
}