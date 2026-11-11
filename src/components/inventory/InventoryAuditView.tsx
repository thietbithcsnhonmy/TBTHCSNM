import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import { InventoryAudit, InventoryItemCheck, Equipment } from '../../types';
import {
  CheckSquare,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  FileCheck2,
  Calendar,
  Users
} from 'lucide-react';

interface InventoryAuditViewProps {
  onPrintAudit: (audit: InventoryAudit) => void;
}

export const InventoryAuditView: React.FC<InventoryAuditViewProps> = ({ onPrintAudit }) => {
  const { currentUser, canManageSystem, isBGH } = useAuth();
  const [audits, setAudits] = useState<InventoryAudit[]>(() => StorageService.getInventoryAudits());
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(() => audits[0] || null);
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);

  // New Audit Form State
  const [newTitle, setNewTitle] = useState('Kiểm kê định kỳ thiết bị học kỳ I');
  const [newScopeType, setNewScopeType] = useState<'all' | 'subject' | 'room' | 'staff' | 'semester'>('all');
  const [newScopeValue, setNewScopeValue] = useState('');
  const [newLeadAuditor, setNewLeadAuditor] = useState(currentUser.name);
  const [newAuditorNames, setNewAuditorNames] = useState('Nguyễn Văn An, Trần Thị Bích, Lê Hoàng Cường');

  const refreshAudits = () => {
    const list = StorageService.getInventoryAudits();
    setAudits(list);
    if (selectedAudit) {
      const updated = list.find((a) => a.id === selectedAudit.id);
      setSelectedAudit(updated || list[0] || null);
    }
  };

  // Create New Audit
  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const allEq = StorageService.getEquipment();
    let targetEquipments: Equipment[] = [];

    if (newScopeType === 'all') {
      targetEquipments = allEq.filter((e) => e.status !== 'archived');
    } else if (newScopeType === 'subject' && newScopeValue) {
      targetEquipments = allEq.filter((e) => e.subject === newScopeValue);
    } else if (newScopeType === 'room' && newScopeValue) {
      targetEquipments = allEq.filter((e) => e.storageRoom === newScopeValue);
    } else {
      targetEquipments = allEq.filter((e) => e.status !== 'archived');
    }

    if (targetEquipments.length === 0) {
      alert('Không tìm thấy thiết bị nào trong phạm vi kiểm kê đã chọn!');
      return;
    }

    const items: InventoryItemCheck[] = targetEquipments.map((eq) => ({
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentName: eq.name,
      unit: eq.unit,
      bookQty: eq.bookQuantity,
      actualQty: eq.actualQuantity,
      diff: 0,
      goodQty: eq.actualQuantity - eq.damagedQuantity,
      damagedQty: eq.damagedQuantity,
      lostQty: 0,
      cause: '',
      statusText: eq.damagedQuantity > 0 ? 'Hư hỏng' : 'Đủ',
      auditor: currentUser.name,
      notes: ''
    }));

    const totalBook = items.reduce((s, i) => s + i.bookQty, 0);
    const totalActual = items.reduce((s, i) => s + i.actualQty, 0);
    const totalGood = items.reduce((s, i) => s + i.goodQty, 0);
    const totalDamaged = items.reduce((s, i) => s + i.damagedQty, 0);

    const newAudit: InventoryAudit = {
      id: `audit_${Date.now()}`,
      title: newTitle.trim(),
      scopeType: newScopeType,
      scopeValue: newScopeValue,
      academicYear: StorageService.getActiveYear(),
      auditDate: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      leadAuditor: newLeadAuditor,
      auditors: newAuditorNames.split(',').map((s) => s.trim()),
      items,
      totalBookQty: totalBook,
      totalActualQty: totalActual,
      totalGoodQty: totalGood,
      totalDamagedQty: totalDamaged,
      totalShortageQty: 0,
      totalExcessQty: 0,
      createdAt: new Date().toISOString()
    };

    StorageService.saveInventoryAudit(newAudit);
    refreshAudits();
    setSelectedAudit(newAudit);
    setIsNewAuditModalOpen(false);
  };

  // Update item counts inside audit
  const handleUpdateItemCounts = (
    index: number,
    actualVal: number,
    goodVal: number,
    damagedVal: number,
    lostVal: number,
    causeVal: string
  ) => {
    if (!selectedAudit || selectedAudit.status === 'approved_by_admin') return;

    const updated = { ...selectedAudit };
    const it = updated.items[index];
    it.actualQty = actualVal;
    it.goodQty = goodVal;
    it.damagedQty = damagedVal;
    it.lostQty = lostVal;
    it.diff = actualVal - it.bookQty;
    it.cause = causeVal;

    if (it.diff === 0 && damagedVal === 0) {
      it.statusText = 'Đủ';
    } else if (it.diff > 0) {
      it.statusText = 'Thừa';
    } else if (it.diff < 0) {
      it.statusText = 'Thiếu';
    } else if (damagedVal > 0) {
      it.statusText = 'Hư hỏng';
    }

    // Recompute audit totals
    updated.totalBookQty = updated.items.reduce((s, i) => s + i.bookQty, 0);
    updated.totalActualQty = updated.items.reduce((s, i) => s + i.actualQty, 0);
    updated.totalGoodQty = updated.items.reduce((s, i) => s + i.goodQty, 0);
    updated.totalDamagedQty = updated.items.reduce((s, i) => s + i.damagedQty, 0);
    updated.totalShortageQty = updated.items.filter((i) => i.diff < 0).reduce((s, i) => s + Math.abs(i.diff), 0);
    updated.totalExcessQty = updated.items.filter((i) => i.diff > 0).reduce((s, i) => s + i.diff, 0);

    StorageService.saveInventoryAudit(updated);
    setSelectedAudit({ ...updated });
  };

  // Admin approval & catalog sync
  const handleApproveByAdmin = () => {
    if (!selectedAudit) return;
    if (
      window.confirm(
        `Xác nhận phê duyệt đợt kiểm kê "${selectedAudit.title}"?\n\nSau khi duyệt, số lượng thực tế & tình trạng sẽ được đồng bộ chính thức vào Danh mục thiết bị toàn trường!`
      )
    ) {
      StorageService.applyInventoryResults(selectedAudit.id, currentUser);
      refreshAudits();
      alert('Đã phê duyệt và đồng bộ số liệu kiểm kê vào cơ sở dữ liệu thiết bị thành công!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Kiểm Kê Thiết Bị Dạy Học</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
              Định kỳ & Cuối kỳ
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Tự động tính chênh lệch, thừa/thiếu, chỉ cập nhật sổ sách sau khi người có thẩm quyền phê duyệt
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNewAuditModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đợt kiểm kê</span>
          </button>

          {selectedAudit && (
            <>
              <button
                onClick={() => ExportService.exportInventoryAuditToExcel(selectedAudit)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>

              <button
                onClick={() => onPrintAudit(selectedAudit)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Biên Bản</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Select Audit Dropdown / Switcher Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Chọn đợt kiểm kê:
          </span>
          <select
            value={selectedAudit?.id || ''}
            onChange={(e) => {
              const found = audits.find((a) => a.id === e.target.value);
              if (found) setSelectedAudit(found);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.auditDate}) - {a.status === 'approved_by_admin' ? 'Đã duyệt' : 'Đang thực hiện'}
              </option>
            ))}
          </select>
        </div>

        {selectedAudit && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                selectedAudit.status === 'approved_by_admin'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {selectedAudit.status === 'approved_by_admin'
                ? 'Đã được Ban giám hiệu phê duyệt'
                : 'Đang tiến hành kiểm kê'}
            </span>

            {canManageSystem && selectedAudit.status !== 'approved_by_admin' && (
              <button
                onClick={handleApproveByAdmin}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Ký duyệt & Đồng bộ tồn kho</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Audit Details */}
      {selectedAudit && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Số lượng theo sổ</span>
              <span className="text-lg font-bold text-slate-800 font-mono tabular-nums">
                {selectedAudit.totalBookQty}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Số lượng thực tế</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {selectedAudit.totalActualQty}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-emerald-700 block font-medium">Hoạt động tốt</span>
              <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                {selectedAudit.totalGoodQty}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-amber-700 block font-medium">Hư hỏng cần sửa</span>
              <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                {selectedAudit.totalDamagedQty}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-rose-700 block font-medium">Số lượng thiếu</span>
              <span className="text-lg font-bold text-rose-700 font-mono tabular-nums">
                {selectedAudit.totalShortageQty}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-blue-700 block font-medium">Số lượng thừa</span>
              <span className="text-lg font-bold text-blue-700 font-mono tabular-nums">
                {selectedAudit.totalExcessQty}
              </span>
            </div>
          </div>

          {/* Audit Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="text-xs text-slate-600">
                Trưởng ban kiểm kê: <strong className="text-slate-800">{selectedAudit.leadAuditor}</strong> · Thành viên: {selectedAudit.auditors.join(', ')}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {selectedAudit.items.length} danh mục
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    <th className="py-2.5 px-3 w-28">Mã TB</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Tên thiết bị</th>
                    <th className="py-2.5 px-3 text-center w-16">ĐVT</th>
                    <th className="py-2.5 px-3 text-right w-20">SL Sổ</th>
                    <th className="py-2.5 px-3 text-right w-24">SL Thực tế</th>
                    <th className="py-2.5 px-3 text-right w-20">Lệch</th>
                    <th className="py-2.5 px-3 text-right w-20 text-emerald-800">Tốt</th>
                    <th className="py-2.5 px-3 text-right w-20 text-amber-800">Hỏng</th>
                    <th className="py-2.5 px-3 w-28 text-center">Đánh giá</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Nguyên nhân / Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAudit.items.map((item, idx) => {
                    const isDiff = item.diff !== 0;
                    const isReadOnly = selectedAudit.status === 'approved_by_admin';

                    return (
                      <tr key={item.equipmentId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {item.equipmentCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {item.equipmentName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                          {item.bookQty}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isReadOnly ? (
                            <span className="font-mono font-bold text-slate-900">{item.actualQty}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={item.actualQty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleUpdateItemCounts(
                                  idx,
                                  val,
                                  item.goodQty,
                                  item.damagedQty,
                                  item.lostQty,
                                  item.cause || ''
                                );
                              }}
                              className="w-16 px-1.5 py-0.5 text-right font-mono font-bold border border-slate-300 rounded"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                          {item.diff === 0 ? (
                            <span className="text-slate-400">0</span>
                          ) : item.diff > 0 ? (
                            <span className="text-blue-600">+{item.diff}</span>
                          ) : (
                            <span className="text-rose-600">{item.diff}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isReadOnly ? (
                            <span className="font-mono text-emerald-800 font-semibold">{item.goodQty}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={item.actualQty}
                              value={item.goodQty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleUpdateItemCounts(
                                  idx,
                                  item.actualQty,
                                  val,
                                  item.damagedQty,
                                  item.lostQty,
                                  item.cause || ''
                                );
                              }}
                              className="w-14 px-1 py-0.5 text-right font-mono font-semibold text-emerald-800 border border-slate-300 rounded"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isReadOnly ? (
                            <span className="font-mono text-amber-700 font-semibold">{item.damagedQty}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={item.actualQty}
                              value={item.damagedQty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleUpdateItemCounts(
                                  idx,
                                  item.actualQty,
                                  item.goodQty,
                                  val,
                                  item.lostQty,
                                  item.cause || ''
                                );
                              }}
                              className="w-14 px-1 py-0.5 text-right font-mono font-semibold text-amber-700 border border-slate-300 rounded"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.statusText === 'Đủ'
                                ? 'bg-emerald-50 text-emerald-800'
                                : item.statusText === 'Thừa'
                                ? 'bg-blue-50 text-blue-700'
                                : item.statusText === 'Thiếu'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {item.statusText}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {isReadOnly ? (
                            <span className="text-slate-600">{item.cause || item.notes || '-'}</span>
                          ) : (
                            <input
                              type="text"
                              value={item.cause || ''}
                              onChange={(e) => {
                                handleUpdateItemCounts(
                                  idx,
                                  item.actualQty,
                                  item.goodQty,
                                  item.damagedQty,
                                  item.lostQty,
                                  e.target.value
                                );
                              }}
                              placeholder="Nhập nguyên nhân thừa/thiếu/hỏng..."
                              className="w-full px-2 py-0.5 text-[11px] border border-slate-300 rounded"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Audit Modal */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
              <h2 className="text-base font-bold">Khởi Tạo Đợt Kiểm Kê Thiết Bị</h2>
              <button
                onClick={() => setIsNewAuditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên đợt kiểm kê *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phạm vi kiểm kê
                  </label>
                  <select
                    value={newScopeType}
                    onChange={(e) => setNewScopeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="all">Kiểm kê toàn trường</option>
                    <option value="subject">Theo bộ môn</option>
                    <option value="room">Theo phòng thực hành/kho</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trưởng ban kiểm kê
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadAuditor}
                    onChange={(e) => setNewLeadAuditor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thành viên hội đồng kiểm kê (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={newAuditorNames}
                  onChange={(e) => setNewAuditorNames(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Lưu ý: Hệ thống sẽ tự động tổng hợp danh mục thiết bị tương ứng vào bảng biểu kiểm kê để các thành viên nhập kết quả thực tế.
              </p>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Tạo đợt kiểm kê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
