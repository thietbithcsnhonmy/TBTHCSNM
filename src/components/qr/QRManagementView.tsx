import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Equipment } from '../../types';
import {
  QrCode,
  Printer,
  Camera,
  Search,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';

interface QRManagementViewProps {
  onOpenQRScanner: () => void;
  onOpenPrintModal: (equipmentList: Equipment[]) => void;
}

export const QRManagementView: React.FC<QRManagementViewProps> = ({
  onOpenQRScanner,
  onOpenPrintModal
}) => {
  const equipmentList = StorageService.getEquipment().filter((e) => e.status !== 'archived');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filtered = equipmentList.filter((e) => {
    const matchSearch =
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === 'all' || e.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((e) => e.id));
    }
  };

  const handlePrintSelected = () => {
    const items = equipmentList.filter((e) => selectedIds.includes(e.id));
    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 01 thiết bị để in tem!');
      return;
    }
    onOpenPrintModal(items);
  };

  const handlePrintAll = () => {
    onOpenPrintModal(filtered);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Mã QR & Tem Nhãn Thiết Bị</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tạo mã QR tự động cho từng thiết bị/lô thiết bị, in tem nhãn chuẩn khổ dán và quét nhanh qua camera
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenQRScanner}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mở máy quét camera</span>
          </button>

          <button
            onClick={handlePrintSelected}
            disabled={selectedIds.length === 0}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedIds.length > 0
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-2xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In {selectedIds.length} tem đã chọn</span>
          </button>

          <button
            onClick={handlePrintAll}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-800" />
            <span>In toàn bộ ({filtered.length} tem)</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {selectedIds.length === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-800" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Chọn tất cả ({selectedIds.length}/{filtered.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Table list with checkboxes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">Chọn</th>
                <th className="py-2.5 px-3 w-28">Mã thiết bị</th>
                <th className="py-2.5 px-3 min-w-[220px]">Tên thiết bị</th>
                <th className="py-2.5 px-3 w-32">Môn & Khối</th>
                <th className="py-2.5 px-3 min-w-[180px]">Phòng & Vị trí</th>
                <th className="py-2.5 px-3 text-right w-20">Khả dụng</th>
                <th className="py-2.5 px-3 text-center w-24 no-print">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isChecked ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {item.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.topic || 'Dùng chung'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{item.subject}</div>
                      <div className="text-[10px] text-slate-500">{item.grade}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="truncate max-w-[180px] font-medium">{item.storageRoom}</div>
                      <div className="text-[10px] text-slate-500">{item.location || 'Chưa xếp'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      {item.availableQuantity} {item.unit}
                    </td>
                    <td
                      className="py-2.5 px-3 text-center no-print"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onOpenPrintModal([item])}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer"
                      >
                        In tem này
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
