import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EquipmentCatalogView } from './components/equipment/EquipmentCatalogView';
import { BorrowReturnView } from './components/borrow/BorrowReturnView';
import { InventoryAuditView } from './components/inventory/InventoryAuditView';
import { DamageRepairView } from './components/repairs/DamageRepairView';
import { RoomsView } from './components/rooms/RoomsView';
import { PersonnelView } from './components/personnel/PersonnelView';
import { ReportsView } from './components/reports/ReportsView';
import { QRManagementView } from './components/qr/QRManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { QRPrintSheetModal } from './components/qr/QRPrintSheetModal';
import { PrintableSlipModal } from './components/common/PrintableSlipModal';
import { Equipment, BorrowTicket, InventoryAudit } from './types';
import { Menu } from 'lucide-react';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRPrintOpen, setIsQRPrintOpen] = useState(false);
  const [qrPrintItems, setQrPrintItems] = useState<Equipment[]>([]);

  // Print slip state
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);
  const [printTicket, setPrintTicket] = useState<BorrowTicket | null>(null);
  const [printAudit, setPrintAudit] = useState<InventoryAudit | null>(null);

  // Real-time badges for tickets and repairs
  const [pendingBorrowCount, setPendingBorrowCount] = useState(0);
  const [pendingRepairsCount, setPendingRepairsCount] = useState(0);

  const refreshBadges = () => {
    const tickets = StorageService.getBorrowTickets();
    const repairs = StorageService.getDamageReports();
    setPendingBorrowCount(tickets.filter(t => t.status === 'pending').length);
    setPendingRepairsCount(repairs.filter(r => r.status === 'reported' || r.status === 'processing').length);
  };

  useEffect(() => {
    refreshBadges();
    const handler = () => refreshBadges();
    window.addEventListener('nhonmy_storage_change', handler);
    return () => window.removeEventListener('nhonmy_storage_change', handler);
  }, []);

  const handleOpenQRPrintModal = (items: Equipment[]) => {
    setQrPrintItems(items);
    setIsQRPrintOpen(true);
  };

  const handlePrintTicket = (ticket: BorrowTicket) => {
    setPrintTicket(ticket);
    setPrintAudit(null);
    setIsPrintSlipOpen(true);
  };

  const handlePrintAudit = (audit: InventoryAudit) => {
    setPrintAudit(audit);
    setPrintTicket(null);
    setIsPrintSlipOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Mobile Bar with Hamburger Button */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
        >
          <Menu className="w-4 h-4 text-emerald-400" />
          <span>Danh mục chức năng</span>
        </button>
        <span className="text-[11px] text-emerald-300 font-mono font-semibold">
          THCS Nhơn Mỹ · 2026–2027
        </span>
      </div>

      {/* Main Body Container with Sidebar and Content Viewport */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          pendingBorrowCount={pendingBorrowCount}
          pendingRepairsCount={pendingRepairsCount}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'catalog' && (
            <EquipmentCatalogView
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenQRPrintModal={handleOpenQRPrintModal}
            />
          )}

          {activeTab === 'borrow' && (
            <BorrowReturnView
              onPrintTicket={handlePrintTicket}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryAuditView
              onPrintAudit={handlePrintAudit}
            />
          )}

          {activeTab === 'repairs' && (
            <DamageRepairView />
          )}

          {activeTab === 'rooms' && (
            <RoomsView />
          )}

          {activeTab === 'personnel' && (
            <PersonnelView />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'qr' && (
            <QRManagementView
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenPrintModal={handleOpenQRPrintModal}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Shared Modals */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectForBorrow={(eq) => {
          setActiveTab('borrow');
        }}
      />

      <QRPrintSheetModal
        isOpen={isQRPrintOpen}
        onClose={() => setIsQRPrintOpen(false)}
        equipmentList={qrPrintItems}
      />

      <PrintableSlipModal
        isOpen={isPrintSlipOpen}
        onClose={() => setIsPrintSlipOpen(false)}
        ticket={printTicket}
        audit={printAudit}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
