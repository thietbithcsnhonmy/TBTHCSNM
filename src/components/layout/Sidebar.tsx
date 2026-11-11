import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  DoorOpen,
  Users,
  BarChart3,
  QrCode,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingBorrowCount: number;
  pendingRepairsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  pendingBorrowCount,
  pendingRepairsCount
}) => {
  const { currentUser } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'catalog',
      label: 'Danh mục thiết bị',
      icon: Boxes,
      badge: null
    },
    {
      id: 'borrow',
      label: 'Mượn – Trả thiết bị',
      icon: ClipboardList,
      badge: pendingBorrowCount > 0 ? pendingBorrowCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'inventory',
      label: 'Kiểm kê thiết bị',
      icon: CheckSquare,
      badge: null
    },
    {
      id: 'repairs',
      label: 'Báo hỏng & Sửa chữa',
      icon: AlertTriangle,
      badge: pendingRepairsCount > 0 ? pendingRepairsCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'rooms',
      label: 'Phòng học & Phòng Lab',
      icon: DoorOpen,
      badge: null
    },
    {
      id: 'personnel',
      label: 'Giáo viên & 3 Nhân viên',
      icon: Users,
      badge: null
    },
    {
      id: 'reports',
      label: 'Thống kê & Báo cáo',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'qr',
      label: 'Mã QR & In tem nhãn',
      icon: QrCode,
      badge: null
    },
    {
      id: 'settings',
      label: 'Cài đặt & Sao lưu',
      icon: Settings,
      badge: null
    }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-full lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-200 z-50 lg:z-20 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-slate-800 shadow-md`}
      >
        {/* Mobile Header with close button */}
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">THCS NHƠN MỸ</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School Motto / Intro Box */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-emerald-200">
          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">THCS NHƠN MỸ</p>
          <p className="text-xs font-semibold text-white mt-0.5">Quản Lý Thiết Bị GDPT 2018</p>
          <p className="text-[10px] text-emerald-400/80 mt-1">
            Quy mô: {StorageService.getSchoolInfo().totalClasses} lớp · {StorageService.getSchoolInfo().totalStudents} HS · 25 phòng
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Current Role Indicator in Sidebar Footer */}
        <div className="p-3 m-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Đang đăng nhập:</span>
            <span className="text-emerald-400 font-semibold uppercase text-[10px]">
              {currentUser.role}
            </span>
          </div>
          <div className="font-medium text-slate-200 truncate">
            {currentUser.name}
          </div>
          {currentUser.role === 'staff' && (
            <div className="text-[10px] text-emerald-300/80 truncate">
              Nhân viên {currentUser.staffIndex}: {currentUser.assignedSubjects?.slice(0, 2).join(', ')}...
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
