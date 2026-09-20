import { useState, useEffect, useMemo } from 'react';
import type { Shipment, ShipmentStatus, CreateShipmentPayload, UpdateStatusPayload } from './types';
import { apiService } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterBar } from './components/FilterBar';
import { ShipmentCard } from './components/ShipmentCard';
import { ShipmentTable } from './components/ShipmentTable';
import { ShipmentDetailsModal } from './components/ShipmentDetailsModal';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import { SearchX, RefreshCw } from 'lucide-react';
import './App.css';

export function App() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Controls State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<string>('delivery_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [detailsShipment, setDetailsShipment] = useState<Shipment | null>(null);
  const [updateStatusShipment, setUpdateStatusShipment] = useState<Shipment | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const result = await apiService.getShipments();
      setShipments(result);
    } catch (err) {
      console.error('Failed to load shipments:', err);
      addToast('error', 'Error connecting to shipment data service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Filter & Sort Logic
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      if (selectedStatus !== 'ALL' && item.currentStatus !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = item.referenceNumber.toLowerCase().includes(q);
        const matchesOrigin = item.origin.toLowerCase().includes(q);
        const matchesDest = item.destination.toLowerCase().includes(q);
        const matchesCarrier = item.carrier.toLowerCase().includes(q);
        const matchesSender = item.sender?.toLowerCase().includes(q);
        const matchesRecipient = item.recipient?.toLowerCase().includes(q);

        if (!matchesRef && !matchesOrigin && !matchesDest && !matchesCarrier && !matchesSender && !matchesRecipient) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'delivery_asc') {
        return new Date(a.expectedDeliveryDate).getTime() - new Date(b.expectedDeliveryDate).getTime();
      } else if (sortBy === 'delivery_desc') {
        return new Date(b.expectedDeliveryDate).getTime() - new Date(a.expectedDeliveryDate).getTime();
      } else if (sortBy === 'updated_desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'ref_asc') {
        return a.referenceNumber.localeCompare(b.referenceNumber);
      }
      return 0;
    });
  }, [shipments, selectedStatus, searchQuery, sortBy]);

  // Handlers
  const handleCreateShipment = async (payload: CreateShipmentPayload) => {
    try {
      const created = await apiService.createShipment(payload);
      setShipments((prev) => [created, ...prev]);
      addToast('success', `Shipment ${created.referenceNumber} created successfully!`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to create shipment.');
    }
  };

  const handleUpdateStatus = async (shipmentId: string, payload: UpdateStatusPayload) => {
    try {
      const updated = await apiService.updateStatus(shipmentId, payload);
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      
      if (detailsShipment && detailsShipment.id === updated.id) {
        setDetailsShipment(updated);
      }
      addToast('success', `Updated status for ${updated.referenceNumber} to ${payload.status}!`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to update shipment status.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Summary Dashboard */}
        <MetricsOverview shipments={shipments} />

        {/* Filter & Controls Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredShipments.length}
        />

        {/* Content Display */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <RefreshCw className="animate-spin text-slate-700" size={28} />
            <h3 className="text-base font-bold text-slate-900">Loading Cargo Shipments...</h3>
          </div>
        ) : filteredShipments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onViewHistory={(s) => setDetailsShipment(s)}
                  onUpdateStatus={(s) => setUpdateStatusShipment(s)}
                />
              ))}
            </div>
          ) : (
            <ShipmentTable
              shipments={filteredShipments}
              onViewHistory={(s) => setDetailsShipment(s)}
              onUpdateStatus={(s) => setUpdateStatusShipment(s)}
            />
          )
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-14 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <SearchX size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Shipments Found</h3>
            <p className="text-xs text-slate-500 max-w-md">
              {searchQuery || selectedStatus !== 'ALL'
                ? 'No shipments match your current search terms or status filter. Try clearing filters.'
                : 'No shipments available. Click "+ Create Shipment" to add your first cargo tracker.'}
            </p>
            {(searchQuery || selectedStatus !== 'ALL') && (
              <button
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('ALL');
                }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateShipment}
      />

      <ShipmentDetailsModal
        shipment={detailsShipment}
        onClose={() => setDetailsShipment(null)}
        onAddStatusUpdate={handleUpdateStatus}
      />

      <UpdateStatusModal
        shipment={updateStatusShipment}
        onClose={() => setUpdateStatusShipment(null)}
        onSubmit={handleUpdateStatus}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
