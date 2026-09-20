import 'dotenv/config';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL must be set before starting the shipment API');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      reference_number TEXT NOT NULL UNIQUE,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      current_status TEXT NOT NULL,
      expected_delivery_date DATE NOT NULL,
      carrier TEXT NOT NULL,
      package_type TEXT NOT NULL,
      weight_kg NUMERIC NOT NULL,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS shipment_history (
      id TEXT PRIMARY KEY,
      shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      location TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      notes TEXT,
      updated_by TEXT
    );

    CREATE INDEX IF NOT EXISTS shipment_history_shipment_id_idx
      ON shipment_history (shipment_id, timestamp DESC);
  `);

  const shipmentCount = await pool.query('SELECT COUNT(*)::int AS count FROM shipments');
  if (shipmentCount.rows[0].count > 0) return;

  const seedShipments = [
    ['shp_1', 'NKG-2026-9810', 'Mumbai (BOM), India', 'Rotterdam (RTM), Netherlands', 'IN_TRANSIT', '2026-09-28', 'Maersk Shipping Express', '20ft ISO Refrigerated Container', 14200, 'Nagarkot Exports Pvt Ltd - Nhava Sheva Terminal', 'EuroDistribution B.V. Rotterdam Harbor'],
    ['shp_2', 'NKG-2026-4412', 'New Delhi (DEL), India', 'Frankfurt (FRA), Germany', 'CUSTOMS_HOLD', '2026-09-24', 'Lufthansa Cargo Air Freight', 'Palletized Pharmaceutical Supplies', 1850, 'Sun Pharma Logistics Hub - IGI Cargo Complex', 'BioPharm Central Depot Frankfurt'],
    ['shp_3', 'NKG-2026-1055', 'Chennai (MAA), India', 'Singapore (SIN), Singapore', 'OUT_FOR_DELIVERY', '2026-09-21', 'Nagarkot Express Air Direct', 'High-Tech Precision Components', 420, 'TVS Industrial Supply Ltd', 'Jurong Tech Park Facilities Centre'],
    ['shp_4', 'NKG-2026-7730', 'Bengaluru (BLR), India', 'San Jose (SJC), USA', 'DELIVERED', '2026-09-19', 'FedEx International Priority', 'Semiconductor Evaluation Boards', 85, 'Wipro Electronics Hardware Lab', 'Silicon Valley Innovation Hub'],
    ['shp_5', 'NKG-2026-3109', 'Kolkata (CCU), India', 'Chittagong (CGP), Bangladesh', 'BOOKED', '2026-09-25', 'Nagarkot Cross-Border Freight', 'Textile Raw Machinery Parts', 3200, 'Bengal Textiles Equipment Corp', 'Chittagong Garments Complex'],
  ];

  for (const shipment of seedShipments) {
    await pool.query(
      `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, package_type, weight_kg, sender, recipient)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, shipment,
    );
    await pool.query(
      `INSERT INTO shipment_history (id, shipment_id, status, location, notes, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`hist_${shipment[0]}_1`, shipment[0], shipment[4], shipment[2], `Shipment ${String(shipment[4]).toLowerCase().replace('_', ' ')} in the tracking system`, 'Operations Desk'],
    );
  }
}