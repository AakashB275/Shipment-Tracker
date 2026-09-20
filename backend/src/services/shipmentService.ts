import { randomUUID } from 'node:crypto';
import { pool } from './db.js';

const statuses = ['BOOKED', 'IN_TRANSIT', 'CUSTOMS_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const;
type ShipmentStatus = typeof statuses[number];

export interface CreateShipmentInput {
  referenceNumber?: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
  carrier?: string;
  packageType?: string;
  weightKg?: number;
  sender?: string;
  recipient?: string;
  notes?: string;
}

export interface StatusUpdateInput {
  status: ShipmentStatus;
  location: string;
  notes?: string;
  updatedBy?: string;
}

export function isShipmentStatus(value: unknown): value is ShipmentStatus {
  return typeof value === 'string' && statuses.includes(value as ShipmentStatus);
}

const shipmentSelect = `
  SELECT s.id, s.reference_number AS "referenceNumber", s.origin, s.destination,
    s.current_status AS "currentStatus", s.expected_delivery_date AS "expectedDeliveryDate",
    s.carrier, s.package_type AS "packageType", s.weight_kg AS "weightKg",
    s.sender, s.recipient, s.created_at AS "createdAt", s.updated_at AS "updatedAt",
    COALESCE((SELECT json_agg(json_build_object(
      'id', h.id, 'shipmentId', h.shipment_id, 'status', h.status,
      'location', h.location, 'timestamp', h.timestamp, 'notes', h.notes, 'updatedBy', h.updated_by
    ) ORDER BY h.timestamp DESC) FROM shipment_history h WHERE h.shipment_id = s.id), '[]') AS history
  FROM shipments s`;

export async function listShipments() {
  const result = await pool.query(`${shipmentSelect} ORDER BY s.created_at DESC`);
  return result.rows;
}

export async function findShipment(idOrReference: string) {
  const result = await pool.query(`${shipmentSelect} WHERE s.id = $1 OR LOWER(s.reference_number) = LOWER($1)`, [idOrReference]);
  return result.rows[0] ?? null;
}

export async function createShipment(input: CreateShipmentInput) {
  const now = new Date();
  const id = `shp_${randomUUID()}`;
  const referenceNumber = input.referenceNumber?.trim() || `NKG-${now.getUTCFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const shipment = await pool.query(
    `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, package_type, weight_kg, sender, recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
    [id, referenceNumber, input.origin.trim(), input.destination.trim(), input.currentStatus, input.expectedDeliveryDate,
      input.carrier?.trim() || 'Nagarkot Logistics Cargo', input.packageType?.trim() || 'Standard Pallet Cargo',
      input.weightKg || 120, input.sender?.trim() || 'Origin Shipping Depot', input.recipient?.trim() || 'Destination Receiver Hub'],
  );
  await pool.query(
    `INSERT INTO shipment_history (id, shipment_id, status, location, notes, updated_by) VALUES ($1, $2, $3, $4, $5, $6)`,
    [`hist_${randomUUID()}`, shipment.rows[0].id, input.currentStatus, input.origin.trim(), input.notes || `Shipment registered at ${input.origin.trim()}`, 'Operations Desk'],
  );
  return findShipment(id);
}

export async function updateShipmentStatus(idOrReference: string, input: StatusUpdateInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const shipment = await client.query('SELECT id FROM shipments WHERE id = $1 OR LOWER(reference_number) = LOWER($1) FOR UPDATE', [idOrReference]);
    if (!shipment.rowCount) return null;
    const id = shipment.rows[0].id;
    await client.query('UPDATE shipments SET current_status = $1, updated_at = NOW() WHERE id = $2', [input.status, id]);
    await client.query(
      `INSERT INTO shipment_history (id, shipment_id, status, location, notes, updated_by) VALUES ($1, $2, $3, $4, $5, $6)`,
      [`hist_${randomUUID()}`, id, input.status, input.location.trim(), input.notes || `Status updated to ${input.status}`, input.updatedBy || 'Logistics Operator'],
    );
    await client.query('COMMIT');
    return findShipment(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}