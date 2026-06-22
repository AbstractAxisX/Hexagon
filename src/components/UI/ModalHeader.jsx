import React from 'react';
import { X, Hexagon, Circle, Square } from 'lucide-react';

// کامپوننت هدر مودال — مطابق سبک مرجع: سفید، گوشه تیز، حداقل
const ModalHeader = ({ tile, onClose }) => {
  if (!tile) return null;

  const getIcon = () => {
    switch (tile.shape) {
      case 'hex':    return <Hexagon size={18} className="text-[#FF6B35]" />;
      case 'circle': return <Circle  size={18} className="text-[#FF6B35]" />;
      case 'square': return <Square  size={18} className="text-[#FF6B35]" />;
      default:       return <Hexagon size={18} className="text-[#FF6B35]" />;
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0] bg-[#F5F5F5]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center border border-[#FF6B35]/30 bg-[#FF6B35]/10">
          {getIcon()}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a1a] leading-none">ویرایش کاشی</h2>
          <p className="text-[11px] text-[#888] mt-1 font-mono">
            ID: {tile.id ? tile.id.slice(0, 8) : '---'}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-9 h-9 flex items-center justify-center text-[#666]
                   hover:text-[#FF6B35] hover:bg-white transition-colors"
        aria-label="بستن"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ModalHeader;
