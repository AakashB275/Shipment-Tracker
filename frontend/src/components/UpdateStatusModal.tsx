import React, { useState } from 'react';
import type { Shipment, ShipmentStatus, UpdateStatusPayload } from '../types';
import { STATUS_CONFIGS } from '../types';
import { X, Edit3, MapPin, FileText, User, Send } from 'lucide-react';

interface UpdateStatusModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onSubmit: (shipmentId: string, payload: UpdateStatusPayload) => Promise<void>;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  shipment,
  onClose,
  onSubmit
}) => {
  if (!shipment) return null;

  const currentConfig = STATUS_CONFIGS[shipment.currentStatus];

  const [status, setStatus] = useState<ShipmentStatus>(shipment.currentStatus);
  const [location, setLocation] = useState(
    shipment.history?.[0]?.location || shipment.origin
  );
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Nagarkot Operations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(shipment.id, {
        status,
        location: location.trim(),
        notes: notes.trim() || undefined,
        updatedBy: operator.trim() || undefined
      });
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Update Status Stage</h2>
              <p className="text-xs text-slate-500">Ref: <strong className="font-mono text-slate-900">{shipment.referenceNumber}</strong></p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Current Status Banner */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Current Stage:</span>
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: currentConfig.bgColor,
                borderColor: currentConfig.borderColor,
                color: currentConfig.color,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentConfig.color }} />
              {currentConfig.label}
            </span>
          </div>

          {/* New Status Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Select New Status Stage *</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 cursor-pointer font-medium"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            >
              <option value="BOOKED">Booked</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="CUSTOMS_HOLD">Customs Hold (Alert)</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled / Returned</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><MapPin size={11} /> Checkpoint Location *</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
              placeholder="e.g. Dubai Port Transit Hub"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><FileText size={11} /> Remarks / Notes</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
              rows={3}
              placeholder="Context regarding status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Operator */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={11} /> Operator</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
              placeholder="e.g. Logistics Desk Agent"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button type="button" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer" disabled={isSubmitting}>
              <Send size={13} />
              <span>{isSubmitting ? 'Saving...' : 'Apply Status Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
