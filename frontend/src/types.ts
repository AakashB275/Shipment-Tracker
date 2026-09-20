export type ShipmentStatus = 
  | 'BOOKED' 
  | 'IN_TRANSIT' 
  | 'CUSTOMS_HOLD' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface ShipmentHistoryItem {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface Shipment {
  id: string;
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
  carrier: string;
  packageType: string;
  weightKg: number;
  sender: string;
  recipient: string;
  createdAt: string;
  updatedAt: string;
  history: ShipmentHistoryItem[];
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  step: number;
}

export const STATUS_CONFIGS: Record<ShipmentStatus, StatusConfig> = {
  BOOKED: {
    label: 'Booked',
    color: '#0369a1', // Sky blue dark text
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    description: 'Shipment order booked & registered',
    step: 1,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: '#1d4ed8', // Royal blue dark text
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Cargo en route to next transit node',
    step: 2,
  },
  CUSTOMS_HOLD: {
    label: 'Customs Hold',
    color: '#b45309', // Amber dark text
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Awaiting customs inspection & clearance',
    step: 2,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: '#4338ca', // Indigo dark text
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    description: 'Last-mile dispatch underway',
    step: 3,
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#047857', // Emerald green dark text
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'Successfully handed over to recipient',
    step: 4,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#b91c1c', // Rose red dark text
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    description: 'Shipment booking cancelled or returned',
    step: 0,
  }
};

export interface CreateShipmentPayload {
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

export interface UpdateStatusPayload {
  status: ShipmentStatus;
  location: string;
  notes?: string;
  updatedBy?: string;
}
