import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const equipment = StorageService.getEquipment();
  const tickets = StorageService.getBorrowTickets();
  const repairs = StorageService.getDamageReports();
  const audits = StorageService.getInventoryAudits();
  const users = StorageService.getUsers();
  const schoolInfo = StorageService.getSchoolInfo();
  const activeYear = StorageService.getActiveYear();

  const [reportType, setReportType] = useState<
    'all_equipment' | 'by_subject' | 'by_staff' | 'borrow_frequency' | 'repairs_cost'
  >('all_equipment');

  // Stats calculation
  const totalActual = equipment.reduce((s, e) => s + e.actualQuantity, 0);
  const totalValue = equipment.reduce((s, e) => s + e.price * e.actualQuantity, 0);
  const totalDamagedQty = equipment.reduce((s, e) => s + e.damagedQuantity, 0);
  const totalRepairCost = repairs.reduce((s, r) => s + (r.repairCost || 0), 0);

  // Group by Subject
  const subjectMap: Record<string, { count: number; qty: number; value: number; borrowCount: number }> = {};
  equipment.forEach((item) => {
    if (!subjectMap[item.subject]) {
      subjectMap[item.subject] = { count: 0, qty: 0, value: 0, borrowCount: 0 };
    }
    subjectMap[item.subject].count += 1;
    subjectMap[item.subject].qty += item.actualQuantity;
    subjectMap[item.subject].value += item.price * item.actualQuantity;
  });

  // Count borrow frequency per equipment
  tickets.forEach((t) => {
    t.items.forEach((it) => {
      const eq = equipment.find((e) => e.id === it.equipmentId);
      if (eq && subjectMap[eq.subject]) {
        subjectMap[eq.subject].borrowCount += 1;
      }
    });
  });

  // Group by Staff
  const staffList = users.filter((u) => u.role === 'staff');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCurrent = () => {
    ExportService.exportEquipmentToExcel(equipment, schoolInfo, `Bao_Cao_${reportType}_${activeYear}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Báo Cáo Thống Kê Thiết Bị Dạy Học</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
              Năm học {activeYear}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Dữ liệu tổng hợp trực tiếp từ sổ sách mượn trả, kiểm kê và danh mục thiết bị thực tế
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCurrent}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-2xs no-print">
        {[
          { id: 'all_equipment', label: '1. Tổng quan giá trị tài sản' },
          { id: 'by_subject', label: '2. Thống kê theo môn học' },
          { id: 'by_staff', label: '3. Hoạt động 03 nhân viên thiết bị' },
          { id: 'borrow_frequency', label: '4. Tần suất mượn trả theo lớp' },
          { id: 'repairs_cost', label: '5. Kinh phí sửa chữa & bảo trì' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              reportType === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {schoolInfo.name}
            </p>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              BÁO CÁO TỔNG HỢP TRANG THIẾT BỊ DẠY HỌC GDPT 2018
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thời điểm lập báo cáo: {new Date().toLocaleDateString('vi-VN')} · Người lập: <strong className="text-slate-700">{currentUser.name}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Năm học: <strong className="text-slate-800 font-mono">{activeYear}</strong></div>
            <div>Quy mô: <strong className="text-slate-800">{schoolInfo.totalClasses} lớp · {schoolInfo.totalStudents} HS</strong></div>
          </div>
        </div>

        {/* Section 1: All Equipment & Value Overview */}
        {reportType === 'all_equipment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tổng số thiết bị</span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                  {totalActual} <span className="text-xs font-normal text-slate-500">cái/bộ</span>
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tổng nguyên giá ước tính</span>
                <span className="text-xl font-bold text-emerald-800 font-mono tabular-nums">
                  {totalValue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Thiết bị đang hư hỏng</span>
                <span className="text-xl font-bold text-amber-700 font-mono tabular-nums">
                  {totalDamagedQty} <span className="text-xs font-normal text-slate-500">cái/bộ</span>
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tổng kinh phí sửa chữa</span>
                <span className="text-xl font-bold text-slate-800 font-mono tabular-nums">
                  {totalRepairCost.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
                </span>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-center w-10">STT</th>
                    <th className="py-2 px-3">Môn học</th>
                    <th className="py-2 px-3 text-right">Số loại TB</th>
                    <th className="py-2 px-3 text-right">Tổng số lượng</th>
                    <th className="py-2 px-3 text-right">Giá trị ước tính (VNĐ)</th>
                    <th className="py-2 px-3 text-right">Lượt mượn dạy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(subjectMap).map(([sub, data], idx) => (
                    <tr key={sub} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{sub}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{data.count}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-800">{data.qty}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800 font-medium">
                        {data.value.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-indigo-700 font-semibold">{data.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Staff stats */}
        {reportType === 'by_staff' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Thống Kê Khối Lượng Công Việc & Hiệu Quả Quản Lý Của 03 Nhân Viên Thiết Bị
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffList.map((st) => {
                const staffEquipments = equipment.filter((e) =>
                  st.assignedSubjects?.includes(e.subject)
                );
                const managedQty = staffEquipments.reduce((s, e) => s + e.actualQuantity, 0);
                const processedTickets = tickets.filter(
                  (t) => t.assignedStaffId === st.id || t.handedOverBy === st.name
                );

                return (
                  <div key={st.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="font-bold text-slate-900 text-sm">
                      {st.name} (Nhân viên {st.staffIndex})
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Phụ trách: <strong className="text-slate-800">{st.assignedSubjects?.join(', ')}</strong></div>
                      <div>Quản lý: <strong className="text-emerald-800 font-mono">{managedQty}</strong> thiết bị</div>
                      <div>Đã bàn giao: <strong className="text-indigo-700 font-mono">{processedTickets.length}</strong> lượt mượn</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Borrow Frequency */}
        {reportType === 'borrow_frequency' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Tần Suất Mượn Trả Thiết Bị Thực Hành Toàn Trường
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-3">Mã phiếu</th>
                    <th className="py-2 px-3">Giáo viên</th>
                    <th className="py-2 px-3">Lớp & Tiết dạy</th>
                    <th className="py-2 px-3">Bài học thực hành</th>
                    <th className="py-2 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{t.ticketCode}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{t.teacherName}</td>
                      <td className="py-2 px-3 text-slate-600">Lớp {t.targetClass} ({t.usePeriod})</td>
                      <td className="py-2 px-3 text-slate-800">{t.lessonTitle}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t.status === 'returned' ? 'Đã trả' : t.status === 'handed_over' ? 'Đang mượn' : 'Chờ duyệt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Repairs Cost */}
        {reportType === 'repairs_cost' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Báo Cáo Sự Cố Hư Hỏng & Tổng Hợp Quyết Toán Kinh Phí Sửa Chữa
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-3">Mã TB</th>
                    <th className="py-2 px-3">Tên thiết bị</th>
                    <th className="py-2 px-3">Sự cố</th>
                    <th className="py-2 px-3">Phương án khắc phục</th>
                    <th className="py-2 px-3 text-right">Chi phí (VNĐ)</th>
                    <th className="py-2 px-3 text-center">Tình trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repairs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{r.equipmentCode}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.equipmentName}</td>
                      <td className="py-2 px-3 text-slate-600">{r.errorDescription}</td>
                      <td className="py-2 px-3 text-slate-800">{r.solution || '-'}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                        {(r.repairCost || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] font-semibold text-emerald-800">
                          {r.status === 'repaired' ? 'Đã sửa xong' : 'Đang xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures for formal report print */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
          <div>
            <p className="font-bold">Người lập báo cáo</p>
            <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-900">{currentUser.name}</p>
          </div>

          <div>
            <p className="font-bold">Tổ trưởng thiết bị</p>
            <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-900">Nguyễn Văn An</p>
          </div>

          <div>
            <p className="font-bold">Hiệu trưởng phê duyệt</p>
            <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và đóng dấu)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-900">{schoolInfo.principalName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
