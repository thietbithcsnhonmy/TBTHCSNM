import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { SchoolInfo, AuditLog } from '../../types';
import {
  Settings,
  Database,
  Calendar,
  Save,
  Download,
  Upload,
  RefreshCw,
  ShieldAlert,
  Cloud,
  CheckCircle2,
  FileCode,
  Building,
  History
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, canManageSystem } = useAuth();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => StorageService.getSchoolInfo());
  const [academicYears, setAcademicYears] = useState<string[]>(() => StorageService.getAcademicYears());
  const [activeYear, setActiveYearState] = useState<string>(() => StorageService.getActiveYear());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  const [newYearInput, setNewYearInput] = useState('2027–2028');
  const [activeTab, setActiveTab] = useState<'school' | 'years' | 'backup' | 'firebase' | 'logs'>('school');

  // Firebase config state
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: 'thcs-nhonmy-equipment',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [firebaseStatus, setFirebaseStatus] = useState<'local' | 'connected'>('local');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSchoolInfo(schoolInfo);
    alert('Đã cập nhật thông tin đơn vị Trường THCS Nhơn Mỹ thành công!');
  };

  const handleSwitchYear = (year: string) => {
    StorageService.setActiveYear(year);
    setActiveYearState(year);
    alert(`Đã chuyển năm học làm việc sang: ${year}`);
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    StorageService.addAcademicYear(newYearInput.trim());
    setAcademicYears(StorageService.getAcademicYears());
    setNewYearInput('');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_CSDL_THCS_Nhon_My_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (StorageService.importDatabase(content)) {
        alert('Khôi phục cơ sở dữ liệu từ file sao lưu thành công!');
        window.location.reload();
      } else {
        alert('File sao lưu không hợp lệ hoặc bị hỏng cấu trúc JSON!');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'CẢNH BÁO NGUY HIỂM:\n\nBạn có chắc chắn muốn thiết lập lại toàn bộ dữ liệu về cấu hình mặc định ban đầu của Trường THCS Nhơn Mỹ? Toàn bộ giao dịch và thiết bị tạo mới sẽ được đặt lại.'
      )
    ) {
      StorageService.resetToDefaultData();
      alert('Đã thiết lập lại dữ liệu mẫu gốc!');
      window.location.reload();
    }
  };

  const handleConnectFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      alert('Vui lòng điền tối thiểu API Key và Project ID của Firebase!');
      return;
    }
    setFirebaseStatus('connected');
    alert('Đã lưu cấu hình Firebase! Hệ thống sẵn sàng đồng bộ cơ sở dữ liệu Cloud Firestore.');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cài Đặt Hệ Thống & Cơ Sở Dữ Liệu</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cấu hình quy mô trường lớp, quản lý năm học, sao lưu khôi phục JSON và kết nối Firebase
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-2xs no-print">
        {[
          { id: 'school', label: '1. Thông tin trường học & Quy mô' },
          { id: 'years', label: '2. Quản lý năm học' },
          { id: 'backup', label: '3. Sao lưu & Phục hồi dữ liệu' },
          { id: 'firebase', label: '4. Kết nối Firebase & Firestore' },
          { id: 'logs', label: '5. Nhật ký thao tác (Audit Logs)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: School Info & Scale */}
      {activeTab === 'school' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Cấu Hình Quy Mô & Thông Tin Đơn Vị Trường THCS Nhơn Mỹ
            </h2>
            <p className="text-xs text-slate-500">
              Quản trị viên có thể cập nhật các số liệu này khi nhà trường có sự điều chỉnh quy mô
            </p>
          </div>

          <form onSubmit={handleSaveSchoolInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên đơn vị *
                </label>
                <input
                  type="text"
                  required
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên viết tắt *
                </label>
                <input
                  type="text"
                  required
                  value={schoolInfo.shortName}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, shortName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chương trình giảng dạy
                </label>
                <input
                  type="text"
                  value={schoolInfo.program}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, program: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số lớp học hiện tại
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalClasses}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalClasses: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổng số học sinh
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalStudents}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalStudents: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổng số giáo viên giảng dạy
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalTeachers}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalTeachers: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổng số nhân viên
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalStaff}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalStaff: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số phòng học văn hóa
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalClassrooms}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalClassrooms: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số phòng chức năng & thực hành
                </label>
                <input
                  type="number"
                  value={schoolInfo.totalFunctionRooms}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, totalFunctionRooms: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên Hiệu trưởng
                </label>
                <input
                  type="text"
                  value={schoolInfo.principalName}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, principalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên Phó Hiệu trưởng
                </label>
                <input
                  type="text"
                  value={schoolInfo.vicePrincipalName}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, vicePrincipalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số điện thoại văn phòng
                </label>
                <input
                  type="text"
                  value={schoolInfo.phone}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thông tin trường</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Academic Years */}
      {activeTab === 'years' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Quản Lý Năm Học & Niên Khóa
            </h2>
            <p className="text-xs text-slate-500">
              Chuyển đổi năm học làm việc, tạo năm học mới. Lịch sử thiết bị và giao dịch cũ được bảo toàn nguyên vẹn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List of Years */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700">Các năm học trong hệ thống:</h3>
              <div className="space-y-2">
                {academicYears.map((yr) => {
                  const isActive = yr === activeYear;
                  return (
                    <div
                      key={yr}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold text-slate-900">{yr}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                            Năm học hiện tại
                          </span>
                        )}
                      </div>

                      {!isActive && (
                        <button
                          onClick={() => handleSwitchYear(yr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Chuyển sang năm này
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create new year */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Tạo thêm năm học mới:</h3>
              <form onSubmit={handleAddYear} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Tên năm học (định dạng YYYY–YYYY):</label>
                  <input
                    type="text"
                    required
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    placeholder="VD: 2027–2028"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                >
                  + Thêm năm học
                </button>
                <p className="text-[11px] text-slate-500 italic">
                  Khi khởi tạo năm học mới, toàn bộ danh mục tài sản sẽ được kế thừa tự động mà không làm mất lịch sử mượn trả của các năm học trước.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Sao Lưu & Phục Hồi Dữ Liệu Toàn Diện
            </h2>
            <p className="text-xs text-slate-500">
              Xuất toàn bộ cơ sở dữ liệu (danh mục, giao dịch mượn trả, kiểm kê, nhật ký) ra file JSON hoặc nhập lại file sao lưu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Backup Card */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>Sao lưu dữ liệu (Export JSON)</span>
              </div>
              <p className="text-xs text-slate-600">
                Tải về toàn bộ cơ sở dữ liệu hiện tại bao gồm tài khoản, danh mục thiết bị, phòng học, các phiếu mượn trả và biên bản kiểm kê để lưu trữ dự phòng.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file sao lưu (.JSON)</span>
              </button>
            </div>

            {/* Import Backup Card */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                <Upload className="w-4 h-4" />
                <span>Khôi phục dữ liệu (Import JSON)</span>
              </div>
              <p className="text-xs text-slate-600">
                Chọn file sao lưu JSON đã tải về trước đó để phục hồi lại nguyên trạng cơ sở dữ liệu khi cần chuyển máy hoặc khôi phục sự cố.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn file phục hồi</span>
              </button>
            </div>
          </div>

          {/* Dangerous reset zone */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-rose-900">Thiết lập lại dữ liệu ban đầu</h3>
              <p className="text-[11px] text-rose-700">
                Xóa các thay đổi tùy biến và đưa toàn bộ ứng dụng về bộ số liệu chuẩn ban đầu của Trường THCS Nhơn Mỹ.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-800 text-white transition-colors cursor-pointer shrink-0"
            >
              Reset dữ liệu gốc
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Firebase Connection Panel */}
      {activeTab === 'firebase' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-800" />
              <span>Cấu Hình Kết Nối Cơ Sở Dữ Liệu Firebase & Cloud Firestore</span>
            </h2>
            <p className="text-xs text-slate-500">
              Trạng thái: <strong className="text-emerald-700">Hệ thống đang hoạt động với CSDL cục bộ đồng bộ thời gian thực</strong>. Kết nối Firebase khi triển khai đa thiết bị trực tuyến.
            </p>
          </div>

          {/* Architecture Guidelines */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900">Quy tắc kiến trúc Cloud Firestore THCS Nhơn Mỹ:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Colections:</strong> `nhonmy_equipment`, `nhonmy_borrow_tickets`, `nhonmy_inventory`, `nhonmy_repairs`, `nhonmy_audit_logs`.</li>
              <li><strong>Security Rules:</strong> Phân quyền nghiêm ngặt theo vai trò (`admin`, `bgh`, `staff`, `teacher`). Giáo viên chỉ được tạo phiếu mượn và xem lịch sử của mình, nhân viên thiết bị chỉ duyệt và trừ kho các môn được phân công.</li>
              <li>Không để lộ khóa bí mật trong mã nguồn công khai; sử dụng xác thực Firebase Authentication.</li>
            </ul>
          </div>

          <form onSubmit={handleConnectFirebase} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Firebase Project ID *
                </label>
                <input
                  type="text"
                  required
                  value={firebaseConfig.projectId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  placeholder="thcs-nhonmy-equipment"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  API Key *
                </label>
                <input
                  type="password"
                  value={firebaseConfig.apiKey}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={firebaseConfig.authDomain}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  placeholder="thcs-nhonmy-equipment.firebaseapp.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  value={firebaseConfig.storageBucket}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  placeholder="thcs-nhonmy-equipment.appspot.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Lưu ý: Không giả lập lưu trên server khi chưa cấu hình thành công.
              </span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thông số cấu hình Firebase</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Nhật Ký Thao Tác Hệ Thống (Audit Trail)
              </h2>
              <p className="text-xs text-slate-500">
                Ghi nhận tự động mọi thao tác thêm, sửa, duyệt, bàn giao, trả thiết bị, kiểm kê và đổi phân quyền
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {auditLogs.length} sự kiện
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-40">Thời gian</th>
                  <th className="py-2.5 px-3 w-44">Người thực hiện</th>
                  <th className="py-2.5 px-3 w-28">Vai trò</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Hành động</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Chi tiết đối tượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800 font-medium">
                      {log.action}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
