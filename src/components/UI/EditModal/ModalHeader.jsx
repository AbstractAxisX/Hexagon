import React from 'react';
import { X, Hexagon, Circle, Square } from 'lucide-react';

const ModalHeader = ({ tile, onClose }) => {
  // جلوگیری از کرش اگر tile وجود نداشته باشد
  if (!tile) return null;

  const getIcon = () => {
    switch (tile.shape) {
      case 'hex': return <Hexagon size={20} className="text-blue-600" />;
      case 'circle': return <Circle size={20} className="text-blue-600" />;
      case 'square': return <Square size={20} className="text-blue-600" />;
      default: return <Hexagon size={20} className="text-blue-600" />;
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">ویرایش کاشی</h2>
          <p className="text-xs text-slate-500 font-mono">ID: {tile.id ? tile.id.slice(0, 8) : '---'}</p>
        </div>
      </div>
      
      <button 
        onClick={onClose}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default ModalHeader;