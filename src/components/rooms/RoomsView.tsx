import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { Room, Equipment } from '../../types';
import {
  DoorOpen,
  Plus,
  Boxes,
  Building,
  Edit2,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const RoomsView: React.FC = () => {
  const { currentUser, canManageSystem } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const equipmentList = StorageService.getEquipment();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(() => rooms[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Room['type']>('classroom');
  const [building, setBuilding] = useState('Nhà C (Khu thực hành)');
  const [floor, setFloor] = useState(2);
  const [capacity, setCapacity] = useState(45);
  const [managerStaffName, setManagerStaffName] = useState('Nguyễn Văn An');
  const [notes, setNotes] = useState('');

  const refreshRooms = () => {
    const list = StorageService.getRooms();
    setRooms(list);
    if (selectedRoom) {
      const updated = list.find((r) => r.id === selectedRoom.id);
      setSelectedRoom(updated || list[0] || null);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setCode(`PTH-${Date.now().toString().slice(-4)}`);
    setName('');
    setType('lab_physics');
    setBuilding('Nhà C (Khu thực hành)');
    setFloor(2);
    setCapacity(45);
    setManagerStaffName('Nguyễn Văn An');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setCode(r.code);
    setName(r.name);
    setType(r.type);
    setBuilding(r.building);
    setFloor(r.floor);
    setCapacity(r.capacity || 45);
    setManagerStaffName(r.managerStaffName || '');
    setNotes(r.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const roomToSave: Room = {
      id: editingRoom ? editingRoom.id : `room_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      building: building.trim(),
      floor,
      capacity,
      managerStaffName: managerStaffName.trim(),
      notes: notes.trim()
    };

    StorageService.saveRoom(roomToSave);
    refreshRooms();
    setIsModalOpen(false);
  };

  const currentRoomEquipments = selectedRoom
    ? equipmentList.filter((e) => e.storageRoom === selectedRoom.name && e.status !== 'archived')
    : [];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Phòng Học & Phòng Chức Năng</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 tabular-nums">
              {rooms.length} phòng
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            19 phòng học văn hóa, 04 phòng thực hành bộ môn (Lý-CN, Hóa-Sinh), 02 phòng dùng chung và Tin học
          </p>
        </div>

        {canManageSystem && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm phòng mới</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left room list + Right equipment list inside selected room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rooms List */}
        <div className="space-y-2">
          {rooms.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            const count = equipmentList.filter(
              (e) => e.storageRoom === room.name && e.status !== 'archived'
            ).length;

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      {room.code}
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 mt-0.5">{room.name}</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {room.building} · Tầng {room.floor}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {canManageSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(room);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100"
                        title="Sửa phòng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Phụ trách: <strong className="text-slate-700">{room.managerStaffName || 'Chung'}</strong>
                  </span>
                  <span className="font-bold text-emerald-800 tabular-nums">
                    {count} thiết bị
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side: Equipment in Selected Room */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRoom ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedRoom.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {selectedRoom.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRoom.building} · Sức chứa: {selectedRoom.capacity || 45} học sinh · Người quản lý: <strong className="text-slate-700">{selectedRoom.managerStaffName}</strong>
                  </p>
                  {selectedRoom.notes && (
                    <p className="text-xs text-slate-600 mt-1 italic">
                      Mô tả: {selectedRoom.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Equipment list in this room */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Danh Sách Thiết Bị Lưu Trữ Tại Phòng Này</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {currentRoomEquipments.length} loại thiết bị
                  </span>
                </h3>

                {currentRoomEquipments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    Chưa có thiết bị nào được phân bổ lưu trữ tại phòng này.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-semibold">
                        <tr>
                          <th className="py-2 px-3">Mã TB</th>
                          <th className="py-2 px-3">Tên thiết bị</th>
                          <th className="py-2 px-3">Vị trí (Tủ/Kệ)</th>
                          <th className="py-2 px-3 text-right">SL Thực tế</th>
                          <th className="py-2 px-3 text-right text-emerald-800">Khả dụng</th>
                          <th className="py-2 px-3 text-center">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentRoomEquipments.map((eq) => (
                          <tr key={eq.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-700">
                              {eq.code}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-900">
                              {eq.name}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {eq.location || 'Chưa định vị'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                              {eq.actualQuantity} {eq.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                              {eq.availableQuantity}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-semibold text-emerald-700">
                                {eq.status === 'good' ? 'Tốt' : 'Cần sửa'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
              Chọn phòng học để xem thông tin chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
              <h2 className="text-base font-bold">
                {editingRoom ? 'Chỉnh Sửa Thông Tin Phòng' : 'Thêm Phòng Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã phòng *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên phòng học / phòng chức năng *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600"
                  placeholder="VD: Phòng thực hành Hóa - Sinh 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dãy nhà / Khu vực
                  </label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tầng
                  </label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cán bộ phụ trách phòng
                </label>
                <input
                  type="text"
                  value={managerStaffName}
                  onChange={(e) => setManagerStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả cơ sở vật chất
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
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
                  Lưu phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
