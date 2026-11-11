import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { Equipment, BorrowTicket } from '../../types';
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  DoorOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, isStaff, canManageSystem } = useAuth();
  const equipment = StorageService.getEquipment();
  const tickets = StorageService.getBorrowTickets();
  const repairs = StorageService.getDamageReports();
  const schoolInfo = StorageService.getSchoolInfo();
  const logs = StorageService.getAuditLogs().slice(0, 6);

  // Compute stats
  const totalTypes = equipment.length;
  const totalActualQty = equipment.reduce((sum, e) => sum + e.actualQuantity, 0);
  const totalBookQty = equipment.reduce((sum, e) => sum + e.bookQuantity, 0);
  const totalBorrowing = equipment.reduce((sum, e) => sum + e.borrowingQuantity, 0);
  const totalDamaged = equipment.reduce((sum, e) => sum + e.damagedQuantity, 0);
  const totalAvailable = equipment.reduce((sum, e) => sum + e.availableQuantity, 0);
  const totalGood = equipment.filter(e => e.status === 'good').reduce((sum, e) => sum + (e.actualQuantity - e.damagedQuantity), 0);

  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const handedOverTickets = tickets.filter(t => t.status === 'handed_over');

  // Check overdue tickets (useDate earlier than today and not returned)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTickets = tickets.filter(t => 
    (t.status === 'handed_over' || t.status === 'approved') && 
    t.expectedReturnDate < todayStr
  );

  const openRepairs = repairs.filter(r => r.status === 'reported' || r.status === 'processing');

  // Group equipment by subject
  const subjectBreakdown: Record<string, { count: number; qty: number }> = {};
  equipment.forEach(item => {
    if (!subjectBreakdown[item.subject]) {
      subjectBreakdown[item.subject] = { count: 0, qty: 0 };
    }
    subjectBreakdown[item.subject].count += 1;
    subjectBreakdown[item.subject].qty += item.actualQuantity;
  });

  const subjectList = Object.entries(subjectBreakdown).sort((a, b) => b[1].qty - a[1].qty);

  return (
    <div className="space-y-6">
      {/* Top Banner: School Welcome & Academic Scope */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {schoolInfo.name} · {schoolInfo.program}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Hệ Thống Quản Lý Thiết Bị Dạy Học Thông Minh
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-2xl">
            Phục vụ công tác giảng dạy thực hành cho {schoolInfo.totalClasses} lớp ({schoolInfo.totalStudents.toLocaleString('vi-VN')} học sinh) với 25 phòng học & phòng chức năng.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-3 text-xs text-emerald-100 flex-wrap">
            <span className="bg-emerald-950/60 border border-emerald-700/60 rounded-md px-2.5 py-1">
              Quy mô: <strong className="text-white font-mono tabular-nums">{schoolInfo.totalClasses}</strong> lớp học
            </span>
            <span className="bg-emerald-950/60 border border-emerald-700/60 rounded-md px-2.5 py-1">
              Tổng số: <strong className="text-white font-mono tabular-nums">{schoolInfo.totalStudents.toLocaleString('vi-VN')}</strong> học sinh
            </span>
            <span className="bg-emerald-950/60 border border-emerald-700/60 rounded-md px-2.5 py-1 hidden sm:inline-block">
              Đội ngũ: <strong className="text-white font-mono tabular-nums">48</strong> CB-GV-NV
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('borrow')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Mượn thiết bị</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4" />
            <span>Tra cứu kho</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total types & count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tổng danh mục</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {totalTypes} <span className="text-xs font-normal text-slate-500">loại</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Thực tế: <span className="font-semibold text-slate-700 tabular-nums">{totalActualQty}</span> thiết bị
          </div>
        </div>

        {/* Card 2: Good Condition */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Thiết bị tốt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">
            {totalGood}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đạt tỷ lệ: <span className="font-semibold text-emerald-700">{Math.round((totalGood / (totalActualQty || 1)) * 100)}%</span>
          </div>
        </div>

        {/* Card 3: Available for borrow */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Khả dụng trong kho</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 tabular-nums">
            {totalAvailable}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Sẵn sàng xuất mượn
          </div>
        </div>

        {/* Card 4: Borrowing right now */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Đang mượn dạy</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums">
            {totalBorrowing}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Trong <span className="font-semibold text-indigo-600 tabular-nums">{handedOverTickets.length}</span> tiết học
          </div>
        </div>

        {/* Card 5: Damaged / Needs Repair */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Hư hỏng / Sửa</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600 tabular-nums">
            {totalDamaged}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-amber-700">{openRepairs.length}</span> vụ việc đang xử lý
          </div>
        </div>

        {/* Card 6: Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Chờ duyệt phiếu</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 tabular-nums">
            {pendingTickets.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {overdueTickets.length > 0 ? (
              <span className="text-rose-600 font-bold">{overdueTickets.length} phiếu quá hạn</span>
            ) : (
              <span className="text-slate-500">0 phiếu quá hạn</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Tickets + Subject Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Borrow Requests & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Borrow Requests Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-800" />
                <h2 className="text-sm font-bold text-slate-900">
                  Phiếu Mượn Thiết Bị Đang Chờ Duyệt & Bàn Giao
                </h2>
              </div>
              <button
                onClick={() => onNavigate('borrow')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả ({tickets.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingTickets.length === 0 && handedOverTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Không có yêu cầu mượn thiết bị nào cần xử lý lúc này.
                </div>
              ) : (
                [...pendingTickets, ...handedOverTickets.slice(0, 3)].map((ticket) => {
                  const isPending = ticket.status === 'pending';
                  return (
                    <div
                      key={ticket.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800">
                            {ticket.ticketCode}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPending ? 'Chờ duyệt' : 'Đang mượn'}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            Lớp {ticket.targetClass} · {ticket.usePeriod}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          {ticket.lessonTitle}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Người mượn: <strong className="text-slate-700">{ticket.teacherName}</strong> ({ticket.department}) · {ticket.items.length} loại thiết bị
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onNavigate('borrow')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          {isPending ? 'Xử lý duyệt' : 'Chi tiết phiếu'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Staff Task Assignment Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Phân Công Phụ Trách 03 Nhân Viên Thiết Bị</span>
              <button
                onClick={() => onNavigate('personnel')}
                className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
              >
                Cập nhật phân công
              </button>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="text-xs font-bold text-emerald-900">1. Nguyễn Văn An</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Vật lí · Công nghệ · KHTN</div>
                <div className="text-[10px] text-slate-400 mt-1">Phòng TH Lý - CN 1 & 2</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="text-xs font-bold text-emerald-900">2. Trần Thị Bích</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Hóa học · Sinh học · KHTN</div>
                <div className="text-[10px] text-slate-400 mt-1">Phòng TH Hóa - Sinh 1 & 2</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="text-xs font-bold text-emerald-900">3. Lê Hoàng Cường</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Tin học · Dùng chung · KHXH</div>
                <div className="text-[10px] text-slate-400 mt-1">PTB Dùng chung 1 & 2, Tin học</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Equipment by Subject Breakdown & Audit Log */}
        <div className="space-y-6">
          {/* Equipment Distribution Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Phân Bổ Thiết Bị Theo Môn Học</span>
              <span className="text-[11px] font-mono text-slate-500">{totalActualQty} cái/bộ</span>
            </h2>

            <div className="space-y-2.5">
              {subjectList.map(([subject, data]) => {
                const percent = Math.round((data.qty / (totalActualQty || 1)) * 100);
                return (
                  <div key={subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{subject}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {data.qty} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Operations Audit Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Nhật Ký Thao Tác Mới Nhất
              </h2>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
              >
                Toàn bộ nhật ký
              </button>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span className="tabular-nums font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium mt-0.5">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
