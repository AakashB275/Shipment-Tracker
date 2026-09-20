import React from 'react';
import { PlusCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">NAGARKOT FORWARDERS</h1>
              <span className="bg-slate-800 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700 tracking-wider">
                LOGISTICS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Shipment Status Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Create Shipment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
