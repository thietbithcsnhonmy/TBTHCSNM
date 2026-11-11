import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../services/storageService';
import { Equipment } from '../../types';
import {
  QrCode,
  Search,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForBorrow?: (equipment: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectForBorrow
}) => {
  const [manualCode, setManualCode] = useState('');
  const [matchedEquipment, setMatchedEquipment] = useState<Equipment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMatchedEquipment(null);
      setManualCode('');
      setErrorMessage('');
      stopCamera();
    }
  }, [isOpen]);

  const handleLookup = (codeToSearch: string) => {
    const code = codeToSearch.trim().toUpperCase();
    if (!code) return;

    const found = StorageService.getEquipmentByCode(code);
    if (found) {
      setMatchedEquipment(found);
      setErrorMessage('');
    } else {
      setMatchedEquipment(null);
      setErrorMessage(`Không tìm thấy thiết bị với mã "${code}" trong kho!`);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setErrorMessage('Không thể truy cập camera. Vui lòng nhập mã thiết bị thủ công bên dưới.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Quét Mã QR & Tra Cứu Thiết Bị</h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Camera Viewport or Toggle */}
          <div className="rounded-xl overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center min-h-[180px] relative border border-slate-800">
            {isCameraActive ? (
              <div className="relative w-full h-48 bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* Aim Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-36 border-2 border-emerald-400 rounded-lg animate-pulse" />
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute top-2 right-2 px-2 py-1 text-[11px] bg-slate-800/80 hover:bg-slate-800 rounded text-white"
                >
                  Tắt camera
                </button>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Sử dụng camera điện thoại/máy tính để quét nhanh tem QR dán trên thiết bị
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                >
                  Bật máy quét camera
                </button>
              </div>
            )}
          </div>

          {/* Quick Manual Code Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Hoặc nhập mã thiết bị tra cứu nhanh:
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="VD: TB-VL-001, TB-HH-001..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
              >
                Tra cứu
              </button>
            </form>
          </div>

          {/* Suggested Quick Codes */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span>Mã mẫu:</span>
            {['TB-VL-001', 'TB-HH-001', 'TB-SH-001', 'TB-TH-001'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setManualCode(c);
                  handleLookup(c);
                }}
                className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lookup Result Card */}
          {matchedEquipment && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    {matchedEquipment.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {matchedEquipment.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Môn: <strong className="text-slate-800">{matchedEquipment.subject}</strong> · {matchedEquipment.grade}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Khả dụng</span>
                  <span className="font-mono text-base font-bold text-emerald-800">
                    {matchedEquipment.availableQuantity} {matchedEquipment.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-emerald-200/60 pt-2">
                <div>
                  Vị trí: <strong className="text-slate-800">{matchedEquipment.storageRoom}</strong>
                </div>
                <div>
                  Ngăn tủ: <strong className="text-slate-800">{matchedEquipment.location || 'Chưa định vị'}</strong>
                </div>
                <div>
                  Tình trạng: <strong className="text-emerald-800">{matchedEquipment.status === 'good' ? 'Hoạt động tốt' : 'Cần sửa'}</strong>
                </div>
                <div>
                  Đang mượn: <strong className="text-indigo-700">{matchedEquipment.borrowingQuantity} {matchedEquipment.unit}</strong>
                </div>
              </div>

              {onSelectForBorrow && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onSelectForBorrow(matchedEquipment);
                      stopCamera();
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Chọn vào phiếu mượn</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
