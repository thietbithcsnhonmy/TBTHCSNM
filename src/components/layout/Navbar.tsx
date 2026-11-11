import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { 
  QrCode, 
  UserCheck, 
  ShieldCheck, 
  GraduationCap, 
  Wrench, 
  Calendar,
  Check
} from 'lucide-react';

interface NavbarProps {
  onOpenQRScanner: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQRScanner, activeTab, onNavigate }) => {
  const { currentUser, users, switchUserById } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const activeYear = StorageService.getActiveYear();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'bgh':
        return { label: 'Ban Giám hiệu', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'staff':
        return { label: 'Nhân viên thiết bị', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'teacher':
        return { label: 'Giáo viên', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      default:
        return { label: 'Người dùng', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Brand / School Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/src/assets/images/school_emblem_nhonmy_1794210518966.jpg"
          alt="Huy hiệu THCS Nhơn Mỹ"
          className="w-10 h-10 object-contain rounded-full shadow-xs border border-emerald-100"
          onError={(e) => {
            // fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base lg:text-lg font-bold text-emerald-900 tracking-tight whitespace-nowrap">
              THCS NHƠN MỸ
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
              GDPT 2018
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden md:inline truncate max-w-xs">
            Hệ Thống Quản Lý Thiết Bị Dạy Học Thông Minh
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Breadcrumb & Academic Year */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-slate-500">Năm học:</span>
          <span className="font-semibold text-slate-800 tabular-nums">{activeYear}</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-slate-600">
          Trạng thái cơ sở dữ liệu: <strong className="text-emerald-700 font-semibold">Tập trung</strong>
        </span>
      </div>

      {/* Zone 3: Actions & Role / User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick QR Scanner Button */}
        <button
          onClick={onOpenQRScanner}
          title="Quét mã QR thiết bị bằng camera hoặc tra cứu mã"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-emerald-700" />
          <span className="hidden sm:inline">Quét mã QR</span>
        </button>

        {/* User Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50 transition-all text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name.charAt(currentUser.name.lastIndexOf(' ') + 1) || 'N'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                {currentUser.name}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-xs border inline-block w-fit ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>
          </button>

          {/* User selector modal dropdown */}
          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Chuyển đổi vai trò / Tài khoản</p>
                  <p className="text-[11px] text-slate-500">
                    Chọn nhanh tài khoản để kiểm thử quy trình mượn - trả và phân quyền
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100">
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id;
                    const r = getRoleBadge(u.role);
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUserById(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {u.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-rose-600" /> :
                             u.role === 'bgh' ? <UserCheck className="w-4 h-4 text-purple-600" /> :
                             u.role === 'staff' ? <Wrench className="w-4 h-4 text-emerald-700" /> :
                             <GraduationCap className="w-4 h-4 text-sky-600" />}
                          </div>
                          <div>
                            <p className="text-xs text-slate-900 leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {u.role === 'staff' ? `Nhân viên ${u.staffIndex || ''}: ${u.assignedSubjects?.join(', ')}` :
                               u.role === 'teacher' ? `${u.department} - ${u.subject || ''}` :
                               u.email}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Đơn vị: THCS Nhơn Mỹ</span>
                  <button 
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('settings');
                    }}
                    className="text-emerald-800 font-semibold hover:underline cursor-pointer"
                  >
                    Quản lý tài khoản
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
