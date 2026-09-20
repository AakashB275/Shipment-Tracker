import React, { useState } from 'react';
import type { CreateShipmentPayload, ShipmentStatus } from '../types';
import { X, PlusCircle, Sparkles, MapPin, Calendar, Truck, Package, User, FileText } from 'lucide-react';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateShipmentPayload) => Promise<void>;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [referenceNumber, setReferenceNumber] = useState(
    () => `NKG-${new Date().getUTCFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus>('BOOKED');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [carrier, setCarrier] = useState('Nagarkot Cargo Direct');
  const packageType = 'Standard Freight Container';
  const [weightKg, setWeightKg] = useState<number>(450);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateRef = () => {
    setReferenceNumber(`NKG-${new Date().getUTCFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || !expectedDeliveryDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        referenceNumber: referenceNumber.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        currentStatus,
        expectedDeliveryDate,
        carrier: carrier.trim(),
        packageType: packageType.trim(),
        weightKg: Number(weightKg) || 100,
        sender: sender.trim() || undefined,
        recipient: recipient.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <PlusCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Shipment</h2>
              <p className="text-xs text-slate-500">Register new cargo booking with Nagarkot Forwarders</p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5">
          {/* Reference Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Reference Number *</span>
              <button 
                type="button" 
                className="text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                onClick={handleGenerateRef}
              >
                <Sparkles size={11} /> Auto Generate
              </button>
            </div>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. NKG-2026-9921"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><MapPin size={11} /> Origin *</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. Mumbai (BOM), India"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><MapPin size={11} /> Destination *</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. Frankfurt (FRA), Germany"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Status & Delivery Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Initial Status Stage *</label>
              <select 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 cursor-pointer font-medium"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as ShipmentStatus)}
              >
                <option value="BOOKED">Booked</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="CUSTOMS_HOLD">Customs Hold</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Calendar size={11} /> Expected Delivery *</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Truck size={11} /> Carrier Name</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. Maersk / Lufthansa Cargo"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Package size={11} /> Weight (kg)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. 450"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={11} /> Sender / Consignor</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. Sun Pharma Logistics"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={11} /> Recipient / Consignee</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
                placeholder="e.g. BioPharm Hub FRA"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><FileText size={11} /> Initial Remarks</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800"
              placeholder="e.g. Express air freight with temperature monitoring..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button type="button" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase tracking-wide cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
