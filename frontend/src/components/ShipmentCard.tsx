import React, { useState } from 'react';
import type { Shipment } from '../types';
import { STATUS_CONFIGS } from '../types';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  History, 
  Edit3, 
  Copy, 
  Check, 
  Truck, 
  Box
} from 'lucide-react';

interface ShipmentCardProps {
  shipment: Shipment;
  onViewHistory: (shipment: Shipment) => void;
  onUpdateStatus: (shipment: Shipment) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({
  shipment,
  onViewHistory,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const statusConfig = STATUS_CONFIGS[shipment.currentStatus];

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shipment.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeliveryStatusText = (dateStr: string, status: string) => {
    if (status === 'DELIVERED') return { text: 'Delivered', isOverdue: false };
    if (status === 'CANCELLED') return { text: 'Cancelled', isOverdue: false };

    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', isOverdue: false };
    } else {
      return { text: `In ${diffDays} days`, isOverdue: false };
    }
  };

  const deliveryInfo = getDeliveryStatusText(shipment.expectedDeliveryDate, shipment.currentStatus);
  const latestHistory = shipment.history && shipment.history.length > 0 ? shipment.history[0] : null;

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4.5 flex flex-col justify-between gap-3.5 transition-all shadow-xs hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Box className="text-slate-700" size={16} />
          <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">{shipment.referenceNumber}</span>
          <button 
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer" 
            onClick={handleCopyRef}
            title="Copy Reference Number"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
        </div>

        <div 
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: statusConfig.bgColor,
            borderColor: statusConfig.borderColor,
            color: statusConfig.color,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <MapPin size={13} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ORIGIN</span>
            <span className="text-xs font-bold text-slate-800 truncate" title={shipment.origin}>{shipment.origin}</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-10 shrink-0">
          <div className="w-full h-0.5 bg-slate-300" />
          <div className="absolute w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-500 shadow-xs" title={shipment.carrier}>
            <Truck size={9} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <MapPin size={13} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">DESTINATION</span>
            <span className="text-xs font-bold text-slate-800 truncate" title={shipment.destination}>{shipment.destination}</span>
          </div>
        </div>
      </div>

      {latestHistory && (
        <div className="flex items-start gap-2 bg-slate-50 border-l-2 border-slate-700 px-2.5 py-1.5 rounded-r text-xs text-slate-600">
          <Clock size={12} className="text-slate-500 mt-0.5 shrink-0" />
          <span className="leading-tight text-[11px]">
            <strong className="text-slate-900 font-semibold">{latestHistory.location}</strong>: {latestHistory.notes || 'Status updated'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar size={13} className="text-slate-400" />
          <span className="font-medium text-slate-700">ETA: {shipment.expectedDeliveryDate}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
            deliveryInfo.isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {deliveryInfo.text}
          </span>
        </div>

        <div className="text-right">
          <span className="font-mono text-[11px] text-slate-500 font-medium">{shipment.carrier}</span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button 
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          onClick={() => onViewHistory(shipment)}
        >
          <History size={14} />
          <span>History ({shipment.history?.length || 0})</span>
        </button>

        <button 
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
          onClick={() => onUpdateStatus(shipment)}
        >
          <Edit3 size={14} />
          <span>Update Status</span>
        </button>
      </div>
    </div>
  );
};
