import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import { DamageReport, Equipment } from '../../types';
import {
  AlertTriangle,
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  Download,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const DamageRepairView: React.FC = () => {
  const { currentUser, isStaff, canManageSystem } = useAuth();
  const [reports, setReports] = useState<DamageReport[]>(() => StorageService.getDamageReports());
  const equipmentList = StorageService.getEquipment();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  // New Report Form
  const [selectedEqId, setSelectedEqId] = useState(equipmentList[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [errorDesc, setErrorDesc] = useState('');

  // Resolve / Processing Form
  const [solution, setSolution] = useState<'Tự khắc phục tại trường' | 'Gửi hãng bảo hành' | 'Thuê đơn vị sửa chữa ngoài' | 'Đề nghị thanh lý'>('Tự khắc phục tại trường');
  const [repairCost, setRepairCost] = useState(0);
  const [resultNotes, setResultNotes] = useState('');
  const [statusVal, setStatusVal] = useState<'processing' | 'repaired' | 'unrepairable'>('repaired');

  const refreshReports = () => {
    setReports(StorageService.getDamageReports());
  };

  const handleOpenResolve = (rep: DamageReport) => {
    setSelectedReport(rep);
    setSolution(rep.solution || 'Tự khắc phục tại trường');
    setRepairCost(rep.repairCost || 0);
    setResultNotes(rep.resultNotes || 'Đã sửa chữa và kiểm tra vận hành tốt.');
    setStatusVal(rep.status === 'reported' ? 'processing' : (rep.status as any));
    setIsResolveModalOpen(true);
  };

  const handleSubmitNewReport = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipmentList.find((item) => item.id === selectedEqId);
    if (!eq) return;

    const newReport: DamageReport = {
      id: `rep_${Date.now()}`,
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentName: eq.name,
      quantity,
      reportedBy: currentUser.name,
      reportedById: currentUser.id,
      reportedDate: new Date().toISOString().split('T')[0],
      errorDescription: errorDesc.trim(),
      status: 'reported',
      createdAt: new Date().toISOString()
    };

    StorageService.saveDamageReport(newReport);
    // Mark equipment damaged quantity
    eq.damagedQuantity += quantity;
    eq.availableQuantity = Math.max(0, eq.actualQuantity - eq.borrowingQuantity - eq.damagedQuantity);
    eq.status = 'needs_repair';
    StorageService.saveEquipment(eq);

    alert('Đã gửi báo hỏng thiết bị thành công đến tổ thiết bị!');
    setIsReportModalOpen(false);
    setErrorDesc('');
    refreshReports();
  };

  const handleSaveResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    selectedReport.status = statusVal;
    selectedReport.assignedStaffId = currentUser.id;
    selectedReport.assignedStaffName = currentUser.name;
    selectedReport.solution = solution;
    selectedReport.repairCost = repairCost;
    selectedReport.resultNotes = resultNotes;
    if (statusVal === 'repaired') {
      selectedReport.completedDate = new Date().toISOString().split('T')[0];

      // Restore equipment condition
      const eq = equipmentList.find((item) => item.id === selectedReport.equipmentId);
      if (eq) {
        eq.damagedQuantity = Math.max(0, eq.damagedQuantity - selectedReport.quantity);
        eq.availableQuantity = Math.max(0, eq.actualQuantity - eq.borrowingQuantity - eq.damagedQuantity);
        if (eq.damagedQuantity === 0) eq.status = 'good';
        StorageService.saveEquipment(eq);
      }
    }

    StorageService.saveDamageReport(selectedReport);
    alert('Đã cập nhật tiến độ xử lý và chi phí sửa chữa thiết bị!');
    setIsResolveModalOpen(false);
    refreshReports();
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Báo Hỏng & Quản Lý Sửa Chữa Thiết Bị</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 tabular-nums">
              {reports.filter((r) => r.status !== 'repaired').length} việc cần xử lý
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Giáo viên gửi báo hỏng tức thời, nhân viên thiết bị tiếp nhận xử lý và lưu vết lịch sử chi phí sửa chữa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Gửi báo hỏng thiết bị</span>
          </button>

          <button
            onClick={() => ExportService.exportDamageReportsToExcel(reports)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3 w-28">Mã TB</th>
                <th className="py-2.5 px-3 min-w-[200px]">Tên thiết bị & Số lượng</th>
                <th className="py-2.5 px-3 min-w-[220px]">Mô tả sự cố / Hư hỏng</th>
                <th className="py-2.5 px-3 w-32">Người & Ngày báo</th>
                <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 min-w-[160px]">Phương án & Chi phí</th>
                <th className="py-2.5 px-3 w-24 text-center no-print">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không có thiết bị nào đang trong diện báo hỏng hoặc sửa chữa.
                  </td>
                </tr>
              ) : (
                reports.map((r, idx) => {
                  const canResolve = isStaff || canManageSystem;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {r.equipmentCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{r.equipmentName}</div>
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Số lượng: {r.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <p className="line-clamp-2">{r.errorDescription}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{r.reportedBy}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.reportedDate}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'repaired'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : r.status === 'unrepairable'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status === 'repaired'
                            ? 'Đã sửa xong'
                            : r.status === 'processing'
                            ? 'Đang xử lý'
                            : r.status === 'unrepairable'
                            ? 'Chờ thanh lý'
                            : 'Mới báo hỏng'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">
                          {r.solution || 'Chưa lập phương án'}
                        </div>
                        {r.repairCost ? (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Chi phí: {r.repairCost.toLocaleString('vi-VN')} đ
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        {canResolve ? (
                          <button
                            onClick={() => handleOpenResolve(r)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            Xử lý
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Theo dõi</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Damage Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-900 text-white">
              <h2 className="text-base font-bold">Báo Hỏng Thiết Bị Dạy Học</h2>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewReport} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn thiết bị gặp sự cố *
                </label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-600"
                >
                  {equipmentList
                    .filter((e) => e.status !== 'archived')
                    .map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name} ({eq.storageRoom})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số lượng hỏng / lỗi *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả chi tiết triệu chứng hỏng hóc *
                </label>
                <textarea
                  rows={3}
                  required
                  value={errorDesc}
                  onChange={(e) => setErrorDesc(e.target.value)}
                  placeholder="VD: Không lên nguồn, gãy ốc điều chỉnh thấu kính, nứt vỡ ống dẫn khí..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-xs cursor-pointer"
                >
                  Gửi báo hỏng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve / Processing Modal for Staff */}
      {isResolveModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-base font-bold">Cập Nhật Tiến Độ & Chi Phí Sửa Chữa</h2>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolve} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Thiết bị:</span>
                <strong className="text-slate-900 text-sm">
                  {selectedReport.equipmentCode} - {selectedReport.equipmentName}
                </strong>
                <p className="text-slate-600 mt-1 italic">
                  Lỗi: {selectedReport.errorDescription}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trạng thái xử lý *
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="processing">Đang tiếp nhận / Đang sửa chữa</option>
                  <option value="repaired">Đã sửa xong (Phục hồi khả dụng cho kho)</option>
                  <option value="unrepairable">Không thể sửa (Đề nghị lập biên bản thanh lý)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phương án khắc phục
                </label>
                <select
                  value={solution}
                  onChange={(e) => setSolution(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Tự khắc phục tại trường">Tự khắc phục tại trường</option>
                  <option value="Gửi hãng bảo hành">Gửi hãng bảo hành</option>
                  <option value="Thuê đơn vị sửa chữa ngoài">Thuê đơn vị sửa chữa ngoài</option>
                  <option value="Đề nghị thanh lý">Đề nghị thanh lý</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chi phí sửa chữa (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairCost}
                  onChange={(e) => setRepairCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kết quả nghiệm thu kỹ thuật
                </label>
                <textarea
                  rows={2}
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
