import React, { useState } from 'react';
import type { Shipment, ShipmentStatus, UpdateStatusPayload } from '../types';
import { STATUS_CONFIGS } from '../types';
import { 
  X, 
  History, 
  MapPin, 
  Calendar, 
  User, 
  Package, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Send
} from 'lucide-react';

interface ShipmentDetailsModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onAddStatusUpdate: (shipmentId: string, payload: UpdateStatusPayload) => Promise<void>;
}

export const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = ({
  shipment,
  onClose,
  onAddStatusUpdate
}) => {
  if (!shipment) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>(shipment.currentStatus);
  const [location, setLocation] = useState(shipment.history?.[0]?.location || shipment.destination);
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Nagarkot Desk');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusConfig = STATUS_CONFIGS[shipment.currentStatus];
  const stages: ShipmentStatus[] = ['BOOKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStepIndex = stages.indexOf(shipment.currentStatus);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddStatusUpdate(shipment.id, {
        status: newStatus,
        location: location.trim(),
        notes: notes.trim() || undefined,
        updatedBy: operator.trim() || undefined
      });
      setShowAddForm(false);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">Shipment {shipment.referenceNumber}</h2>
                <span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    borderColor: statusConfig.borderColor,
                    color: statusConfig.color,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Status Change Timeline & Detailed Specifications</p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Stepper */}
          {shipment.currentStatus !== 'CANCELLED' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Stage Progression</div>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 z-0" />
                {stages.map((stage, idx) => {
                  const cfg = STATUS_CONFIGS[stage];
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = shipment.currentStatus === stage;

                  return (
                    <div key={stage} className="relative z-10 flex flex-col items-center gap-1 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted 
                          ? 'bg-emerald-600 text-white' 
                          : isCurrent 
                          ? 'bg-slate-900 text-white ring-2 ring-slate-900/20' 
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold ${isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={11} /> Origin</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{shipment.origin}</span>
              <span className="text-[11px] font-mono text-slate-500 truncate block">Sender: {shipment.sender}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={11} /> Destination</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{shipment.destination}</span>
              <span className="text-[11px] font-mono text-slate-500 truncate block">Recipient: {shipment.recipient}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={11} /> Delivery Target</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{shipment.expectedDeliveryDate}</span>
              <span className="text-[11px] font-mono text-slate-500 truncate block">Carrier: {shipment.carrier}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Package size={11} /> Package Specs</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{shipment.packageType}</span>
              <span className="text-[11px] font-mono text-slate-500 truncate block">Weight: {shipment.weightKg} kg</span>
            </div>
          </div>

          {/* Timeline Section Header */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} className="text-slate-600" /> Status Log History ({shipment.history?.length || 0})
            </h3>
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle size={13} />
              <span>{showAddForm ? 'Cancel Update' : 'Add Status Update'}</span>
            </button>
          </div>

          {/* Inline Add Status Form */}
          {showAddForm && (
            <form className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-3" onSubmit={handleQuickSubmit}>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Send size={13} /> Append New Status Log Entry
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Status Stage</label>
                  <select 
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 cursor-pointer font-medium"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                  >
                    <option value="BOOKED">Booked</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="CUSTOMS_HOLD">Customs Hold</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Checkpoint Location *</label>
                  <input 
                    type="text"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-medium"
                    placeholder="e.g. Frankfurt Airport Customs"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Operator</label>
                  <input 
                    type="text"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-medium"
                    placeholder="Operator name"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Update Remarks</label>
                <input 
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-medium"
                  placeholder="e.g. Cleared customs, loaded onto flight..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button 
                  type="button" 
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Post Status Change'}
                </button>
              </div>
            </form>
          )}

          {/* Vertical Timeline */}
          <div className="relative pl-5 space-y-3.5 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-slate-200">
            {shipment.history && shipment.history.length > 0 ? (
              shipment.history.map((item, idx) => {
                const itemConfig = STATUS_CONFIGS[item.status];
                const isLatest = idx === 0;
                const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={item.id || idx} className="relative">
                    {/* Marker */}
                    <div 
                      className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white z-10"
                      style={{ borderColor: itemConfig.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: itemConfig.color }} />
                    </div>

                    {/* Content Card */}
                    <div className={`bg-slate-50 border rounded-xl p-3 space-y-1.5 ${
                      isLatest ? 'border-slate-400 bg-white shadow-xs' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            backgroundColor: itemConfig.bgColor,
                            borderColor: itemConfig.borderColor,
                            color: itemConfig.color,
                          }}
                        >
                          {itemConfig.label}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock size={11} /> {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <MapPin size={13} className="text-slate-500" />
                        <span>{item.location}</span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-600 bg-slate-100 p-2 rounded border-l-2 border-slate-400">
                          {item.notes}
                        </p>
                      )}

                      {item.updatedBy && (
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <User size={10} /> {item.updatedBy}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 italic">No history records logged yet.</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
