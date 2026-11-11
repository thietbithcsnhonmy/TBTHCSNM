import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import { BorrowTicket, BorrowItem, Equipment, BorrowStatus } from '../../types';
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  X,
  UserCheck,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface BorrowReturnViewProps {
  onPrintTicket: (ticket: BorrowTicket) => void;
}

export const BorrowReturnView: React.FC<BorrowReturnViewProps> = ({ onPrintTicket }) => {
  const { currentUser, isStaff, canManageSystem, isTeacher } = useAuth();
  const [tickets, setTickets] = useState<BorrowTicket[]>(() => StorageService.getBorrowTickets());
  const equipmentList = StorageService.getEquipment();

  // Search & Status Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');

  // Modal states
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTicketForReturn, setSelectedTicketForReturn] = useState<BorrowTicket | null>(null);

  // Return inspection form state
  const [returnInspectItems, setReturnInspectItems] = useState<
    {
      equipmentId: string;
      returnedNormalQty: number;
      returnedDamagedQty: number;
      returnedLostQty: number;
      notes: string;
    }[]
  >([]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  const refreshTickets = () => {
    setTickets(StorageService.getBorrowTickets());
  };

  // Form for New Borrow Ticket
  const [newTargetClass, setNewTargetClass] = useState('8A1');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newUseDate, setNewUseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newUsePeriod, setNewUsePeriod] = useState('Tiết 2, 3 - Buổi sáng');
  const [newRoomUsed, setNewRoomUsed] = useState('Phòng thực hành Lý - Công nghệ 1');
  const [newNotes, setNewNotes] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<
    { equipment: Equipment; requestedQty: number }[]
  >([]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // If teacher, can view all or view own? Prompt states: "Giáo viên: Xem trạng thái yêu cầu, Xem lịch sử mượn – trả của bản thân".
      const isMatchRole = isTeacher ? t.teacherId === currentUser.id : true;

      const matchSearch =
        searchQuery === '' ||
        t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.targetClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (activeStatusTab === 'pending') matchStatus = t.status === 'pending';
      else if (activeStatusTab === 'approved') matchStatus = t.status === 'approved';
      else if (activeStatusTab === 'handed_over') matchStatus = t.status === 'handed_over';
      else if (activeStatusTab === 'returned') matchStatus = t.status === 'returned' || t.status === 'damaged_returned';
      else if (activeStatusTab === 'overdue') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchStatus = (t.status === 'handed_over' || t.status === 'approved') && t.expectedReturnDate < todayStr;
      }

      return isMatchRole && matchSearch && matchStatus;
    });
  }, [tickets, isTeacher, currentUser.id, searchQuery, activeStatusTab]);

  // Handle staff approve
  const handleApprove = (ticketId: string) => {
    if (StorageService.approveBorrowTicket(ticketId, currentUser, 'Đã phê duyệt và chuẩn bị thiết bị')) {
      refreshTickets();
    }
  };

  // Handle staff handover
  const handleHandover = (ticketId: string) => {
    try {
      if (StorageService.handoverBorrowTicket(ticketId, currentUser)) {
        alert('Đã xuất kho bàn giao thiết bị thành công! Tồn kho đã được cập nhật.');
        refreshTickets();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bàn giao thiết bị');
    }
  };

  // Open return modal
  const handleOpenReturnModal = (ticket: BorrowTicket) => {
    setSelectedTicketForReturn(ticket);
    setReturnInspectItems(
      ticket.items.map((i) => ({
        equipmentId: i.equipmentId,
        returnedNormalQty: i.handedQty, // default return full normal
        returnedDamagedQty: 0,
        returnedLostQty: 0,
        notes: ''
      }))
    );
    setInspectionNotes('Thiết bị được kiểm tra sạch sẽ, hoạt động bình thường.');
    setIsReturnModalOpen(true);
  };

  // Confirm Return
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForReturn) return;

    StorageService.returnBorrowTicket(
      selectedTicketForReturn.id,
      currentUser,
      returnInspectItems,
      inspectionNotes
    );

    alert('Đã tiếp nhận và cập nhật số lượng thiết bị trả vào kho thành công!');
    setIsReturnModalOpen(false);
    refreshTickets();
  };

  // Add Item to New Borrow List
  const handleAddEquipmentToTicket = (eq: Equipment) => {
    if (selectedEquipments.some((item) => item.equipment.id === eq.id)) {
      alert('Thiết bị này đã có trong danh sách đăng ký!');
      return;
    }
    if (eq.availableQuantity <= 0) {
      alert(`Thiết bị "${eq.name}" hiện không còn khả dụng trong kho!`);
      return;
    }
    setSelectedEquipments([...selectedEquipments, { equipment: eq, requestedQty: 1 }]);
  };

  // Submit new Borrow Ticket
  const handleSubmitNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEquipments.length === 0) {
      alert('Vui lòng chọn ít nhất 01 thiết bị dạy học!');
      return;
    }
    if (!newLessonTitle.trim()) {
      alert('Vui lòng nhập Tên bài dạy / Chuyên đề!');
      return;
    }

    const ticketItems: BorrowItem[] = selectedEquipments.map((item) => ({
      equipmentId: item.equipment.id,
      equipmentCode: item.equipment.code,
      equipmentName: item.equipment.name,
      unit: item.equipment.unit,
      requestedQty: item.requestedQty,
      handedQty: 0,
      returnedNormalQty: 0,
      returnedDamagedQty: 0,
      returnedLostQty: 0
    }));

    const nextCode = `PM-2026-${String(tickets.length + 44).padStart(4, '0')}`;

    const newTicket: BorrowTicket = {
      id: `ticket_${Date.now()}`,
      ticketCode: nextCode,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherPhone: currentUser.phone || '0903.000.000',
      department: currentUser.department || 'Tổ Bộ môn',
      targetClass: newTargetClass,
      lessonTitle: newLessonTitle.trim(),
      useDate: newUseDate,
      usePeriod: newUsePeriod,
      roomUsed: newRoomUsed,
      expectedReturnDate: newUseDate,
      items: ticketItems,
      status: 'pending',
      requestNotes: newNotes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.saveBorrowTicket(newTicket);
    StorageService.addAuditLog(
      'borrow',
      `Tạo yêu cầu mượn thiết bị mới: ${newTicket.ticketCode} (${newTicket.lessonTitle})`,
      'borrow',
      newTicket.id
    );

    alert(`Gửi yêu cầu mượn thiết bị thành công! Mã phiếu: ${newTicket.ticketCode}`);
    setIsNewTicketModalOpen(false);
    setSelectedEquipments([]);
    setNewLessonTitle('');
    setNewNotes('');
    refreshTickets();
  };

  // Export ledger to excel
  const handleExportLedger = () => {
    ExportService.exportBorrowLedgerToExcel(filteredTickets);
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sổ Mượn – Trả Thiết Bị Dạy Học</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 tabular-nums">
              {filteredTickets.length} phiếu
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Quy trình mượn - duyệt - giao - kiểm tra trả đồng bộ trực tiếp với tồn kho thực tế
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu mượn</span>
          </button>

          <button
            onClick={handleExportLedger}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Xuất Sổ Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'approved', label: 'Đã duyệt' },
              { id: 'handed_over', label: 'Đang mượn (Đã giao)' },
              { id: 'returned', label: 'Đã trả' },
              { id: 'overdue', label: 'Quá hạn' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeStatusTab === tab.id
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo số phiếu, tên GV, lớp, bài..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Tickets List View */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
            Không có phiếu mượn nào trong danh mục này.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isPending = ticket.status === 'pending';
            const isApproved = ticket.status === 'approved';
            const isHandedOver = ticket.status === 'handed_over';
            const isReturned = ticket.status === 'returned';
            const isDamagedReturned = ticket.status === 'damaged_returned';

            const canApprove = isStaff || canManageSystem;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                      {ticket.ticketCode}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-100 text-amber-800'
                          : isApproved
                          ? 'bg-blue-100 text-blue-800'
                          : isHandedOver
                          ? 'bg-indigo-100 text-indigo-800'
                          : isReturned
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDamagedReturned
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isPending
                        ? 'Chờ nhân viên duyệt'
                        : isApproved
                        ? 'Đã duyệt (Chờ bàn giao)'
                        : isHandedOver
                        ? 'Đang mượn sử dụng'
                        : isReturned
                        ? 'Đã trả đủ & lưu kho'
                        : isDamagedReturned
                        ? 'Đã trả (Có thiết bị hỏng/mất)'
                        : ticket.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Lớp: <strong className="text-slate-800">{ticket.targetClass}</strong> · {ticket.usePeriod} (Ngày {ticket.useDate})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPrintTicket(ticket)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="In Phiếu Mượn / Trả"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>In phiếu</span>
                    </button>
                  </div>
                </div>

                {/* Lesson & Teacher details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Bài học / Tiết dạy:</span>
                    <strong className="text-slate-900 font-semibold">{ticket.lessonTitle}</strong>
                    {ticket.roomUsed && (
                      <span className="block text-slate-500 text-[11px] mt-0.5">
                        Tại: {ticket.roomUsed}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Giáo viên mượn:</span>
                    <strong className="text-slate-900">{ticket.teacherName}</strong>
                    <span className="block text-slate-500 text-[11px] mt-0.5">
                      {ticket.department} · ĐT: {ticket.teacherPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cán bộ thiết bị xử lý:</span>
                    <span className="text-slate-800 font-medium">
                      {ticket.assignedStaffName || ticket.handedOverBy || 'Chưa chỉ định'}
                    </span>
                    {ticket.handedOverAt && (
                      <span className="block text-slate-500 text-[11px] mt-0.5">
                        Giao lúc: {new Date(ticket.handedOverAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Table inside Ticket */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                      <tr>
                        <th className="py-1.5 px-3">Mã TB</th>
                        <th className="py-1.5 px-3">Tên thiết bị</th>
                        <th className="py-1.5 px-3 text-center">ĐVT</th>
                        <th className="py-1.5 px-3 text-right">SL Mượn</th>
                        <th className="py-1.5 px-3 text-right">SL Đã giao</th>
                        <th className="py-1.5 px-3 text-right">SL Đã trả</th>
                        <th className="py-1.5 px-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {ticket.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-700">
                            {item.equipmentCode}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {item.equipmentName}
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500">
                            {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                            {item.requestedQty}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-indigo-600 font-semibold">
                            {item.handedQty}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                            {item.returnedNormalQty + item.returnedDamagedQty + item.returnedLostQty > 0
                              ? `${item.returnedNormalQty} tốt${
                                  item.returnedDamagedQty > 0 ? ` + ${item.returnedDamagedQty} hỏng` : ''
                                }`
                              : '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {item.itemNotes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes and Workflow Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500">
                    {ticket.requestNotes && (
                      <span className="italic">Ghi chú: {ticket.requestNotes}</span>
                    )}
                  </div>

                  {/* Actions for Staff */}
                  <div className="flex items-center gap-2 shrink-0">
                    {canApprove && isPending && (
                      <button
                        onClick={() => handleApprove(ticket.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt yêu cầu</span>
                      </button>
                    )}

                    {canApprove && (isPending || isApproved) && (
                      <button
                        onClick={() => handleHandover(ticket.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                        title="Bàn giao thiết bị và xuất kho trừ tồn khả dụng"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Bàn giao thiết bị</span>
                      </button>
                    )}

                    {canApprove && isHandedOver && (
                      <button
                        onClick={() => handleOpenReturnModal(ticket)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kiểm tra & Thu hồi thiết bị</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Borrow Request Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
              <div>
                <h2 className="text-base font-bold">Đăng Ký Mượn Thiết Bị Dạy Học</h2>
                <p className="text-xs text-emerald-300">
                  Người đăng ký: {currentUser.name} ({currentUser.department})
                </p>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTicket} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Target Class */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lớp giảng dạy *
                  </label>
                  <select
                    value={newTargetClass}
                    onChange={(e) => setNewTargetClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
                  >
                    {[
                      '6A1', '6A2', '6A3', '6A4', '6A5', '6A6', '6A7', '6A8', '6A9', '6A10', '6A11',
                      '7A1', '7A2', '7A3', '7A4', '7A5', '7A6', '7A7', '7A8', '7A9', '7A10', '7A11',
                      '8A1', '8A2', '8A3', '8A4', '8A5', '8A6', '8A7', '8A8', '8A9', '8A10',
                      '9A1', '9A2', '9A3', '9A4', '9A5', '9A6', '9A7', '9A8', '9A9', '9A10'
                    ].map((cls) => (
                      <option key={cls} value={cls}>
                        Lớp {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày sử dụng *
                  </label>
                  <input
                    type="date"
                    required
                    value={newUseDate}
                    onChange={(e) => setNewUseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tiết học *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsePeriod}
                    onChange={(e) => setNewUsePeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="VD: Tiết 1, 2 Buổi sáng"
                  />
                </div>

                {/* Lesson Title */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên bài dạy / Hoạt động thực hành *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="VD: Bài 12: Điện trở của dây dẫn - Định luật Ôm"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phòng thực hiện
                  </label>
                  <input
                    type="text"
                    value={newRoomUsed}
                    onChange={(e) => setNewRoomUsed(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="VD: Phòng TH Lý 1 hoặc Lớp 8A2"
                  />
                </div>
              </div>

              {/* Equipment Selection Area */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-900">
                    Danh Sách Thiết Bị Cần Mượn ({selectedEquipments.length} loại)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Chỉ mượn trong phạm vi số lượng khả dụng
                  </span>
                </div>

                {/* Selected list */}
                {selectedEquipments.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <tr>
                          <th className="py-2 px-3 text-left">Mã & Tên thiết bị</th>
                          <th className="py-2 px-3 text-center">Khả dụng</th>
                          <th className="py-2 px-3 text-center w-28">SL Mượn</th>
                          <th className="py-2 px-3 text-center w-12">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEquipments.map((item, idx) => (
                          <tr key={item.equipment.id}>
                            <td className="py-2 px-3">
                              <span className="font-mono font-semibold text-slate-700">
                                {item.equipment.code}
                              </span>
                              <div className="font-medium text-slate-900">
                                {item.equipment.name}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-emerald-700 font-semibold">
                              {item.equipment.availableQuantity} {item.equipment.unit}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                max={item.equipment.availableQuantity}
                                value={item.requestedQty}
                                onChange={(e) => {
                                  const val = Math.min(
                                    item.equipment.availableQuantity,
                                    Math.max(1, Number(e.target.value))
                                  );
                                  const updated = [...selectedEquipments];
                                  updated[idx].requestedQty = val;
                                  setSelectedEquipments(updated);
                                }}
                                className="w-20 px-2 py-1 text-center font-mono rounded border border-slate-300 font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEquipments(
                                    selectedEquipments.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Quick Add Equipment Picker */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    + Thêm thiết bị từ danh mục kho:
                  </span>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 text-xs bg-white rounded border border-slate-200">
                    {equipmentList
                      .filter((e) => e.status !== 'archived')
                      .map((eq) => {
                        const isAdded = selectedEquipments.some((s) => s.equipment.id === eq.id);
                        return (
                          <div
                            key={eq.id}
                            className="p-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="truncate max-w-md">
                              <span className="font-mono font-semibold text-slate-700 mr-2">
                                {eq.code}
                              </span>
                              <span className="font-medium text-slate-900">{eq.name}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {eq.subject} · Còn: <strong className="text-emerald-700">{eq.availableQuantity} {eq.unit}</strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={isAdded || eq.availableQuantity <= 0}
                              onClick={() => handleAddEquipmentToTicket(eq)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                                isAdded
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : eq.availableQuantity <= 0
                                  ? 'bg-rose-50 text-rose-400 cursor-not-allowed'
                                  : 'bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer'
                              }`}
                            >
                              {isAdded ? 'Đã thêm' : eq.availableQuantity <= 0 ? 'Hết hàng' : '+ Chọn'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-xs text-slate-700 mb-1">
                    Ghi chú / Yêu cầu chuẩn bị thêm cho nhân viên thiết bị
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="VD: Cần hỗ trợ pha dung dịch, cắm thử máy chiếu trước tiết 1..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Gửi yêu cầu mượn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Inspection Modal */}
      {isReturnModalOpen && selectedTicketForReturn && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h2 className="text-base font-bold">Nghiệm Thu & Nhận Lại Thiết Bị</h2>
                <p className="text-xs text-slate-300">
                  Phiếu {selectedTicketForReturn.ticketCode} · GV: {selectedTicketForReturn.teacherName} (Lớp {selectedTicketForReturn.targetClass})
                </p>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Nhân viên thiết bị kiểm tra số lượng và hiện trạng kỹ thuật từng thiết bị hoàn trả. Hệ thống sẽ tự động cập nhật lại tồn kho khả dụng.
              </p>

              <div className="space-y-3">
                {selectedTicketForReturn.items.map((item, idx) => {
                  const currentInspect = returnInspectItems[idx] || {
                    equipmentId: item.equipmentId,
                    returnedNormalQty: item.handedQty,
                    returnedDamagedQty: 0,
                    returnedLostQty: 0,
                    notes: ''
                  };

                  return (
                    <div
                      key={item.equipmentId}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800 mr-2">
                            {item.equipmentCode}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.equipmentName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-indigo-700">
                          Đã giao: {item.handedQty} {item.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-emerald-800 block mb-0.5">
                            Trả tốt (bình thường):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.handedQty}
                            value={currentInspect.returnedNormalQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...returnInspectItems];
                              updated[idx].returnedNormalQty = val;
                              setReturnInspectItems(updated);
                            }}
                            className="w-full px-2 py-1 text-center font-mono rounded border border-slate-300 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-amber-800 block mb-0.5">
                            Trả hỏng / lỗi:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.handedQty}
                            value={currentInspect.returnedDamagedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...returnInspectItems];
                              updated[idx].returnedDamagedQty = val;
                              setReturnInspectItems(updated);
                            }}
                            className="w-full px-2 py-1 text-center font-mono rounded border border-slate-300 font-semibold text-amber-700"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-rose-800 block mb-0.5">
                            Làm mất / thất lạc:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.handedQty}
                            value={currentInspect.returnedLostQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...returnInspectItems];
                              updated[idx].returnedLostQty = val;
                              setReturnInspectItems(updated);
                            }}
                            className="w-full px-2 py-1 text-center font-mono rounded border border-slate-300 font-semibold text-rose-700"
                          />
                        </div>
                      </div>

                      {currentInspect.returnedDamagedQty > 0 && (
                        <div>
                          <input
                            type="text"
                            placeholder="Mô tả cụ thể hư hỏng (sẽ tự động tạo hồ sơ báo hỏng)..."
                            value={currentInspect.notes}
                            onChange={(e) => {
                              const updated = [...returnInspectItems];
                              updated[idx].notes = e.target.value;
                              setReturnInspectItems(updated);
                            }}
                            className="w-full px-2.5 py-1 text-xs rounded border border-amber-300 bg-amber-50/50"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1">
                  Nhận xét nghiệm thu trả thiết bị
                </label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Xác nhận đã trả & Cập nhật kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
