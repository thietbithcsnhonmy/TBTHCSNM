import React from 'react';
import { BorrowTicket, InventoryAudit, SchoolInfo } from '../../types';
import { StorageService } from '../../services/storageService';
import { Printer, X } from 'lucide-react';

interface PrintableSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: BorrowTicket | null;
  audit?: InventoryAudit | null;
}

export const PrintableSlipModal: React.FC<PrintableSlipModalProps> = ({
  isOpen,
  onClose,
  ticket,
  audit
}) => {
  const schoolInfo = StorageService.getSchoolInfo();

  if (!isOpen || (!ticket && !audit)) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white no-print">
          <div className="text-sm font-bold">
            {ticket ? `Mẫu In: Phiếu Mượn Thiết Bị [${ticket.ticketCode}]` : `Mẫu In: Biên Bản Kiểm Kê`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In văn bản</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 max-h-[82vh] overflow-y-auto bg-white text-black font-serif text-sm">
          {ticket && (
            <div className="space-y-6">
              {/* Header Standard School Format */}
              <div className="grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="font-semibold uppercase">PHÒNG GD&ĐT CHỢ MỚI</p>
                  <p className="font-bold uppercase text-sm underline">{schoolInfo.name}</p>
                  <p className="text-[11px] mt-1 font-mono">Số: {ticket.ticketCode}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold italic text-[11px] underline">Độc lập – Tự do – Hạnh phúc</p>
                  <p className="text-[11px] mt-1 italic">
                    Nhơn Mỹ, ngày {new Date(ticket.useDate).getDate()} tháng {new Date(ticket.useDate).getMonth() + 1} năm {new Date(ticket.useDate).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-2">
                <h1 className="text-lg font-bold uppercase tracking-wide">
                  PHIẾU ĐĂNG KÝ VÀ BÀN GIAO THIẾT BỊ DẠY HỌC
                </h1>
                <p className="text-xs italic mt-0.5">
                  (Căn cứ kế hoạch giảng dạy chương trình GDPT 2018 - Năm học {StorageService.getActiveYear()})
                </p>
              </div>

              {/* Teacher & Lesson Details */}
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    Họ và tên giáo viên: <strong>{ticket.teacherName}</strong>
                  </div>
                  <div>
                    Tổ chuyên môn: <strong>{ticket.department}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    Lớp dạy: <strong>Lớp {ticket.targetClass}</strong>
                  </div>
                  <div>
                    Thời gian: <strong>{ticket.usePeriod}</strong> (Ngày: {ticket.useDate})
                  </div>
                </div>
                <div>
                  Tên bài dạy / Hoạt động thực hành: <strong>{ticket.lessonTitle}</strong>
                </div>
                <div>
                  Địa điểm thực hiện: <strong>{ticket.roomUsed || 'Phòng học lớp'}</strong>
                </div>
                {ticket.requestNotes && (
                  <div>
                    Yêu cầu kỹ thuật chuẩn bị: <em>{ticket.requestNotes}</em>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black text-center font-bold bg-slate-100">
                      <th className="border-r border-black py-1.5 px-2 w-10">STT</th>
                      <th className="border-r border-black py-1.5 px-2 w-28">Mã TB</th>
                      <th className="border-r border-black py-1.5 px-2">Tên thiết bị dạy học</th>
                      <th className="border-r border-black py-1.5 px-2 w-16">ĐVT</th>
                      <th className="border-r border-black py-1.5 px-2 w-16">SL Yêu cầu</th>
                      <th className="border-r border-black py-1.5 px-2 w-16">SL Bàn giao</th>
                      <th className="py-1.5 px-2 w-28">Tình trạng khi trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-black last:border-b-0">
                        <td className="border-r border-black py-2 px-2 text-center font-mono">{idx + 1}</td>
                        <td className="border-r border-black py-2 px-2 font-mono font-bold">{it.equipmentCode}</td>
                        <td className="border-r border-black py-2 px-2">{it.equipmentName}</td>
                        <td className="border-r border-black py-2 px-2 text-center">{it.unit}</td>
                        <td className="border-r border-black py-2 px-2 text-center font-bold">{it.requestedQty}</td>
                        <td className="border-r border-black py-2 px-2 text-center font-bold">{it.handedQty || it.requestedQty}</td>
                        <td className="py-2 px-2 text-center text-[11px]">
                          {it.returnedNormalQty > 0 ? `Đủ ${it.returnedNormalQty} tốt` : 'Bình thường'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms of Responsibility */}
              <div className="text-[11px] italic text-slate-700 space-y-0.5">
                <p>1. Giáo viên có trách nhiệm bảo quản, hướng dẫn học sinh thao tác đúng quy trình kỹ thuật an toàn.</p>
                <p>2. Hoàn trả thiết bị về phòng kho ngay sau khi kết thúc buổi thực hành; báo ngay nếu có sự cố kỹ thuật phát sinh.</p>
              </div>

              {/* Signatures */}
              <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="font-bold">GIÁO VIÊN MƯỢN</p>
                  <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">{ticket.teacherName}</p>
                </div>
                <div>
                  <p className="font-bold">CÁN BỘ THIẾT BỊ GIAO</p>
                  <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">{ticket.handedOverBy || ticket.assignedStaffName || 'Nhân viên thiết bị'}</p>
                </div>
                <div>
                  <p className="font-bold">BAN GIÁM HIỆU DUYỆT</p>
                  <p className="text-[10px] italic mt-0.5">(Ký duyệt)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">{schoolInfo.principalName}</p>
                </div>
              </div>
            </div>
          )}

          {audit && (
            <div className="space-y-6">
              {/* Header Standard School Format */}
              <div className="grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="font-semibold uppercase">PHÒNG GD&ĐT CHỢ MỚI</p>
                  <p className="font-bold uppercase text-sm underline">{schoolInfo.name}</p>
                  <p className="text-[11px] mt-1 font-mono">Số: {audit.id}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold italic text-[11px] underline">Độc lập – Tự do – Hạnh phúc</p>
                  <p className="text-[11px] mt-1 italic">
                    Nhơn Mỹ, ngày {new Date(audit.auditDate).getDate()} tháng {new Date(audit.auditDate).getMonth() + 1} năm {new Date(audit.auditDate).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-2">
                <h1 className="text-lg font-bold uppercase tracking-wide">
                  BIÊN BẢN KIỂM KÊ TRANG THIẾT BỊ DẠY HỌC
                </h1>
                <p className="text-xs italic mt-0.5 font-bold">
                  {audit.title}
                </p>
              </div>

              {/* Commission Members */}
              <div className="text-xs space-y-1">
                <p>Hôm nay, ngày {audit.auditDate}, Hội đồng kiểm kê tài sản Trường THCS Nhơn Mỹ gồm có:</p>
                <p>1. Ông/Bà: <strong>{audit.leadAuditor}</strong> - Trưởng ban</p>
                <p>2. Các thành viên: <strong>{audit.auditors.join(', ')}</strong></p>
                <p>Đã tiến hành kiểm kê thực tế toàn bộ thiết bị dạy học trong phạm vi: <strong>{audit.scopeType === 'all' ? 'Toàn trường' : audit.scopeValue || 'Bộ môn'}</strong>.</p>
              </div>

              {/* Table */}
              <div className="border border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black text-center font-bold bg-slate-100">
                      <th className="border-r border-black py-1.5 px-2 w-8">STT</th>
                      <th className="border-r border-black py-1.5 px-2 w-24">Mã TB</th>
                      <th className="border-r border-black py-1.5 px-2">Tên thiết bị</th>
                      <th className="border-r border-black py-1.5 px-2 w-14">ĐVT</th>
                      <th className="border-r border-black py-1.5 px-2 w-14">SL Sổ</th>
                      <th className="border-r border-black py-1.5 px-2 w-14">Thực tế</th>
                      <th className="border-r border-black py-1.5 px-2 w-14">Lệch</th>
                      <th className="border-r border-black py-1.5 px-2 w-14">Tốt</th>
                      <th className="py-1.5 px-2 w-28">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-black last:border-b-0">
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                        <td className="border-r border-black py-1.5 px-2 font-mono font-bold">{it.equipmentCode}</td>
                        <td className="border-r border-black py-1.5 px-2">{it.equipmentName}</td>
                        <td className="border-r border-black py-1.5 px-2 text-center">{it.unit}</td>
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono">{it.bookQty}</td>
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono font-bold">{it.actualQty}</td>
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono font-bold">
                          {it.diff === 0 ? '0' : it.diff > 0 ? `+${it.diff}` : it.diff}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono">{it.goodQty}</td>
                        <td className="py-1.5 px-2 text-center">{it.statusText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conclusion */}
              <div className="text-xs space-y-1">
                <p><strong>Kết luận của Hội đồng kiểm kê:</strong></p>
                <p className="italic">
                  {audit.adminConclusion ||
                    `Tổng số lượng thiết bị thực tế kiểm đếm: ${audit.totalActualQty}. Trong đó hoạt động tốt: ${audit.totalGoodQty}, hư hỏng cần bảo dưỡng/sửa chữa: ${audit.totalDamagedQty}.`}
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="font-bold">ĐẠI DIỆN TỔ CHUYÊN MÔN</p>
                  <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">Vũ Quốc Hưng</p>
                </div>
                <div>
                  <p className="font-bold">CÁN BỘ THIẾT BỊ</p>
                  <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">{audit.auditors[0] || 'Nguyễn Văn An'}</p>
                </div>
                <div>
                  <p className="font-bold">TRƯỞNG BAN KIỂM KÊ</p>
                  <p className="text-[10px] italic mt-0.5">(Hiệu trưởng ký duyệt)</p>
                  <div className="h-16"></div>
                  <p className="font-bold">{audit.leadAuditor}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
