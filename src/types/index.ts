export type UserRole = 'admin' | 'bgh' | 'staff' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string; // e.g., 'Tổ KHTN', 'Tổ KHXH', 'Tổ Toán - Tin', 'Tổ Văn - Sử - Địa', 'Tổ Thiết bị - Văn phòng'
  subject?: string; // Môn giảng dạy
  assignedSubjects?: string[]; // Cho nhân viên thiết bị
  assignedRooms?: string[]; // Cho nhân viên thiết bị
  isActive: boolean;
  avatar?: string;
  staffIndex?: 1 | 2 | 3; // 03 Nhân viên thiết bị
}

export type SubjectCategory =
  | 'Vật lí'
  | 'Hóa học'
  | 'Sinh học'
  | 'Khoa học tự nhiên'
  | 'Công nghệ'
  | 'Tin học'
  | 'Toán học'
  | 'Ngữ văn'
  | 'Lịch sử và Địa lí'
  | 'Giáo dục thể chất'
  | 'Nghệ thuật'
  | 'Thiết bị dùng chung'
  | 'Các môn học khác';

export type EquipmentStatus = 'good' | 'needs_repair' | 'damaged' | 'lost' | 'archived';

export interface Equipment {
  id: string;
  code: string; // Mã thiết bị duy nhất (e.g. TB-VL-001)
  name: string;
  imageUrl?: string;
  subject: SubjectCategory;
  grade: 'Khối 6' | 'Khối 7' | 'Khối 8' | 'Khối 9' | 'Dùng chung';
  topic?: string; // Chủ đề / bài học
  unit: string; // Bộ, Cái, Chiếc, Ống, Hộp, Bộ thí nghiệm...
  isBatch: boolean; // Quản lý đơn chiếc hay theo lô
  bookQuantity: number; // Số lượng theo sổ
  actualQuantity: number; // Số lượng thực tế trong kho
  borrowingQuantity: number; // Đang cho mượn
  damagedQuantity: number; // Hư hỏng
  availableQuantity: number; // Khả dụng (actual - borrowing - damaged)
  yearInUse: number; // Năm đưa vào sử dụng
  source: 'Cấp phát Bộ/Sở GD&ĐT' | 'Nhà trường tự mua sắm' | 'Tài trợ / Xã hội hóa' | 'Tự làm';
  price: number; // Giá trị định giá (VNĐ)
  storageRoom: string; // Tên phòng lưu trữ
  location: string; // Vị trí cụ thể (Tủ A, Ngăn 2...)
  assignedStaffId: string; // ID nhân viên phụ trách
  status: EquipmentStatus;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export type BorrowStatus =
  | 'pending' // Chờ duyệt
  | 'approved' // Đã duyệt
  | 'handed_over' // Đã giao thiết bị (đang mượn)
  | 'returned' // Đã trả đủ
  | 'partial_returned' // Trả một phần
  | 'damaged_returned' // Trả hỏng / mất
  | 'overdue' // Quá hạn
  | 'rejected' // Bị từ chối
  | 'cancelled'; // Đã hủy

export interface BorrowItem {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  unit: string;
  requestedQty: number;
  handedQty: number;
  returnedNormalQty: number;
  returnedDamagedQty: number;
  returnedLostQty: number;
  itemNotes?: string;
}

export interface BorrowTicket {
  id: string; // e.g. PM-2026-0001
  ticketCode: string;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  department?: string;
  targetClass: string; // e.g., 8A1, 9A2
  lessonTitle: string; // Tên bài học
  useDate: string; // Ngày sử dụng (YYYY-MM-DD)
  usePeriod: string; // Tiết 1, 2 buổi sáng...
  roomUsed?: string; // Phòng sử dụng (phòng học lớp hoặc phòng thực hành)
  expectedReturnDate: string;
  actualReturnDate?: string;
  items: BorrowItem[];
  status: BorrowStatus;
  requestNotes?: string;
  staffApprovalNotes?: string;
  returnInspectionNotes?: string;
  assignedStaffId?: string; // Nhân viên chịu trách nhiệm duyệt
  assignedStaffName?: string;
  handedOverBy?: string;
  handedOverAt?: string;
  receivedBackBy?: string;
  receivedBackAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCheck {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  unit: string;
  bookQty: number;
  actualQty: number;
  diff: number; // actual - book (0: đủ, >0: thừa, <0: thiếu)
  goodQty: number;
  damagedQty: number;
  lostQty: number;
  cause?: string;
  statusText: 'Đủ' | 'Thừa' | 'Thiếu' | 'Hư hỏng' | 'Chưa tìm thấy';
  auditor: string;
  notes?: string;
}

export interface InventoryAudit {
  id: string;
  title: string;
  scopeType: 'all' | 'subject' | 'room' | 'staff' | 'semester';
  scopeValue?: string;
  academicYear: string;
  auditDate: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved_by_admin';
  leadAuditor: string;
  auditors: string[];
  items: InventoryItemCheck[];
  totalBookQty: number;
  totalActualQty: number;
  totalGoodQty: number;
  totalDamagedQty: number;
  totalShortageQty: number;
  totalExcessQty: number;
  adminConclusion?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface DamageReport {
  id: string; // e.g. BH-2026-001
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  quantity: number;
  reportedBy: string; // Tên giáo viên
  reportedById: string;
  reportedDate: string;
  errorDescription: string;
  imageUrl?: string;
  status: 'reported' | 'processing' | 'repaired' | 'unrepairable';
  assignedStaffId?: string;
  assignedStaffName?: string;
  solution?: 'Tự khắc phục tại trường' | 'Gửi hãng bảo hành' | 'Thuê đơn vị sửa chữa ngoài' | 'Đề nghị thanh lý';
  repairCost?: number;
  completedDate?: string;
  resultNotes?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  type: 'classroom' | 'lab_physics' | 'lab_chem_bio' | 'general_equipment' | 'computer_lab';
  building: string;
  floor: number;
  capacity?: number;
  managerStaffId?: string;
  managerStaffName?: string;
  notes?: string;
}

export interface SchoolInfo {
  name: string;
  shortName: string;
  level: string;
  program: string;
  address: string;
  phone: string;
  email: string;
  currentYear: string;
  principalName: string;
  vicePrincipalName: string;
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClassrooms: number;
  totalFunctionRooms: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'equipment' | 'borrow' | 'inventory' | 'repair' | 'user' | 'system' | 'room';
  entityId?: string;
  details: string;
}
