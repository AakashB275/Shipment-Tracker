import React from 'react';
import type { Shipment } from '../types';
import { STATUS_CONFIGS } from '../types';
import { History, Edit3, MapPin, Truck, Calendar, Box } from 'lucide-react';

interface ShipmentTableProps {
  shipments: Shipment[];
  onViewHistory: (shipment: Shipment) => void;
  onUpdateStatus: (shipment: Shipment) => void;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  onViewHistory,
  onUpdateStatus,
}) => {
  if (shipments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <th className="py-3 px-4">Ref No.</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Origin</th>
            <th className="py-3 px-4">Destination</th>
            <th className="py-3 px-4">Carrier</th>
            <th className="py-3 px-4">Expected Delivery</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shipments.map((shipment) => {
            const statusConfig = STATUS_CONFIGS[shipment.currentStatus];
            const historyCount = shipment.history?.length || 0;

            return (
              <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Reference Number */}
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Box size={14} className="text-slate-500" />
                    <span>{shipment.referenceNumber}</span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      borderColor: statusConfig.borderColor,
                      color: statusConfig.color,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                    {statusConfig.label}
                  </span>
                </td>

                {/* Origin */}
                <td className="py-3 px-4 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{shipment.origin}</span>
                  </div>
                </td>

                {/* Destination */}
                <td className="py-3 px-4 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{shipment.destination}</span>
                  </div>
                </td>

                {/* Carrier */}
                <td className="py-3 px-4 font-mono text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-slate-400" />
                    <span>{shipment.carrier}</span>
                  </div>
                </td>

                {/* Expected Delivery */}
                <td className="py-3 px-4 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{shipment.expectedDeliveryDate}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                      onClick={() => onViewHistory(shipment)}
                      title="View Timeline History"
                    >
                      <History size={13} />
                      <span>History ({historyCount})</span>
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors cursor-pointer"
                      onClick={() => onUpdateStatus(shipment)}
                      title="Update Shipment Status"
                    >
                      <Edit3 size={13} />
                      <span>Update</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
