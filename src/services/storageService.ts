import {
  Equipment,
  BorrowTicket,
  InventoryAudit,
  DamageReport,
  Room,
  SchoolInfo,
  User,
  AuditLog
} from '../types';

const STORAGE_KEYS = {
  SCHOOL_INFO: 'nhonmy_school_info_v1',
  USERS: 'nhonmy_users_v1',
  EQUIPMENT: 'nhonmy_equipment_v1',
  BORROW_TICKETS: 'nhonmy_borrow_tickets_v1',
  INVENTORY_AUDITS: 'nhonmy_inventory_audits_v1',
  DAMAGE_REPORTS: 'nhonmy_damage_reports_v1',
  ROOMS: 'nhonmy_rooms_v1',
  AUDIT_LOGS: 'nhonmy_audit_logs_v1',
  CURRENT_USER: 'nhonmy_current_user_v1',
  ACADEMIC_YEARS: 'nhonmy_academic_years_v1',
  ACTIVE_YEAR: 'nhonmy_active_year_v1'
};

// Initial School Info
export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  name: 'TRƯỜNG THCS NHƠN MỸ',
  shortName: 'THCS NHƠN MỸ',
  level: 'Trung học cơ sở',
  program: 'Chương trình Giáo dục phổ thông 2018 (GDPT 2018)',
  address: 'Xã Nhơn Mỹ, Huyện Chợ Mới, Tỉnh An Giang (và phân hiệu Cần Thơ)',
  phone: '0296.3888.123',
  email: 'c2nhonmy@angiang.edu.vn',
  currentYear: '2026–2027',
  principalName: 'Nguyễn Văn Minh',
  vicePrincipalName: 'Trần Thị Hồng',
  totalClasses: 42,
  totalStudents: 1401,
  totalTeachers: 39,
  totalStaff: 7,
  totalClassrooms: 19,
  totalFunctionRooms: 6
};

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Quản trị viên Hệ thống',
    email: 'admin@nhonmy.edu.vn',
    role: 'admin',
    phone: '0903.111.222',
    department: 'Ban Quản trị CNTT',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_bgh1',
    name: 'Thầy Nguyễn Văn Minh (Hiệu trưởng)',
    email: 'hieutruong@nhonmy.edu.vn',
    role: 'bgh',
    phone: '0913.456.789',
    department: 'Ban Giám hiệu',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_bgh2',
    name: 'Cô Trần Thị Hồng (Phó Hiệu trưởng)',
    email: 'phohieutruong@nhonmy.edu.vn',
    role: 'bgh',
    phone: '0918.987.654',
    department: 'Ban Giám hiệu',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_nv1',
    name: 'Nguyễn Văn An',
    email: 'nv1@nhonmy.edu.vn',
    role: 'staff',
    phone: '0978.112.233',
    department: 'Tổ Thiết bị - Thư viện',
    staffIndex: 1,
    assignedSubjects: ['Vật lí', 'Công nghệ', 'Khoa học tự nhiên'],
    assignedRooms: ['Phòng thực hành Lý - Công nghệ 1', 'Phòng thực hành Lý - Công nghệ 2'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_nv2',
    name: 'Trần Thị Bích',
    email: 'nv2@nhonmy.edu.vn',
    role: 'staff',
    phone: '0988.334.455',
    department: 'Tổ Thiết bị - Thư viện',
    staffIndex: 2,
    assignedSubjects: ['Hóa học', 'Sinh học', 'Khoa học tự nhiên'],
    assignedRooms: ['Phòng thực hành Hóa - Sinh 1', 'Phòng thực hành Hóa - Sinh 2'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_nv3',
    name: 'Lê Hoàng Cường',
    email: 'nv3@nhonmy.edu.vn',
    role: 'staff',
    phone: '0912.556.677',
    department: 'Tổ Thiết bị - Thư viện',
    staffIndex: 3,
    assignedSubjects: ['Tin học', 'Thiết bị dùng chung', 'Toán học', 'Ngữ văn', 'Lịch sử và Địa lí'],
    assignedRooms: ['Phòng thiết bị dùng chung 1 (Nhà B)', 'Phòng thiết bị dùng chung 2 (Nhà B)', 'Phòng Tin học 1', 'Phòng Tin học 2'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv1',
    name: 'Cô Lê Thị Hoa',
    email: 'gv.hoa@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0934.123.456',
    department: 'Tổ Khoa học Tự nhiên',
    subject: 'Vật lí',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv2',
    name: 'Thầy Đặng Minh Tuấn',
    email: 'gv.tuan@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0935.234.567',
    department: 'Tổ Khoa học Tự nhiên',
    subject: 'Hóa học',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv3',
    name: 'Cô Phạm Thị Lan',
    email: 'gv.lan@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0936.345.678',
    department: 'Tổ Khoa học Tự nhiên',
    subject: 'Sinh học',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv4',
    name: 'Thầy Vũ Quốc Hưng',
    email: 'gv.hung@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0937.456.789',
    department: 'Tổ Toán - Tin',
    subject: 'Toán học',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv5',
    name: 'Thầy Hoàng Đức Nam',
    email: 'gv.nam@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0938.567.890',
    department: 'Tổ Toán - Tin',
    subject: 'Tin học',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_gv6',
    name: 'Cô Nguyễn Thị Mai',
    email: 'gv.mai@nhonmy.edu.vn',
    role: 'teacher',
    phone: '0939.678.901',
    department: 'Tổ Ngữ văn',
    subject: 'Ngữ văn',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  }
];

// Initial Rooms
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_th_ly_1',
    code: 'PTH-LY-01',
    name: 'Phòng thực hành Lý - Công nghệ 1',
    type: 'lab_physics',
    building: 'Nhà C (Khu thực hành)',
    floor: 2,
    capacity: 45,
    managerStaffId: 'user_nv1',
    managerStaffName: 'Nguyễn Văn An',
    notes: 'Trang bị 8 bàn thí nghiệm có nguồn điện xoay chiều/một chiều 0-24V'
  },
  {
    id: 'room_th_ly_2',
    code: 'PTH-LY-02',
    name: 'Phòng thực hành Lý - Công nghệ 2',
    type: 'lab_physics',
    building: 'Nhà C (Khu thực hành)',
    floor: 2,
    capacity: 45,
    managerStaffId: 'user_nv1',
    managerStaffName: 'Nguyễn Văn An',
    notes: 'Phục vụ thực hành Công nghệ cơ khí, điện tử và KHTN khối 8-9'
  },
  {
    id: 'room_th_hoa_1',
    code: 'PTH-HOA-01',
    name: 'Phòng thực hành Hóa - Sinh 1',
    type: 'lab_chem_bio',
    building: 'Nhà C (Khu thực hành)',
    floor: 3,
    capacity: 45,
    managerStaffId: 'user_nv2',
    managerStaffName: 'Trần Thị Bích',
    notes: 'Hệ thống bồn rửa kháng acid, tủ hút khí độc chuyên dụng'
  },
  {
    id: 'room_th_hoa_2',
    code: 'PTH-HOA-02',
    name: 'Phòng thực hành Hóa - Sinh 2',
    type: 'lab_chem_bio',
    building: 'Nhà C (Khu thực hành)',
    floor: 3,
    capacity: 45,
    managerStaffId: 'user_nv2',
    managerStaffName: 'Trần Thị Bích',
    notes: 'Kính hiển vi quang học, tiêu bản tế bào và mẫu vật giải phẫu sinh học'
  },
  {
    id: 'room_tb_chung_1',
    code: 'PTB-CHUNG-01',
    name: 'Phòng thiết bị dùng chung 1 (Nhà B)',
    type: 'general_equipment',
    building: 'Nhà B',
    floor: 1,
    capacity: 30,
    managerStaffId: 'user_nv3',
    managerStaffName: 'Lê Hoàng Cường',
    notes: 'Lưu trữ máy chiếu, micro trợ giảng, loa kéo, màn hình tương tác di động'
  },
  {
    id: 'room_tb_chung_2',
    code: 'PTB-CHUNG-02',
    name: 'Phòng thiết bị dùng chung 2 (Nhà B)',
    type: 'general_equipment',
    building: 'Nhà B',
    floor: 1,
    capacity: 30,
    managerStaffId: 'user_nv3',
    managerStaffName: 'Lê Hoàng Cường',
    notes: 'Lưu trữ bản đồ, tranh ảnh phóng to Lịch sử - Địa lí, mô hình Toán học'
  },
  {
    id: 'room_tin_1',
    code: 'PTH-TIN-01',
    name: 'Phòng Tin học 1',
    type: 'computer_lab',
    building: 'Nhà A',
    floor: 2,
    capacity: 40,
    managerStaffId: 'user_nv3',
    managerStaffName: 'Lê Hoàng Cường',
    notes: '40 máy tính để bàn nối mạng LAN Gigabit'
  },
  {
    id: 'room_tin_2',
    code: 'PTH-TIN-02',
    name: 'Phòng Tin học 2',
    type: 'computer_lab',
    building: 'Nhà A',
    floor: 2,
    capacity: 40,
    managerStaffId: 'user_nv3',
    managerStaffName: 'Lê Hoàng Cường',
    notes: '40 máy tính để bàn phục vụ lập trình Scratch, Python theo GDPT 2018'
  }
];

// Initial realistic Equipment (aligned with GDPT 2018 standards)
export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq_vl_001',
    code: 'TB-VL-001',
    name: 'Bộ thí nghiệm điện học KHTN 8 (Nguồn điện, biến trở, ampe kế, vôn kế, bảng điện)',
    imageUrl: '',
    subject: 'Vật lí',
    grade: 'Khối 8',
    topic: 'Chương IV: Điện học và từ học',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 12,
    actualQuantity: 12,
    borrowingQuantity: 3,
    damagedQuantity: 1,
    availableQuantity: 8,
    yearInUse: 2023,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 3200000,
    storageRoom: 'Phòng thực hành Lý - Công nghệ 1',
    location: 'Tủ 01 - Ngăn 1 & 2',
    assignedStaffId: 'user_nv1',
    status: 'good',
    notes: 'Hộp nhôm bảo quản, đầy đủ dây nối và đồng hồ hiển thị số',
    updatedAt: '2026-09-10T08:00:00Z',
    updatedBy: 'Nguyễn Văn An'
  },
  {
    id: 'eq_vl_002',
    code: 'TB-VL-002',
    name: 'Bộ thí nghiệm đo gia tốc và tốc độ chuyển động bằng cổng quang điện KHTN 7',
    imageUrl: '',
    subject: 'Vật lí',
    grade: 'Khối 7',
    topic: 'Chủ đề: Tốc độ chuyển động',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 8,
    actualQuantity: 8,
    borrowingQuantity: 0,
    damagedQuantity: 0,
    availableQuantity: 8,
    yearInUse: 2024,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 4500000,
    storageRoom: 'Phòng thực hành Lý - Công nghệ 1',
    location: 'Tủ 02 - Ngăn 3',
    assignedStaffId: 'user_nv1',
    status: 'good',
    notes: 'Đồng hồ hiện số đa năng kèm ray đệm khí',
    updatedAt: '2026-09-12T09:30:00Z',
    updatedBy: 'Nguyễn Văn An'
  },
  {
    id: 'eq_vl_003',
    code: 'TB-VL-003',
    name: 'Bộ thí nghiệm Quang học hình học (Nguồn sáng 3 tia, lăng kính, thấu kính hội tụ, phân kỳ)',
    imageUrl: '',
    subject: 'Vật lí',
    grade: 'Khối 9',
    topic: 'Hiện tượng khúc xạ ánh sáng và mắt',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 10,
    actualQuantity: 10,
    borrowingQuantity: 2,
    damagedQuantity: 0,
    availableQuantity: 8,
    yearInUse: 2022,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 2800000,
    storageRoom: 'Phòng thực hành Lý - Công nghệ 1',
    location: 'Tủ 03 - Ngăn 2',
    assignedStaffId: 'user_nv1',
    status: 'good',
    notes: 'Đèn laser bán dẫn 3 tia hoạt động ổn định',
    updatedAt: '2026-09-15T10:00:00Z',
    updatedBy: 'Nguyễn Văn An'
  },
  {
    id: 'eq_cn_001',
    code: 'TB-CN-001',
    name: 'Bộ lắp ghép mô hình mạch điện thông minh cảm biến ánh sáng và nhiệt độ Công nghệ 8',
    imageUrl: '',
    subject: 'Công nghệ',
    grade: 'Khối 8',
    topic: 'Kỹ thuật điện và cảm biến điều khiển',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 15,
    actualQuantity: 15,
    borrowingQuantity: 0,
    damagedQuantity: 1,
    availableQuantity: 14,
    yearInUse: 2024,
    source: 'Nhà trường tự mua sắm',
    price: 1850000,
    storageRoom: 'Phòng thực hành Lý - Công nghệ 2',
    location: 'Tủ CN-01 - Kệ 2',
    assignedStaffId: 'user_nv1',
    status: 'good',
    notes: '1 bộ bị hỏng biến trở nhiệt (đang báo sửa)',
    updatedAt: '2026-10-02T14:15:00Z',
    updatedBy: 'Nguyễn Văn An'
  },
  {
    id: 'eq_hh_001',
    code: 'TB-HH-001',
    name: 'Bộ dụng cụ thí nghiệm điều chế và thu khí Oxygen, Hydrogen KHTN 8',
    imageUrl: '',
    subject: 'Hóa học',
    grade: 'Khối 8',
    topic: 'Chương II: Phản ứng hóa học và chất khí',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 16,
    actualQuantity: 16,
    borrowingQuantity: 4,
    damagedQuantity: 0,
    availableQuantity: 12,
    yearInUse: 2023,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 1650000,
    storageRoom: 'Phòng thực hành Hóa - Sinh 1',
    location: 'Tủ Kính H-01 - Ngăn 1',
    assignedStaffId: 'user_nv2',
    status: 'good',
    notes: 'Bao gồm ống nghiệm chịu nhiệt borosilicate, nút cao su, ống dẫn khí chữ L',
    updatedAt: '2026-10-05T08:20:00Z',
    updatedBy: 'Trần Thị Bích'
  },
  {
    id: 'eq_hh_002',
    code: 'TB-HH-002',
    name: 'Cân điện tử phân tích độ chính xác 0.01g chuẩn phòng thí nghiệm',
    imageUrl: '',
    subject: 'Hóa học',
    grade: 'Dùng chung',
    topic: 'Đo lường khối lượng hóa chất thực hành',
    unit: 'Chiếc',
    isBatch: false,
    bookQuantity: 4,
    actualQuantity: 4,
    borrowingQuantity: 1,
    damagedQuantity: 0,
    availableQuantity: 3,
    yearInUse: 2024,
    source: 'Nhà trường tự mua sắm',
    price: 3600000,
    storageRoom: 'Phòng thực hành Hóa - Sinh 1',
    location: 'Bàn thí nghiệm trung tâm',
    assignedStaffId: 'user_nv2',
    status: 'good',
    notes: 'Kèm quả cân chuẩn 100g hiệu chuẩn',
    updatedAt: '2026-10-08T15:00:00Z',
    updatedBy: 'Trần Thị Bích'
  },
  {
    id: 'eq_sh_001',
    code: 'TB-SH-001',
    name: 'Kính hiển vi quang học 1 mắt độ phóng đại 1600x có đèn LED tích hợp',
    imageUrl: '',
    subject: 'Sinh học',
    grade: 'Khối 6',
    topic: 'Tế bào - Đơn vị cơ bản của sự sống',
    unit: 'Chiếc',
    isBatch: true,
    bookQuantity: 16,
    actualQuantity: 16,
    borrowingQuantity: 6,
    damagedQuantity: 0,
    availableQuantity: 10,
    yearInUse: 2023,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 2400000,
    storageRoom: 'Phòng thực hành Hóa - Sinh 2',
    location: 'Tủ kính S-01 (Kệ 1-3)',
    assignedStaffId: 'user_nv2',
    status: 'good',
    notes: 'Thị kính 16x, vật kính 4x, 10x, 40x, 100x dầu soi',
    updatedAt: '2026-10-10T11:00:00Z',
    updatedBy: 'Trần Thị Bích'
  },
  {
    id: 'eq_sh_002',
    code: 'TB-SH-002',
    name: 'Mô hình cấu tạo hệ tuần hoàn và quả tim người tháo lắp 4 phần kích thước thật',
    imageUrl: '',
    subject: 'Sinh học',
    grade: 'Khối 8',
    topic: 'Hệ tuần hoàn ở người',
    unit: 'Bộ',
    isBatch: false,
    bookQuantity: 6,
    actualQuantity: 6,
    borrowingQuantity: 0,
    damagedQuantity: 0,
    availableQuantity: 6,
    yearInUse: 2022,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 1950000,
    storageRoom: 'Phòng thực hành Hóa - Sinh 2',
    location: 'Tủ mô hình S-02',
    assignedStaffId: 'user_nv2',
    status: 'good',
    notes: 'Chất liệu nhựa PVC y tế cao cấp, có đế đỡ chắc chắn',
    updatedAt: '2026-10-12T16:00:00Z',
    updatedBy: 'Trần Thị Bích'
  },
  {
    id: 'eq_th_001',
    code: 'TB-TH-001',
    name: 'Máy chiếu đa năng độ nét cao EPSON EB-E01 kèm giá treo và dây HDMI 15m',
    imageUrl: '',
    subject: 'Thiết bị dùng chung',
    grade: 'Dùng chung',
    topic: 'Trình chiếu bài giảng điện tử tương tác',
    unit: 'Bộ',
    isBatch: false,
    bookQuantity: 8,
    actualQuantity: 8,
    borrowingQuantity: 3,
    damagedQuantity: 0,
    availableQuantity: 5,
    yearInUse: 2023,
    source: 'Nhà trường tự mua sắm',
    price: 9800000,
    storageRoom: 'Phòng thiết bị dùng chung 1 (Nhà B)',
    location: 'Tủ thiết bị A1',
    assignedStaffId: 'user_nv3',
    status: 'good',
    notes: 'Độ sáng 3300 Ansi Lumens, điều khiển từ xa zin',
    updatedAt: '2026-10-14T09:10:00Z',
    updatedBy: 'Lê Hoàng Cường'
  },
  {
    id: 'eq_th_002',
    code: 'TB-TH-002',
    name: 'Bộ loa kéo di động công suất 350W kèm 02 micro không dây UHF',
    imageUrl: '',
    subject: 'Thiết bị dùng chung',
    grade: 'Dùng chung',
    topic: 'Sinh hoạt dưới cờ, hoạt động trải nghiệm, GDTC',
    unit: 'Bộ',
    isBatch: false,
    bookQuantity: 4,
    actualQuantity: 4,
    borrowingQuantity: 1,
    damagedQuantity: 0,
    availableQuantity: 3,
    yearInUse: 2024,
    source: 'Tài trợ / Xã hội hóa',
    price: 4200000,
    storageRoom: 'Phòng thiết bị dùng chung 1 (Nhà B)',
    location: 'Góc phòng B-01',
    assignedStaffId: 'user_nv3',
    status: 'good',
    notes: 'Ắc quy trữ điện 6-8 tiếng liên tục',
    updatedAt: '2026-10-16T14:20:00Z',
    updatedBy: 'Lê Hoàng Cường'
  },
  {
    id: 'eq_tin_001',
    code: 'TB-TIN-001',
    name: 'Bộ Kit thực hành vi điều khiển lập trình STEM Robotics (Arduino/Micro:bit) Tin học 8',
    imageUrl: '',
    subject: 'Tin học',
    grade: 'Khối 8',
    topic: 'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 20,
    actualQuantity: 20,
    borrowingQuantity: 0,
    damagedQuantity: 0,
    availableQuantity: 20,
    yearInUse: 2025,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 1450000,
    storageRoom: 'Phòng Tin học 1',
    location: 'Tủ Kit STEM 01',
    assignedStaffId: 'user_nv3',
    status: 'good',
    notes: 'Kèm cáp USB kết nối và module mở rộng',
    updatedAt: '2026-10-18T10:00:00Z',
    updatedBy: 'Lê Hoàng Cường'
  },
  {
    id: 'eq_toan_001',
    code: 'TB-TOAN-001',
    name: 'Bộ dụng cụ vẽ hình học trên bảng lớn (Thước thẳng 1m, thước đo góc, compa phấn, eke)',
    imageUrl: '',
    subject: 'Toán học',
    grade: 'Dùng chung',
    topic: 'Hình học trực quan và hình học phẳng',
    unit: 'Bộ',
    isBatch: true,
    bookQuantity: 19,
    actualQuantity: 19,
    borrowingQuantity: 2,
    damagedQuantity: 1,
    availableQuantity: 16,
    yearInUse: 2022,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 450000,
    storageRoom: 'Phòng thiết bị dùng chung 2 (Nhà B)',
    location: 'Giá treo dụng cụ Toán',
    assignedStaffId: 'user_nv3',
    status: 'good',
    notes: 'Chất liệu gỗ bền bỉ bọc viền cao su',
    updatedAt: '2026-10-20T16:30:00Z',
    updatedBy: 'Lê Hoàng Cường'
  },
  {
    id: 'eq_su_001',
    code: 'TB-LS-001',
    name: 'Bản đồ tự nhiên và hành chính Việt Nam cỡ lớn (tỷ lệ 1:1.000.000) ép plastic chống lóa',
    imageUrl: '',
    subject: 'Lịch sử và Địa lí',
    grade: 'Khối 8',
    topic: 'Địa lí tự nhiên Việt Nam',
    unit: 'Tấm',
    isBatch: false,
    bookQuantity: 6,
    actualQuantity: 6,
    borrowingQuantity: 1,
    damagedQuantity: 0,
    availableQuantity: 5,
    yearInUse: 2023,
    source: 'Cấp phát Bộ/Sở GD&ĐT',
    price: 650000,
    storageRoom: 'Phòng thiết bị dùng chung 2 (Nhà B)',
    location: 'Ống lưu bản đồ B-02',
    assignedStaffId: 'user_nv3',
    status: 'good',
    notes: 'Có nẹp treo 2 đầu và dây kéo tiện lợi',
    updatedAt: '2026-10-22T08:00:00Z',
    updatedBy: 'Lê Hoàng Cường'
  }
];

// Initial realistic Borrow Tickets
export const INITIAL_BORROW_TICKETS: BorrowTicket[] = [
  {
    id: 'ticket_001',
    ticketCode: 'PM-2026-0042',
    teacherId: 'user_gv1',
    teacherName: 'Cô Lê Thị Hoa',
    teacherPhone: '0934.123.456',
    department: 'Tổ Khoa học Tự nhiên',
    targetClass: '8A2',
    lessonTitle: 'Bài 15: Tác dụng nhiệt và tác dụng phát sáng của dòng điện',
    useDate: '2026-11-09',
    usePeriod: 'Tiết 2, 3 - Buổi sáng',
    roomUsed: 'Phòng thực hành Lý - Công nghệ 1',
    expectedReturnDate: '2026-11-09',
    actualReturnDate: undefined,
    items: [
      {
        equipmentId: 'eq_vl_001',
        equipmentCode: 'TB-VL-001',
        equipmentName: 'Bộ thí nghiệm điện học KHTN 8',
        unit: 'Bộ',
        requestedQty: 3,
        handedQty: 3,
        returnedNormalQty: 0,
        returnedDamagedQty: 0,
        returnedLostQty: 0
      }
    ],
    status: 'handed_over',
    requestNotes: 'Chuẩn bị thêm 6 cục pin đại 1.5V cho học sinh thực hành theo nhóm',
    staffApprovalNotes: 'Đã chuẩn bị đủ thiết bị và kiểm tra nguồn pin',
    assignedStaffId: 'user_nv1',
    assignedStaffName: 'Nguyễn Văn An',
    handedOverBy: 'Nguyễn Văn An',
    handedOverAt: '2026-11-09T07:15:00Z',
    createdAt: '2026-11-08T14:00:00Z',
    updatedAt: '2026-11-09T07:15:00Z'
  },
  {
    id: 'ticket_002',
    ticketCode: 'PM-2026-0043',
    teacherId: 'user_gv2',
    teacherName: 'Thầy Đặng Minh Tuấn',
    teacherPhone: '0935.234.567',
    department: 'Tổ Khoa học Tự nhiên',
    targetClass: '8A1',
    lessonTitle: 'Bài 8: Acid và tính chất hóa học cơ bản',
    useDate: '2026-11-10',
    usePeriod: 'Tiết 1, 2 - Buổi sáng',
    roomUsed: 'Phòng thực hành Hóa - Sinh 1',
    expectedReturnDate: '2026-11-10',
    items: [
      {
        equipmentId: 'eq_hh_001',
        equipmentCode: 'TB-HH-001',
        equipmentName: 'Bộ dụng cụ thí nghiệm điều chế và thu khí Oxygen, Hydrogen KHTN 8',
        unit: 'Bộ',
        requestedQty: 4,
        handedQty: 0,
        returnedNormalQty: 0,
        returnedDamagedQty: 0,
        returnedLostQty: 0
      },
      {
        equipmentId: 'eq_hh_002',
        equipmentCode: 'TB-HH-002',
        equipmentName: 'Cân điện tử phân tích độ chính xác 0.01g chuẩn phòng thí nghiệm',
        unit: 'Chiếc',
        requestedQty: 1,
        handedQty: 0,
        returnedNormalQty: 0,
        returnedDamagedQty: 0,
        returnedLostQty: 0
      }
    ],
    status: 'pending',
    requestNotes: 'Yêu cầu pha sẵn dung dịch HCl 1M và chuẩn bị quỳ tím',
    assignedStaffId: 'user_nv2',
    assignedStaffName: 'Trần Thị Bích',
    createdAt: '2026-11-08T18:30:00Z',
    updatedAt: '2026-11-08T18:30:00Z'
  },
  {
    id: 'ticket_003',
    ticketCode: 'PM-2026-0040',
    teacherId: 'user_gv3',
    teacherName: 'Cô Phạm Thị Lan',
    teacherPhone: '0936.345.678',
    department: 'Tổ Khoa học Tự nhiên',
    targetClass: '6A3',
    lessonTitle: 'Bài 19: Quan sát tế bào biểu bì vảy hành dưới kính hiển vi',
    useDate: '2026-11-05',
    usePeriod: 'Tiết 3, 4 - Buổi sáng',
    roomUsed: 'Phòng thực hành Hóa - Sinh 2',
    expectedReturnDate: '2026-11-05',
    actualReturnDate: '2026-11-05T11:20:00Z',
    items: [
      {
        equipmentId: 'eq_sh_001',
        equipmentCode: 'TB-SH-001',
        equipmentName: 'Kính hiển vi quang học 1 mắt độ phóng đại 1600x',
        unit: 'Chiếc',
        requestedQty: 6,
        handedQty: 6,
        returnedNormalQty: 6,
        returnedDamagedQty: 0,
        returnedLostQty: 0
      }
    ],
    status: 'returned',
    requestNotes: 'Cần lam kính và lamen sạch',
    staffApprovalNotes: 'Đã chuẩn bị lam kính và củ hành tím',
    returnInspectionNotes: 'Đã nhận đủ 6 kính, lau sạch thị kính và dầu soi',
    assignedStaffId: 'user_nv2',
    assignedStaffName: 'Trần Thị Bích',
    handedOverBy: 'Trần Thị Bích',
    handedOverAt: '2026-11-05T08:45:00Z',
    receivedBackBy: 'Trần Thị Bích',
    receivedBackAt: '2026-11-05T11:20:00Z',
    createdAt: '2026-11-04T15:00:00Z',
    updatedAt: '2026-11-05T11:20:00Z'
  },
  {
    id: 'ticket_004',
    ticketCode: 'PM-2026-0038',
    teacherId: 'user_gv6',
    teacherName: 'Cô Nguyễn Thị Mai',
    teacherPhone: '0939.678.901',
    department: 'Tổ Ngữ văn',
    targetClass: '9A1',
    lessonTitle: 'Chuyên đề: Văn học hiện thực và trình chiếu phóng sự tư liệu',
    useDate: '2026-11-02',
    usePeriod: 'Tiết 4, 5 - Buổi chiều',
    roomUsed: 'Lớp học 204 (Nhà A)',
    expectedReturnDate: '2026-11-02',
    actualReturnDate: '2026-11-02T17:15:00Z',
    items: [
      {
        equipmentId: 'eq_th_001',
        equipmentCode: 'TB-TH-001',
        equipmentName: 'Máy chiếu đa năng độ nét cao EPSON EB-E01',
        unit: 'Bộ',
        requestedQty: 1,
        handedQty: 1,
        returnedNormalQty: 1,
        returnedDamagedQty: 0,
        returnedLostQty: 0
      }
    ],
    status: 'returned',
    assignedStaffId: 'user_nv3',
    assignedStaffName: 'Lê Hoàng Cường',
    handedOverBy: 'Lê Hoàng Cường',
    handedOverAt: '2026-11-02T13:30:00Z',
    receivedBackBy: 'Lê Hoàng Cường',
    receivedBackAt: '2026-11-02T17:15:00Z',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-02T17:15:00Z'
  }
];

// Initial Damage Reports
export const INITIAL_DAMAGE_REPORTS: DamageReport[] = [
  {
    id: 'rep_001',
    equipmentId: 'eq_cn_001',
    equipmentCode: 'TB-CN-001',
    equipmentName: 'Bộ lắp ghép mô hình mạch điện thông minh cảm biến Công nghệ 8',
    quantity: 1,
    reportedBy: 'Cô Lê Thị Hoa',
    reportedById: 'user_gv1',
    reportedDate: '2026-11-06',
    errorDescription: 'Biến trở tinh chỉnh và cảm biến quang trở bị đứt chân tiếp xúc hàn trên board mạch',
    status: 'processing',
    assignedStaffId: 'user_nv1',
    assignedStaffName: 'Nguyễn Văn An',
    solution: 'Tự khắc phục tại trường',
    repairCost: 50000,
    resultNotes: 'Đang đặt linh kiện điện trở quang thay thế và hàn lại chân',
    createdAt: '2026-11-06T09:15:00Z'
  },
  {
    id: 'rep_002',
    equipmentId: 'eq_vl_001',
    equipmentCode: 'TB-VL-001',
    equipmentName: 'Bộ thí nghiệm điện học KHTN 8',
    quantity: 1,
    reportedBy: 'Nguyễn Văn An',
    reportedById: 'user_nv1',
    reportedDate: '2026-10-25',
    errorDescription: 'Đồng hồ đo Ampe kế bị kẹt kim chỉ thị cơ học khi học sinh cắm nhầm thang đo',
    status: 'repaired',
    assignedStaffId: 'user_nv1',
    assignedStaffName: 'Nguyễn Văn An',
    solution: 'Tự khắc phục tại trường',
    repairCost: 0,
    completedDate: '2026-10-26',
    resultNotes: 'Đã tháo mặt kính căn chỉnh lại lò xo cân bằng từ, đo kiểm chuẩn xác',
    createdAt: '2026-10-25T14:00:00Z'
  }
];

// Initial Inventory Audits
export const INITIAL_INVENTORY_AUDITS: InventoryAudit[] = [
  {
    id: 'audit_2026_hk1',
    title: 'Kiểm kê định kỳ trang thiết bị dạy học đầu Học kỳ 1 (Năm học 2026–2027)',
    scopeType: 'all',
    academicYear: '2026–2027',
    auditDate: '2026-09-05',
    status: 'approved_by_admin',
    leadAuditor: 'Thầy Nguyễn Văn Minh (Hiệu trưởng)',
    auditors: ['Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Vũ Quốc Hưng'],
    totalBookQty: 133,
    totalActualQty: 133,
    totalGoodQty: 130,
    totalDamagedQty: 3,
    totalShortageQty: 0,
    totalExcessQty: 0,
    adminConclusion: 'Hội đồng kiểm kê xác nhận: Toàn bộ danh mục 13 loại thiết bị khớp 100% với số lượng theo dõi trên sổ sách. Thiết bị hoạt động tốt 97.7%, 3 thiết bị cần bảo dưỡng nhẹ. Cho phép đưa vào giảng dạy.',
    approvedAt: '2026-09-06T15:00:00Z',
    approvedBy: 'Thầy Nguyễn Văn Minh',
    createdAt: '2026-09-05T08:00:00Z',
    items: [
      {
        equipmentId: 'eq_vl_001',
        equipmentCode: 'TB-VL-001',
        equipmentName: 'Bộ thí nghiệm điện học KHTN 8',
        unit: 'Bộ',
        bookQty: 12,
        actualQty: 12,
        diff: 0,
        goodQty: 11,
        damagedQty: 1,
        lostQty: 0,
        statusText: 'Đủ',
        auditor: 'Nguyễn Văn An',
        notes: 'Khớp sổ sách'
      },
      {
        equipmentId: 'eq_hh_001',
        equipmentCode: 'TB-HH-001',
        equipmentName: 'Bộ dụng cụ thí nghiệm điều chế khí KHTN 8',
        unit: 'Bộ',
        bookQty: 16,
        actualQty: 16,
        diff: 0,
        goodQty: 16,
        damagedQty: 0,
        lostQty: 0,
        statusText: 'Đủ',
        auditor: 'Trần Thị Bích',
        notes: 'Ống nghiệm bảo quản tốt'
      },
      {
        equipmentId: 'eq_sh_001',
        equipmentCode: 'TB-SH-001',
        equipmentName: 'Kính hiển vi quang học 1 mắt 1600x',
        unit: 'Chiếc',
        bookQty: 16,
        actualQty: 16,
        diff: 0,
        goodQty: 16,
        damagedQty: 0,
        lostQty: 0,
        statusText: 'Đủ',
        auditor: 'Trần Thị Bích',
        notes: 'Ống kính trong suốt, đèn LED sáng đều'
      }
    ]
  }
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-11-09T07:15:00Z',
    userId: 'user_nv1',
    userName: 'Nguyễn Văn An',
    userRole: 'staff',
    action: 'Bàn giao thiết bị cho giáo viên',
    entityType: 'borrow',
    entityId: 'PM-2026-0042',
    details: 'Đã xuất kho bàn giao 03 Bộ thí nghiệm điện học KHTN 8 cho cô Lê Thị Hoa dạy lớp 8A2'
  },
  {
    id: 'log_002',
    timestamp: '2026-11-08T18:30:00Z',
    userId: 'user_gv2',
    userName: 'Thầy Đặng Minh Tuấn',
    userRole: 'teacher',
    action: 'Tạo phiếu mượn thiết bị mới',
    entityType: 'borrow',
    entityId: 'PM-2026-0043',
    details: 'Đăng ký mượn 04 Bộ dụng cụ thí nghiệm điều chế khí và 01 Cân phân tích cho bài dạy Acid lớp 8A1'
  },
  {
    id: 'log_003',
    timestamp: '2026-11-06T09:15:00Z',
    userId: 'user_gv1',
    userName: 'Cô Lê Thị Hoa',
    userRole: 'teacher',
    action: 'Gửi báo hỏng thiết bị',
    entityType: 'repair',
    entityId: 'BH-2026-001',
    details: 'Báo hỏng 01 Bộ mô hình cảm biến Công nghệ 8 bị đứt chân hàn'
  },
  {
    id: 'log_004',
    timestamp: '2026-09-06T15:00:00Z',
    userId: 'user_bgh1',
    userName: 'Thầy Nguyễn Văn Minh (Hiệu trưởng)',
    userRole: 'bgh',
    action: 'Phê duyệt kết quả kiểm kê',
    entityType: 'inventory',
    entityId: 'audit_2026_hk1',
    details: 'Ký duyệt biên bản kiểm kê đầu năm học 2026–2027 toàn trường'
  }
];

// Helper to safely load from LocalStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
}

// Helper to safely save to LocalStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event for reactivity across components
    window.dispatchEvent(new CustomEvent('nhonmy_storage_change', { detail: { key } }));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

export const StorageService = {
  // --- School Info ---
  getSchoolInfo(): SchoolInfo {
    const info = loadFromStorage<SchoolInfo>(STORAGE_KEYS.SCHOOL_INFO, INITIAL_SCHOOL_INFO);
    if (info.totalClasses === 19 && info.totalStudents === 733) {
      info.totalClasses = 42;
      info.totalStudents = 1401;
      saveToStorage(STORAGE_KEYS.SCHOOL_INFO, info);
    }
    return info;
  },
  saveSchoolInfo(info: SchoolInfo): void {
    saveToStorage(STORAGE_KEYS.SCHOOL_INFO, info);
    this.addAuditLog('system', 'Cập nhật thông tin nhà trường', 'system', info.name);
  },

  // --- Users ---
  getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },
  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
    this.addAuditLog('user', `Lưu thông tin tài khoản: ${user.name} (${user.role})`, 'user', user.id);
  },
  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, users);
    this.addAuditLog('user', `Xóa tài khoản ID: ${id}`, 'user', id);
  },

  // --- Current Active User (for testing & role preview) ---
  getCurrentUser(): User {
    const defaultUser = INITIAL_USERS[0]; // Admin by default
    const saved = loadFromStorage<User>(STORAGE_KEYS.CURRENT_USER, defaultUser);
    // ensure user still exists in full user list
    const found = this.getUserById(saved.id);
    return found || defaultUser;
  },
  setCurrentUser(user: User): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  // --- Equipment Catalog ---
  getEquipment(): Equipment[] {
    return loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  },
  getEquipmentById(id: string): Equipment | undefined {
    return this.getEquipment().find(e => e.id === id);
  },
  getEquipmentByCode(code: string): Equipment | undefined {
    return this.getEquipment().find(e => e.code.toUpperCase() === code.trim().toUpperCase());
  },
  saveEquipment(item: Equipment): void {
    const list = this.getEquipment();
    const index = list.findIndex(e => e.id === item.id);
    // Recalculate available quantity
    item.availableQuantity = Math.max(0, item.actualQuantity - item.borrowingQuantity - item.damagedQuantity);
    
    if (index >= 0) {
      list[index] = item;
      this.addAuditLog('equipment', `Cập nhật thiết bị: ${item.name} (${item.code})`, 'equipment', item.id);
    } else {
      list.unshift(item);
      this.addAuditLog('equipment', `Thêm mới thiết bị: ${item.name} (${item.code})`, 'equipment', item.id);
    }
    saveToStorage(STORAGE_KEYS.EQUIPMENT, list);
  },
  archiveEquipment(id: string): void {
    const list = this.getEquipment();
    const item = list.find(e => e.id === id);
    if (item) {
      item.status = 'archived';
      saveToStorage(STORAGE_KEYS.EQUIPMENT, list);
      this.addAuditLog('equipment', `Ngừng theo dõi thiết bị: ${item.name} (${item.code})`, 'equipment', item.id);
    }
  },

  // --- Borrow Tickets ---
  getBorrowTickets(): BorrowTicket[] {
    return loadFromStorage<BorrowTicket[]>(STORAGE_KEYS.BORROW_TICKETS, INITIAL_BORROW_TICKETS);
  },
  getBorrowTicketById(id: string): BorrowTicket | undefined {
    return this.getBorrowTickets().find(t => t.id === id);
  },
  saveBorrowTicket(ticket: BorrowTicket): void {
    const list = this.getBorrowTickets();
    const index = list.findIndex(t => t.id === ticket.id);
    if (index >= 0) {
      list[index] = ticket;
    } else {
      list.unshift(ticket);
    }
    saveToStorage(STORAGE_KEYS.BORROW_TICKETS, list);
  },

  // Workflow Handlers for Borrowing
  approveBorrowTicket(ticketId: string, staff: User, notes?: string): boolean {
    const ticket = this.getBorrowTicketById(ticketId);
    if (!ticket) return false;
    ticket.status = 'approved';
    ticket.assignedStaffId = staff.id;
    ticket.assignedStaffName = staff.name;
    if (notes) ticket.staffApprovalNotes = notes;
    ticket.updatedAt = new Date().toISOString();
    this.saveBorrowTicket(ticket);
    this.addAuditLog('borrow', `Duyệt phiếu mượn ${ticket.ticketCode} cho GV ${ticket.teacherName}`, 'borrow', ticket.id);
    return true;
  },

  handoverBorrowTicket(ticketId: string, staff: User): boolean {
    const ticket = this.getBorrowTicketById(ticketId);
    if (!ticket) return false;

    // Check inventory availability
    const equipmentList = this.getEquipment();
    for (const item of ticket.items) {
      const eq = equipmentList.find(e => e.id === item.equipmentId);
      if (!eq || eq.availableQuantity < item.requestedQty) {
        throw new Error(`Thiết bị "${item.equipmentName}" không đủ số lượng khả dụng để giao (Còn: ${eq?.availableQuantity || 0}, Yêu cầu: ${item.requestedQty})`);
      }
    }

    // Deduct stock and set handedQty
    for (const item of ticket.items) {
      const eq = equipmentList.find(e => e.id === item.equipmentId)!;
      item.handedQty = item.requestedQty;
      eq.borrowingQuantity += item.handedQty;
      eq.availableQuantity = Math.max(0, eq.actualQuantity - eq.borrowingQuantity - eq.damagedQuantity);
      this.saveEquipment(eq);
    }

    ticket.status = 'handed_over';
    ticket.handedOverBy = staff.name;
    ticket.handedOverAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();
    this.saveBorrowTicket(ticket);
    this.addAuditLog('borrow', `Xuất kho bàn giao thiết bị phiếu ${ticket.ticketCode} cho GV ${ticket.teacherName}`, 'borrow', ticket.id);
    return true;
  },

  returnBorrowTicket(
    ticketId: string,
    staff: User,
    returnedItems: {
      equipmentId: string;
      returnedNormalQty: number;
      returnedDamagedQty: number;
      returnedLostQty: number;
      notes?: string;
    }[],
    inspectionNotes?: string
  ): boolean {
    const ticket = this.getBorrowTicketById(ticketId);
    if (!ticket) return false;

    const equipmentList = this.getEquipment();
    let hasDamagedOrLost = false;
    let isFullyReturned = true;

    for (const returnInfo of returnedItems) {
      const item = ticket.items.find(i => i.equipmentId === returnInfo.equipmentId);
      if (!item) continue;

      const totalReturnedThisTime = returnInfo.returnedNormalQty + returnInfo.returnedDamagedQty + returnInfo.returnedLostQty;
      item.returnedNormalQty = returnInfo.returnedNormalQty;
      item.returnedDamagedQty = returnInfo.returnedDamagedQty;
      item.returnedLostQty = returnInfo.returnedLostQty;
      if (returnInfo.notes) item.itemNotes = returnInfo.notes;

      if (returnInfo.returnedDamagedQty > 0 || returnInfo.returnedLostQty > 0) {
        hasDamagedOrLost = true;
      }
      if (totalReturnedThisTime < item.handedQty) {
        isFullyReturned = false;
      }

      // Update Equipment Stock
      const eq = equipmentList.find(e => e.id === returnInfo.equipmentId);
      if (eq) {
        // Decrease borrowing by total returned
        eq.borrowingQuantity = Math.max(0, eq.borrowingQuantity - totalReturnedThisTime);
        if (returnInfo.returnedDamagedQty > 0) {
          eq.damagedQuantity += returnInfo.returnedDamagedQty;
        }
        if (returnInfo.returnedLostQty > 0) {
          eq.actualQuantity = Math.max(0, eq.actualQuantity - returnInfo.returnedLostQty);
        }
        eq.availableQuantity = Math.max(0, eq.actualQuantity - eq.borrowingQuantity - eq.damagedQuantity);
        this.saveEquipment(eq);

        // Auto-generate damage report if equipment was returned damaged
        if (returnInfo.returnedDamagedQty > 0) {
          this.saveDamageReport({
            id: `rep_${Date.now()}`,
            equipmentId: eq.id,
            equipmentCode: eq.code,
            equipmentName: eq.name,
            quantity: returnInfo.returnedDamagedQty,
            reportedBy: `${ticket.teacherName} (khi trả thiết bị)`,
            reportedById: ticket.teacherId,
            reportedDate: new Date().toISOString().split('T')[0],
            errorDescription: `Hư hỏng phát hiện khi trả thiết bị theo phiếu ${ticket.ticketCode}: ${returnInfo.notes || 'Cần kiểm tra kỹ thuật'}`,
            status: 'reported',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    if (hasDamagedOrLost) {
      ticket.status = 'damaged_returned';
    } else if (isFullyReturned) {
      ticket.status = 'returned';
    } else {
      ticket.status = 'partial_returned';
    }

    ticket.actualReturnDate = new Date().toISOString();
    ticket.receivedBackBy = staff.name;
    ticket.receivedBackAt = new Date().toISOString();
    if (inspectionNotes) ticket.returnInspectionNotes = inspectionNotes;
    ticket.updatedAt = new Date().toISOString();

    this.saveBorrowTicket(ticket);
    this.addAuditLog('borrow', `Tiếp nhận trả thiết bị cho phiếu ${ticket.ticketCode} (${ticket.status})`, 'borrow', ticket.id);
    return true;
  },

  // --- Rooms ---
  getRooms(): Room[] {
    return loadFromStorage<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  },
  saveRoom(room: Room): void {
    const rooms = this.getRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
    this.addAuditLog('room', `Cập nhật phòng: ${room.name}`, 'room', room.id);
  },

  // --- Inventory Audits ---
  getInventoryAudits(): InventoryAudit[] {
    return loadFromStorage<InventoryAudit[]>(STORAGE_KEYS.INVENTORY_AUDITS, INITIAL_INVENTORY_AUDITS);
  },
  saveInventoryAudit(audit: InventoryAudit): void {
    const list = this.getInventoryAudits();
    const index = list.findIndex(a => a.id === audit.id);
    if (index >= 0) {
      list[index] = audit;
    } else {
      list.unshift(audit);
    }
    saveToStorage(STORAGE_KEYS.INVENTORY_AUDITS, list);
    this.addAuditLog('inventory', `Lưu đợt kiểm kê: ${audit.title} (${audit.status})`, 'inventory', audit.id);
  },

  // Apply Inventory Results to Catalog (Only Admin or authorized staff)
  applyInventoryResults(auditId: string, adminUser: User): void {
    const audit = this.getInventoryAudits().find(a => a.id === auditId);
    if (!audit) return;
    const equipmentList = this.getEquipment();

    audit.items.forEach(check => {
      const eq = equipmentList.find(e => e.id === check.equipmentId);
      if (eq) {
        // Adjust book & actual quantity after formal confirmation
        eq.bookQuantity = check.bookQty;
        eq.actualQuantity = check.actualQty;
        eq.damagedQuantity = check.damagedQty;
        eq.availableQuantity = Math.max(0, eq.actualQuantity - eq.borrowingQuantity - eq.damagedQuantity);
        eq.updatedAt = new Date().toISOString();
        eq.updatedBy = `${adminUser.name} (Sau kiểm kê ${audit.title})`;
        this.saveEquipment(eq);
      }
    });

    audit.status = 'approved_by_admin';
    audit.approvedAt = new Date().toISOString();
    audit.approvedBy = adminUser.name;
    this.saveInventoryAudit(audit);
    this.addAuditLog('inventory', `Phê duyệt và đồng bộ số liệu kiểm kê vào danh mục thiết bị: ${audit.title}`, 'inventory', audit.id);
  },

  // --- Damage & Repair Reports ---
  getDamageReports(): DamageReport[] {
    return loadFromStorage<DamageReport[]>(STORAGE_KEYS.DAMAGE_REPORTS, INITIAL_DAMAGE_REPORTS);
  },
  saveDamageReport(report: DamageReport): void {
    const list = this.getDamageReports();
    const index = list.findIndex(r => r.id === report.id);
    if (index >= 0) {
      list[index] = report;
    } else {
      list.unshift(report);
    }
    saveToStorage(STORAGE_KEYS.DAMAGE_REPORTS, list);
    this.addAuditLog('repair', `Ghi nhận sự cố thiết bị: ${report.equipmentName} (${report.status})`, 'repair', report.id);
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(
    entityType: 'equipment' | 'borrow' | 'inventory' | 'repair' | 'user' | 'system' | 'room',
    action: string,
    category: string,
    entityId?: string
  ): void {
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details: `${action} [${category}]`
    };
    const logs = this.getAuditLogs();
    logs.unshift(newLog);
    // keep max 500 logs
    if (logs.length > 500) logs.pop();
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // --- Academic Years ---
  getAcademicYears(): string[] {
    return loadFromStorage<string[]>(STORAGE_KEYS.ACADEMIC_YEARS, ['2025–2026', '2026–2027', '2027–2028']);
  },
  getActiveYear(): string {
    return loadFromStorage<string>(STORAGE_KEYS.ACTIVE_YEAR, '2026–2027');
  },
  setActiveYear(year: string): void {
    saveToStorage(STORAGE_KEYS.ACTIVE_YEAR, year);
    this.addAuditLog('system', `Chuyển năm học làm việc sang: ${year}`, 'system');
  },
  addAcademicYear(newYear: string): void {
    const years = this.getAcademicYears();
    if (!years.includes(newYear)) {
      years.push(newYear);
      saveToStorage(STORAGE_KEYS.ACADEMIC_YEARS, years);
      this.addAuditLog('system', `Tạo thêm năm học mới: ${newYear}`, 'system');
    }
  },

  // --- Backup & Restore ---
  exportFullDatabase(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolInfo: this.getSchoolInfo(),
      users: this.getUsers(),
      equipment: this.getEquipment(),
      borrowTickets: this.getBorrowTickets(),
      inventoryAudits: this.getInventoryAudits(),
      damageReports: this.getDamageReports(),
      rooms: this.getRooms(),
      auditLogs: this.getAuditLogs(),
      academicYears: this.getAcademicYears(),
      activeYear: this.getActiveYear()
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.schoolInfo) saveToStorage(STORAGE_KEYS.SCHOOL_INFO, data.schoolInfo);
      if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
      if (data.equipment) saveToStorage(STORAGE_KEYS.EQUIPMENT, data.equipment);
      if (data.borrowTickets) saveToStorage(STORAGE_KEYS.BORROW_TICKETS, data.borrowTickets);
      if (data.inventoryAudits) saveToStorage(STORAGE_KEYS.INVENTORY_AUDITS, data.inventoryAudits);
      if (data.damageReports) saveToStorage(STORAGE_KEYS.DAMAGE_REPORTS, data.damageReports);
      if (data.rooms) saveToStorage(STORAGE_KEYS.ROOMS, data.rooms);
      if (data.auditLogs) saveToStorage(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.academicYears) saveToStorage(STORAGE_KEYS.ACADEMIC_YEARS, data.academicYears);
      if (data.activeYear) saveToStorage(STORAGE_KEYS.ACTIVE_YEAR, data.activeYear);
      
      this.addAuditLog('system', 'Khôi phục toàn bộ cơ sở dữ liệu từ file sao lưu', 'system');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  resetToDefaultData(): void {
    saveToStorage(STORAGE_KEYS.SCHOOL_INFO, INITIAL_SCHOOL_INFO);
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    saveToStorage(STORAGE_KEYS.BORROW_TICKETS, INITIAL_BORROW_TICKETS);
    saveToStorage(STORAGE_KEYS.INVENTORY_AUDITS, INITIAL_INVENTORY_AUDITS);
    saveToStorage(STORAGE_KEYS.DAMAGE_REPORTS, INITIAL_DAMAGE_REPORTS);
    saveToStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    saveToStorage(STORAGE_KEYS.ACADEMIC_YEARS, ['2025–2026', '2026–2027', '2027–2028']);
    saveToStorage(STORAGE_KEYS.ACTIVE_YEAR, '2026–2027');
    this.addAuditLog('system', 'Thiết lập lại dữ liệu mẫu gốc ban đầu Trường THCS Nhơn Mỹ', 'system');
  }
};
