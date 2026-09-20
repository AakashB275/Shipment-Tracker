import React from 'react';
import type { ShipmentStatus } from '../types';
import { STATUS_CONFIGS } from '../types';
import { Search, LayoutGrid, List, ArrowUpDown, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: ShipmentStatus | 'ALL';
  onStatusChange: (status: ShipmentStatus | 'ALL') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount
}) => {
  const statusOptions: Array<{ key: ShipmentStatus | 'ALL'; label: string }> = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'BOOKED', label: 'Booked' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'CUSTOMS_HOLD', label: 'Customs Hold' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col gap-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium"
            placeholder="Search by Reference (e.g. NKG-9810), origin, destination, carrier..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-all cursor-pointer"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-0.5">
            <ArrowUpDown size={14} className="text-slate-500 mr-1.5" />
            <select
              className="bg-transparent border-none text-slate-800 text-xs font-medium py-1.5 focus:outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="delivery_asc">Delivery: Soonest First</option>
              <option value="delivery_desc">Delivery: Latest First</option>
              <option value="updated_desc">Recently Updated</option>
              <option value="ref_asc">Reference Number (A-Z)</option>
            </select>
          </div>

          <div className="flex bg-slate-100 border border-slate-300 rounded-lg p-0.5">
            <button
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => onViewModeChange('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((option) => {
            const isActive = selectedStatus === option.key;
            const config = option.key !== 'ALL' ? STATUS_CONFIGS[option.key] : null;

            return (
              <button
                key={option.key}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={
                  isActive && config
                    ? {
                        backgroundColor: config.bgColor,
                        borderColor: config.borderColor,
                        color: config.color,
                      }
                    : {}
                }
                onClick={() => onStatusChange(option.key)}
              >
                {config && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: config.color }} 
                  />
                )}
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong> shipment{totalFilteredCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
