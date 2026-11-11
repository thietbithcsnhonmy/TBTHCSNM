import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { User, UserRole, SubjectCategory } from '../../types';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  Wrench,
  GraduationCap,
  Edit2,
  Lock,
  Unlock,
  X,
  Phone,
  Mail,
  Building
} from 'lucide-react';

const ALL_SUBJECTS: SubjectCategory[] = [
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

export const PersonnelView: React.FC = () => {
  const { currentUser, users, refreshUsers, canManageSystem } = useAuth();
  const rooms = StorageService.getRooms();
  const tickets = StorageService.getBorrowTickets();

  const [activeTab, setActiveTab] = useState<'staff' | 'teachers'>('staff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [department, setDepartment] = useState('Tổ Khoa học Tự nhiên');
  const [subject, setSubject] = useState('Khoa học tự nhiên');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [assignedRooms, setAssignedRooms] = useState<string[]>([]);
  const [staffIndex, setStaffIndex] = useState<1 | 2 | 3 | undefined>(1);

  const staffList = users.filter((u) => u.role === 'staff');
  const teachersList = users.filter((u) => u.role === 'teacher');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail(`gv.${Date.now()}@nhonmy.edu.vn`);
    setPhone('0903.000.000');
    setRole('teacher');
    setDepartment('Tổ Khoa học Tự nhiên');
    setSubject('Khoa học tự nhiên');
    setAssignedSubjects([]);
    setAssignedRooms([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setDepartment(user.department || '');
    setSubject(user.subject || '');
    setAssignedSubjects(user.assignedSubjects || []);
    setAssignedRooms(user.assignedRooms || []);
    setStaffIndex(user.staffIndex);
    setIsModalOpen(true);
  };

  const handleToggleLock = (user: User) => {
    if (!canManageSystem) return;
    const action = user.isActive ? 'Khóa' : 'Mở khóa';
    if (window.confirm(`Xác nhận ${action} tài khoản của ${user.name}?`)) {
      StorageService.saveUser({
        ...user,
        isActive: !user.isActive
      });
      refreshUsers();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const userToSave: User = {
      id: editingUser ? editingUser.id : `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      department: department.trim(),
      subject: role === 'teacher' ? subject : undefined,
      assignedSubjects: role === 'staff' ? assignedSubjects : undefined,
      assignedRooms: role === 'staff' ? assignedRooms : undefined,
      staffIndex: role === 'staff' ? staffIndex : undefined,
      isActive: editingUser ? editingUser.isActive : true
    };

    StorageService.saveUser(userToSave);
    refreshUsers();
    setIsModalOpen(false);
  };

  const toggleSubjectAssignment = (sub: string) => {
    if (assignedSubjects.includes(sub)) {
      setAssignedSubjects(assignedSubjects.filter((s) => s !== sub));
    } else {
      setAssignedSubjects([...assignedSubjects, sub]);
    }
  };

  const toggleRoomAssignment = (roomName: string) => {
    if (assignedRooms.includes(roomName)) {
      setAssignedRooms(assignedRooms.filter((r) => r !== roomName));
    } else {
      setAssignedRooms([...assignedRooms, roomName]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Nhân Sự & Phân Công Thiết Bị</span>
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý 03 nhân viên thiết bị chuyên trách và 39 giáo viên bộ môn giảng dạy GDPT 2018
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageSystem && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm tài khoản</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          03 Nhân viên thiết bị phụ trách ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'teachers'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh sách giáo viên ({teachersList.length})
        </button>
      </div>

      {/* Tab 1: 03 Dedicated Equipment Staff */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffList.map((staff) => {
            const approvedCount = tickets.filter(
              (t) => t.assignedStaffId === staff.id || t.handedOverBy === staff.name
            ).length;

            return (
              <div
                key={staff.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs border border-emerald-200">
                      NV{staff.staffIndex || ''}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{staff.name}</h2>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        Nhân viên thiết bị {staff.staffIndex}
                      </span>
                    </div>
                  </div>

                  {canManageSystem && (
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      title="Sửa phân công phụ trách"
                      className="p-1.5 text-slate-400 hover:text-blue-700 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Môn học phụ trách ({staff.assignedSubjects?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {staff.assignedSubjects?.map((sub) => (
                      <span
                        key={sub}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Rooms */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Phòng thực hành & kho được giao:
                  </span>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    {staff.assignedRooms?.map((rm) => (
                      <li key={rm} className="truncate" title={rm}>
                        {rm}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Đã xử lý: <strong className="text-slate-800">{approvedCount}</strong> lượt mượn</span>
                  <span className="text-emerald-700 font-semibold">Đang hoạt động</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Teachers List Table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">STT</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Họ và tên giáo viên</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Tổ chuyên môn</th>
                  <th className="py-2.5 px-3 w-32">Môn giảng dạy</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Liên hệ (Email / SĐT)</th>
                  <th className="py-2.5 px-3 text-right w-28">Lượt mượn TB</th>
                  <th className="py-2.5 px-3 text-center w-28">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center w-20 no-print">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachersList.map((teacher, idx) => {
                  const borrowCount = tickets.filter((t) => t.teacherId === teacher.id).length;
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{teacher.name}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {teacher.department || 'Tổ bộ môn'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-900 font-medium">
                        {teacher.subject || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>{teacher.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{teacher.phone || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                        {borrowCount}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            teacher.isActive
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {teacher.isActive ? 'Đang công tác' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          {canManageSystem && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(teacher)}
                                title="Sửa thông tin"
                                className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleLock(teacher)}
                                title={teacher.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${
                                  teacher.isActive
                                    ? 'text-slate-400 hover:text-rose-600'
                                    : 'text-rose-600 hover:text-emerald-600'
                                }`}
                              >
                                {teacher.isActive ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
              <h2 className="text-base font-bold">
                {editingUser ? `Chỉnh Sửa: ${editingUser.name}` : 'Thêm Người Dùng Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vai trò tài khoản *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="teacher">Giáo viên bộ môn</option>
                    <option value="staff">Nhân viên thiết bị (03 chuyên trách)</option>
                    <option value="bgh">Ban Giám hiệu</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tổ chuyên môn
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                {role === 'teacher' && (
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Môn giảng dạy chính
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    >
                      {ALL_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {role === 'staff' && (
                  <>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Thứ tự nhân viên (1, 2, 3)
                      </label>
                      <select
                        value={staffIndex || 1}
                        onChange={(e) => setStaffIndex(Number(e.target.value) as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      >
                        <option value={1}>Nhân viên 1 (Lý - Công nghệ)</option>
                        <option value={2}>Nhân viên 2 (Hóa - Sinh)</option>
                        <option value={3}>Nhân viên 3 (Tin - Dùng chung - Tổng hợp)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Phân công các môn phụ trách:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {ALL_SUBJECTS.map((sub) => {
                          const isAssigned = assignedSubjects.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubjectAssignment(sub)}
                              className={`p-1.5 text-left rounded text-[11px] font-medium transition-colors ${
                                isAssigned
                                  ? 'bg-emerald-800 text-white font-semibold'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isAssigned ? '✓ ' : '+ '} {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Phân công phòng thực hành / phòng kho:
                      </label>
                      <div className="space-y-1 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {rooms.map((rm) => {
                          const isAssigned = assignedRooms.includes(rm.name);
                          return (
                            <button
                              key={rm.id}
                              type="button"
                              onClick={() => toggleRoomAssignment(rm.name)}
                              className={`w-full p-1.5 text-left rounded text-[11px] font-medium transition-colors ${
                                isAssigned
                                  ? 'bg-emerald-800 text-white font-semibold'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isAssigned ? '✓ ' : '+ '} {rm.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
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
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
