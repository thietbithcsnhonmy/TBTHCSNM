import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import { Equipment, SubjectCategory, EquipmentStatus } from '../../types';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  QrCode,
  Edit2,
  Archive,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Building
} from 'lucide-react';

interface EquipmentCatalogViewProps {
  onOpenQRScanner: () => void;
  onOpenQRPrintModal: (equipmentList: Equipment[]) => void;
}

const SUBJECT_OPTIONS: SubjectCategory[] = [
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Khoa học tự nhiên',
  'Công nghệ',
  'Tin học',
  'Toán học',
  'Ngữ văn',
  'Lịch sử và Địa lí',
  'Giáo dục thể chất',
  'Nghệ thuật',
  'Thiết bị dùng chung',
  'Các môn học khác'
];

export const EquipmentCatalogView: React.FC<EquipmentCatalogViewProps> = ({
  onOpenQRScanner,
  onOpenQRPrintModal
}) => {
  const { currentUser, canEditEquipment } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => StorageService.getEquipment());
  const rooms = StorageService.getRooms();
  const schoolInfo = StorageService.getSchoolInfo();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);

  // File Input for Excel Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = () => {
    setEquipmentList(StorageService.getEquipment());
  };

  // Filtered equipment list
  const filteredList = useMemo(() => {
    return equipmentList.filter((item) => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.topic && item.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.storageRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Subject
      const matchSubject = selectedSubject === 'all' || item.subject === selectedSubject;

      // Grade
      const matchGrade = selectedGrade === 'all' || item.grade === selectedGrade;

      // Room
      const matchRoom = selectedRoom === 'all' || item.storageRoom === selectedRoom;

      // Status
      const matchStatus =
        selectedStatus === 'all'
          ? item.status !== 'archived'
          : selectedStatus === 'archived'
          ? item.status === 'archived'
          : item.status === selectedStatus;

      return matchSearch && matchSubject && matchGrade && matchRoom && matchStatus;
    });
  }, [equipmentList, searchQuery, selectedSubject, selectedGrade, selectedRoom, selectedStatus]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Equipment>>({
    code: '',
    name: '',
    subject: 'Khoa học tự nhiên',
    grade: 'Khối 8',
    topic: '',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 1,
    actualQuantity: 1,
    damagedQuantity: 0,
    borrowingQuantity: 0,
    yearInUse: 2026,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 500000,
    storageRoom: rooms[0]?.name || 'Phòng thiết bị dùng chung 1 (Nhà B)',
    location: '',
    status: 'good',
    notes: ''
  });

  const handleOpenAdd = () => {
    // Generate code pattern
    const nextNum = String(equipmentList.length + 1).padStart(3, '0');
    setFormData({
      code: `TB-KHTN-${nextNum}`,
      name: '',
      subject: 'Khoa học tự nhiên',
      grade: 'Khối 8',
      topic: '',
      unit: 'Bộ',
      isBatch: true,
      bookQuantity: 1,
      actualQuantity: 1,
      damagedQuantity: 0,
      borrowingQuantity: 0,
      yearInUse: 2026,
      source: 'Cấp phát Bộ/Sở GD&ĐT',
      price: 500000,
      storageRoom: rooms[0]?.name || 'Phòng thiết bị dùng chung 1 (Nhà B)',
      location: 'Tủ 01 - Ngăn 1',
      status: 'good',
      notes: ''
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập đầy đủ Mã thiết bị và Tên thiết bị!');
      return;
    }

    const bookQty = Number(formData.bookQuantity) || 0;
    const actualQty = Number(formData.actualQuantity) || 0;
    const damagedQty = Number(formData.damagedQuantity) || 0;
    const borrowingQty = editingItem ? editingItem.borrowingQuantity : 0;
    const availableQty = Math.max(0, actualQty - borrowingQty - damagedQty);

    const itemToSave: Equipment = {
      id: editingItem ? editingItem.id : `eq_${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      imageUrl: formData.imageUrl || '',
      subject: formData.subject as SubjectCategory,
      grade: formData.grade as any,
      topic: formData.topic || '',
      unit: formData.unit || 'Bộ',
      isBatch: formData.isBatch ?? true,
      bookQuantity: bookQty,
      actualQuantity: actualQty,
      borrowingQuantity: borrowingQty,
      damagedQuantity: damagedQty,
      availableQuantity: availableQty,
      yearInUse: Number(formData.yearInUse) || 2026,
      source: formData.source as any,
      price: Number(formData.price) || 0,
      storageRoom: formData.storageRoom || rooms[0]?.name || '',
      location: formData.location || '',
      assignedStaffId: formData.assignedStaffId || currentUser.id,
      status: (formData.status as EquipmentStatus) || 'good',
      notes: formData.notes || '',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name
    };

    StorageService.saveEquipment(itemToSave);
    refreshList();
    setIsModalOpen(false);
  };

  const handleArchive = (id: string, name: string) => {
    if (window.confirm(`Xác nhận chuyển thiết bị "${name}" sang trạng thái Ngừng theo dõi? (Lịch sử giao dịch vẫn được lưu giữ đầy đủ)`)) {
      StorageService.archiveEquipment(id);
      refreshList();
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    ExportService.exportEquipmentToExcel(filteredList, schoolInfo);
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let importedCount = 0;
        data.forEach((row, idx) => {
          const code = row['Mã thiết bị'] || row['Mã'] || `TB-IMP-${Date.now()}-${idx}`;
          const name = row['Tên thiết bị'] || row['Tên'];
          if (!name) return;

          const bookQty = Number(row['Số lượng sổ sách'] || row['SL Sổ'] || 1);
          const actualQty = Number(row['Số lượng thực tế'] || row['SL Thực tế'] || bookQty);
          const damagedQty = Number(row['Hư hỏng'] || 0);

          const eq: Equipment = {
            id: `eq_imp_${Date.now()}_${idx}`,
            code: String(code).trim().toUpperCase(),
            name: String(name).trim(),
            subject: (row['Môn học'] as SubjectCategory) || 'Khoa học tự nhiên',
            grade: (row['Khối lớp'] as any) || 'Khối 8',
            topic: row['Chủ đề / Bài dạy'] || '',
            unit: row['Đơn vị tính'] || row['ĐVT'] || 'Bộ',
            isBatch: true,
            bookQuantity: bookQty,
            actualQuantity: actualQty,
            borrowingQuantity: 0,
            damagedQuantity: damagedQty,
            availableQuantity: Math.max(0, actualQty - damagedQty),
            yearInUse: Number(row['Năm sử dụng'] || 2026),
            source: (row['Nguồn gốc'] as any) || 'Cấp phát Bộ/Sở GD&ĐT',
            price: Number(row['Đơn giá (VNĐ)'] || 500000),
            storageRoom: row['Phòng lưu trữ'] || rooms[0]?.name || '',
            location: row['Vị trí cụ thể'] || '',
            assignedStaffId: currentUser.id,
            status: 'good',
            notes: `Nhập từ file Excel: ${file.name}`,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name
          };

          StorageService.saveEquipment(eq);
          importedCount++;
        });

        alert(`Đã nhập thành công ${importedCount} thiết bị từ file Excel!`);
        refreshList();
      } catch (err) {
        console.error(err);
        alert('Lỗi định dạng file Excel. Vui lòng kiểm tra lại cấu trúc các cột!');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Danh Mục Thiết Bị Dạy Học</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 tabular-nums">
              {filteredList.length} / {equipmentList.length} thiết bị
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý số lượng sổ sách, thực tế, khả dụng và vị trí lưu trữ theo môn học GDPT 2018
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canEditEquipment() && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thiết bị</span>
            </button>
          )}

          <button
            onClick={() => onOpenQRPrintModal(filteredList)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="In tem nhãn QR cho các thiết bị đang hiển thị"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In tem QR</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {canEditEquipment() && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">Nhập Excel</span>
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="In danh mục"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã, bài dạy, phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả môn học ({SUBJECT_OPTIONS.length})</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="Khối 6">Khối 6</option>
              <option value="Khối 7">Khối 7</option>
              <option value="Khối 8">Khối 8</option>
              <option value="Khối 9">Khối 9</option>
              <option value="Dùng chung">Dùng chung</option>
            </select>
          </div>

          {/* Room Filter */}
          <div>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả phòng lưu trữ ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tình trạng (Hoạt động)</option>
              <option value="good">Hoạt động tốt</option>
              <option value="needs_repair">Cần sửa chữa</option>
              <option value="damaged">Hư hỏng</option>
              <option value="archived">Ngừng theo dõi (Lưu trữ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-3 w-28">Mã TB</th>
                <th className="py-3 px-3 min-w-[240px]">Tên thiết bị & Bài dạy</th>
                <th className="py-3 px-3 w-28">Môn & Khối</th>
                <th className="py-3 px-3 text-right w-16">SL Sổ</th>
                <th className="py-3 px-3 text-right w-16">Thực tế</th>
                <th className="py-3 px-3 text-right w-16">Đang mượn</th>
                <th className="py-3 px-3 text-right w-16">Hỏng</th>
                <th className="py-3 px-3 text-right w-20 text-emerald-800 font-bold">Khả dụng</th>
                <th className="py-3 px-3 min-w-[180px]">Phòng & Vị trí</th>
                <th className="py-3 px-3 w-24 text-center">Tình trạng</th>
                <th className="py-3 px-3 w-24 text-center no-print">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const canEditThis = canEditEquipment(item.subject, item.storageRoom);
                  const isAvailable = item.availableQuantity > 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setDetailItem(item)}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-semibold text-slate-800 tracking-tight">
                          {item.code}
                        </span>
                        {item.isBatch ? (
                          <span className="block text-[10px] text-slate-400">Theo lô</span>
                        ) : (
                          <span className="block text-[10px] text-blue-600 font-medium">Đơn chiếc</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {item.name}
                        </div>
                        {item.topic && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {item.topic}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{item.subject}</div>
                        <div className="text-[10px] text-slate-500">{item.grade}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                        {item.bookQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 font-semibold">
                        {item.actualQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-600 font-medium">
                        {item.borrowingQuantity > 0 ? item.borrowingQuantity : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-600 font-medium">
                        {item.damagedQuantity > 0 ? item.damagedQuantity : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-sm ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.availableQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 truncate max-w-[180px] font-medium" title={item.storageRoom}>
                          {item.storageRoom}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {item.location || 'Chưa xếp vị trí'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'good' ? (
                          <span className="text-[11px] text-emerald-700 font-semibold">Tốt</span>
                        ) : item.status === 'needs_repair' ? (
                          <span className="text-[11px] text-amber-700 font-semibold">Cần sửa</span>
                        ) : item.status === 'damaged' ? (
                          <span className="text-[11px] text-rose-700 font-semibold">Hỏng</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Lưu trữ</span>
                        )}
                      </td>
                      <td
                        className="py-2.5 px-3 text-center no-print"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailItem(item)}
                            title="Xem chi tiết & mã QR"
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-emerald-50 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEditThis && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Sửa thông tin"
                              className="p-1 text-slate-400 hover:text-blue-700 rounded-md hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEditThis && item.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(item.id, item.name)}
                              title="Ngừng theo dõi (Lưu trữ)"
                              className="p-1 text-slate-400 hover:text-rose-700 rounded-md hover:bg-rose-50 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
              <h2 className="text-base font-bold">
                {editingItem ? 'Chỉnh Sửa Thông Tin Thiết Bị' : 'Thêm Thiết Bị Dạy Học Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã thiết bị duy nhất *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="VD: TB-VL-005"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên thiết bị dạy học *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="VD: Bộ thí nghiệm quang học hình học"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as SubjectCategory })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Dùng chung">Dùng chung</option>
                  </select>
                </div>

                {/* Topic / Lesson */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chủ đề / Bài dạy áp dụng
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="VD: Chương IV: Điện học và từ học (KHTN 8)"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn vị tính *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Bộ, Cái, Chiếc, Hộp..."
                  />
                </div>

                {/* Management Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phương thức quản lý
                  </label>
                  <select
                    value={formData.isBatch ? 'batch' : 'single'}
                    onChange={(e) => setFormData({ ...formData, isBatch: e.target.value === 'batch' })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="batch">Quản lý theo lô (nhiều chiếc/bộ cùng mã)</option>
                    <option value="single">Quản lý đơn chiếc (tài sản cá thể)</option>
                  </select>
                </div>

                {/* Book Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng theo sổ sách *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.bookQuantity}
                    onChange={(e) => setFormData({ ...formData, bookQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Actual Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng thực tế trong kho *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.actualQuantity}
                    onChange={(e) => setFormData({ ...formData, actualQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Damaged Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng hư hỏng (nếu có)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.damagedQuantity}
                    onChange={(e) => setFormData({ ...formData, damagedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono text-amber-700"
                  />
                </div>

                {/* Year in Use */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm đưa vào sử dụng
                  </label>
                  <input
                    type="number"
                    value={formData.yearInUse}
                    onChange={(e) => setFormData({ ...formData, yearInUse: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Source of Funding */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nguồn hình thành
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Cấp phát Bộ/Sở GD&ĐT">Cấp phát Bộ/Sở GD&ĐT</option>
                    <option value="Nhà trường tự mua sắm">Nhà trường tự mua sắm</option>
                    <option value="Tài trợ / Xã hội hóa">Tài trợ / Xã hội hóa</option>
                    <option value="Tự làm">Tự làm</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn giá ước tính (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Storage Room */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng lưu trữ *
                  </label>
                  <select
                    value={formData.storageRoom}
                    onChange={(e) => setFormData({ ...formData, storageRoom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location in Room */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vị trí cụ thể (Tủ / Ngăn / Kệ)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="VD: Tủ 02 - Ngăn 3"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tình trạng kỹ thuật
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="good">Hoạt động tốt</option>
                    <option value="needs_repair">Cần sửa chữa</option>
                    <option value="damaged">Hư hỏng không thể dùng</option>
                    <option value="lost">Mất / Thất lạc</option>
                    <option value="archived">Ngừng theo dõi (Lưu trữ)</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi chú chi tiết
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Thông tin phụ kiện kèm theo, hiện trạng bảo quản..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold">Hồ Sơ Kỹ Thuật Thiết Bị</h2>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                    {detailItem.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {detailItem.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Môn: <strong className="text-slate-800">{detailItem.subject}</strong> · {detailItem.grade}
                  </p>
                </div>
              </div>

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Số lượng sổ sách:</span>
                  <strong className="text-slate-800 tabular-nums">{detailItem.bookQuantity} {detailItem.unit}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số lượng thực tế:</span>
                  <strong className="text-slate-800 tabular-nums">{detailItem.actualQuantity} {detailItem.unit}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Đang cho mượn:</span>
                  <strong className="text-indigo-600 tabular-nums">{detailItem.borrowingQuantity} {detailItem.unit}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Khả dụng còn lại:</span>
                  <strong className="text-emerald-700 font-bold tabular-nums">
                    {detailItem.availableQuantity} {detailItem.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Phòng lưu trữ:</span>
                  <strong className="text-slate-800">{detailItem.storageRoom}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Vị trí:</span>
                  <strong className="text-slate-800">{detailItem.location || 'Chưa định vị'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Năm sử dụng:</span>
                  <strong className="text-slate-800 tabular-nums">{detailItem.yearInUse}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nguồn kinh phí:</span>
                  <strong className="text-slate-800">{detailItem.source}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Chủ đề bài dạy:</span>
                  <strong className="text-slate-800">{detailItem.topic || 'Dùng chung'}</strong>
                </div>
                {detailItem.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Ghi chú:</span>
                    <p className="text-slate-700 italic">{detailItem.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Cập nhật bởi: {detailItem.updatedBy}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenQRPrintModal([detailItem]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-semibold hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>In tem QR mã này</span>
                  </button>
                  <button
                    onClick={() => setDetailItem(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
