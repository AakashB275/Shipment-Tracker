import React from 'react';
import type { Shipment } from '../types';
import { Package, Truck, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

interface MetricsOverviewProps {
  shipments: Shipment[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ shipments }) => {
  const total = shipments.length;
  const inTransit = shipments.filter(s => s.currentStatus === 'IN_TRANSIT').length;
  const customsHold = shipments.filter(s => s.currentStatus === 'CUSTOMS_HOLD').length;
  const outForDelivery = shipments.filter(s => s.currentStatus === 'OUT_FOR_DELIVERY').length;
  const delivered = shipments.filter(s => s.currentStatus === 'DELIVERED').length;

  const deliveredPercentage = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* Total Shipments */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Cargo</span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Package size={18} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500 font-medium">Shipments</span>
        </div>
      </div>

      {/* In Transit */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Transit</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Truck size={18} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{inTransit}</span>
          <span className="text-xs text-slate-500 font-medium">Active Routes</span>
        </div>
      </div>

      {/* Customs Hold */}
      <div className={`bg-white border rounded-xl p-4 shadow-xs transition-all ${
        customsHold > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Customs Hold</span>
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-amber-900">{customsHold}</span>
          <span className="text-xs text-amber-700 font-semibold">Pending Review</span>
        </div>
      </div>

      {/* Out for Delivery */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Out for Delivery</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Send size={18} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{outForDelivery}</span>
          <span className="text-xs text-slate-500 font-medium">Dispatch</span>
        </div>
      </div>

      {/* Delivered */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivered</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{delivered}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {deliveredPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
