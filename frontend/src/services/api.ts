import type { Shipment, CreateShipmentPayload, UpdateStatusPayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Shipment API request failed');
  }
  return response.json();
}

export const apiService = {
  async getShipments(): Promise<Shipment[]> {
    return request<Shipment[]>('/shipments');
  },

  async getShipmentById(idOrRef: string): Promise<Shipment | null> {
    try {
      return await request<Shipment>(`/shipments/${encodeURIComponent(idOrRef)}`);
    } catch (error) {
      if (error instanceof Error && error.message === 'Shipment not found') return null;
      throw error;
    }
  },

  async createShipment(payload: CreateShipmentPayload): Promise<Shipment> {
    return request<Shipment>('/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(shipmentId: string, payload: UpdateStatusPayload): Promise<Shipment> {
    return request<Shipment>(`/shipments/${encodeURIComponent(shipmentId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
};
