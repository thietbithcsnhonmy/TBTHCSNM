import React, { useEffect, useState } from 'react';
import { Equipment } from '../../types';
import QRCode from 'qrcode';
import { Printer, X, Download } from 'lucide-react';

interface QRPrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
}

interface QRItemWithDataUrl {
  equipment: Equipment;
  dataUrl: string;
}

export const QRPrintSheetModal: React.FC<QRPrintSheetModalProps> = ({
  isOpen,
  onClose,
  equipmentList
}) => {
  const [qrItems, setQrItems] = useState<QRItemWithDataUrl[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (!isOpen || equipmentList.length === 0) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateAll = async () => {
      const results: QRItemWithDataUrl[] = [];
      for (const eq of equipmentList) {
        try {
          // Payload contains standard equipment lookup data
          const payload = JSON.stringify({
            school: 'THCS NHON MY',
            code: eq.code,
            name: eq.name,
            room: eq.storageRoom
          });
          const url = await QRCode.toDataURL(payload, {
            width: 140,
            margin: 1,
            color: {
              dark: '#0f291e',
              light: '#ffffff'
            }
          });
          results.push({ equipment: eq, dataUrl: url });
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }
      if (isMounted) {
        setQrItems(results);
        setIsGenerating(false);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [isOpen, equipmentList]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white no-print">
          <div>
            <h2 className="text-base font-bold">In Tem Nhãn Mã QR Thiết Bị Dạy Học</h2>
            <p className="text-xs text-slate-300">
              Định dạng chuẩn tem nhãn khổ dán tủ/hộp thiết bị ({equipmentList.length} tem)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In bản in</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto bg-slate-100">
          {isGenerating ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Đang tạo mã QR cho {equipmentList.length} thiết bị...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {qrItems.map(({ equipment, dataUrl }) => (
                <div
                  key={equipment.id}
                  className="bg-white border-2 border-slate-800 rounded-lg p-3 flex flex-col justify-between shadow-xs print:shadow-none break-inside-avoid"
                >
                  {/* School Name & Badge */}
                  <div className="border-b border-slate-300 pb-1 mb-1.5 text-center">
                    <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">
                      TRƯỜNG THCS NHƠN MỸ
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">
                      THIẾT BỊ DẠY HỌC GDPT 2018
                    </p>
                  </div>

                  {/* Body with QR and info */}
                  <div className="flex items-center gap-2">
                    <img
                      src={dataUrl}
                      alt={`QR Code ${equipment.code}`}
                      className="w-20 h-20 object-contain shrink-0 border border-slate-200 rounded"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-mono text-xs font-bold text-slate-900 block truncate">
                        {equipment.code}
                      </span>
                      <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight mt-0.5">
                        {equipment.name}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">
                        {equipment.subject} · {equipment.grade}
                      </p>
                    </div>
                  </div>

                  {/* Footer with storage location */}
                  <div className="border-t border-slate-200 pt-1 mt-1.5 flex items-center justify-between text-[9px] text-slate-600">
                    <span className="truncate max-w-[140px] font-medium">
                      {equipment.storageRoom}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {equipment.location || 'KHO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
