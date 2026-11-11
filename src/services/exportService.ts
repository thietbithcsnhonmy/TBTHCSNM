import * as XLSX from 'xlsx';
import { Equipment, BorrowTicket, InventoryAudit, DamageReport, SchoolInfo } from '../types';

export const ExportService = {
  // Export Equipment Catalog to Excel
  exportEquipmentToExcel(equipment: Equipment[], schoolInfo: SchoolInfo, fileName = 'Danh_Muc_Thiet_Bi_THCS_Nhon_My.xlsx') {
    const data = equipment.map((item, index) => ({
      'STT': index + 1,
      'Mã thiết bị': item.code,
      'Tên thiết bị': item.name,
      'Môn học': item.subject,
      'Khối lớp': item.grade,
      'Chủ đề / Bài dạy': item.topic || '',
      'Đơn vị tính': item.unit,
      'Loại': item.isBatch ? 'Theo lô' : 'Đơn chiếc',
      'Số lượng sổ sách': item.bookQuantity,
      'Số lượng thực tế': item.actualQuantity,
      'Đang mượn': item.borrowingQuantity,
      'Hư hỏng': item.damagedQuantity,
      'Khả dụng': item.availableQuantity,
      'Năm sử dụng': item.yearInUse,
      'Nguồn gốc': item.source,
      'Đơn giá (VNĐ)': item.price,
      'Thành tiền (VNĐ)': item.price * item.actualQuantity,
      'Phòng lưu trữ': item.storageRoom,
      'Vị trí cụ thể': item.location,
      'Tình trạng': item.status === 'good' ? 'Tốt' : item.status === 'needs_repair' ? 'Cần sửa chữa' : item.status === 'damaged' ? 'Hỏng' : item.status === 'lost' ? 'Mất' : 'Ngừng theo dõi',
      'Ghi chú': item.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths
    const colWidths = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã
      { wch: 40 }, // Tên
      { wch: 18 }, // Môn
      { wch: 12 }, // Khối
      { wch: 25 }, // Chủ đề
      { wch: 10 }, // ĐVT
      { wch: 12 }, // Loại
      { wch: 10 }, // SL Sổ
      { wch: 10 }, // SL Thực tế
      { wch: 10 }, // Đang mượn
      { wch: 10 }, // Hư hỏng
      { wch: 10 }, // Khả dụng
      { wch: 12 }, // Năm
      { wch: 22 }, // Nguồn
      { wch: 15 }, // Đơn giá
      { wch: 18 }, // Thành tiền
      { wch: 25 }, // Phòng
      { wch: 20 }, // Vị trí
      { wch: 14 }, // Tình trạng
      { wch: 25 }  // Ghi chú
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục thiết bị');

    XLSX.writeFile(workbook, fileName);
  },

  // Export Borrow Ledger to Excel
  exportBorrowLedgerToExcel(tickets: BorrowTicket[], fileName = 'So_Muon_Tra_Thiet_Bi_THCS_Nhon_My.xlsx') {
    const flatData: Record<string, string | number>[] = [];
    let stt = 1;

    tickets.forEach(ticket => {
      ticket.items.forEach(item => {
        flatData.push({
          'STT': stt++,
          'Số phiếu': ticket.ticketCode,
          'Ngày mượn': ticket.useDate,
          'Tiết dạy': ticket.usePeriod,
          'Lớp học': ticket.targetClass,
          'Bài giảng': ticket.lessonTitle,
          'Giáo viên mượn': ticket.teacherName,
          'Tổ bộ môn': ticket.department || '',
          'Mã thiết bị': item.equipmentCode,
          'Tên thiết bị': item.equipmentName,
          'ĐVT': item.unit,
          'SL yêu cầu': item.requestedQty,
          'SL đã giao': item.handedQty,
          'SL trả tốt': item.returnedNormalQty,
          'SL trả hỏng': item.returnedDamagedQty,
          'SL làm mất': item.returnedLostQty,
          'Người bàn giao': ticket.handedOverBy || '',
          'Người nhận lại': ticket.receivedBackBy || '',
          'Trạng thái': ticket.status === 'returned' ? 'Đã trả' : ticket.status === 'handed_over' ? 'Đang mượn' : ticket.status === 'pending' ? 'Chờ duyệt' : ticket.status === 'approved' ? 'Đã duyệt' : ticket.status === 'damaged_returned' ? 'Trả hỏng/mất' : 'Khác',
          'Ghi chú': item.itemNotes || ticket.requestNotes || ''
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sổ mượn trả');
    XLSX.writeFile(workbook, fileName);
  },

  // Export Inventory Minutes to Excel
  exportInventoryAuditToExcel(audit: InventoryAudit, fileName = 'Bien_Ban_Kiem_Ke_Thiet_Bi.xlsx') {
    const data = audit.items.map((item, idx) => ({
      'STT': idx + 1,
      'Mã thiết bị': item.equipmentCode,
      'Tên thiết bị': item.equipmentName,
      'ĐVT': item.unit,
      'SL sổ sách': item.bookQty,
      'SL thực tế': item.actualQty,
      'Chênh lệch': item.diff,
      'Hoạt động tốt': item.goodQty,
      'Hư hỏng': item.damagedQty,
      'Mất / Thất lạc': item.lostQty,
      'Đánh giá': item.statusText,
      'Người kiểm tra': item.auditor,
      'Ghi chú / Nguyên nhân': item.notes || item.cause || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Biên bản kiểm kê');
    XLSX.writeFile(workbook, fileName);
  },

  // Export Damage & Repair List to Excel
  exportDamageReportsToExcel(reports: DamageReport[], fileName = 'Bao_Cao_Hu_Hong_Sua_Chua.xlsx') {
    const data = reports.map((r, idx) => ({
      'STT': idx + 1,
      'Mã thiết bị': r.equipmentCode,
      'Tên thiết bị': r.equipmentName,
      'Số lượng hỏng': r.quantity,
      'Người phát hiện': r.reportedBy,
      'Ngày phát hiện': r.reportedDate,
      'Mô tả tình trạng lỗi': r.errorDescription,
      'Tình trạng xử lý': r.status === 'repaired' ? 'Đã sửa xong' : r.status === 'processing' ? 'Đang tiếp nhận xử lý' : r.status === 'unrepairable' ? 'Chuyển thanh lý' : 'Mới báo hỏng',
      'Cán bộ phụ trách': r.assignedStaffName || '',
      'Phương án khắc phục': r.solution || '',
      'Chi phí sửa chữa (VNĐ)': r.repairCost || 0,
      'Ngày hoàn thành': r.completedDate || '',
      'Kết quả nghiệm thu': r.resultNotes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sửa chữa thiết bị');
    XLSX.writeFile(workbook, fileName);
  }
};
