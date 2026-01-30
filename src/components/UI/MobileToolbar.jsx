import React, { useState } from 'react';
import { Plus, Hexagon, Square, Circle, Settings, X, Pencil } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const MobileToolbar = () => {
  const addTile = useAppStore(state => state.addTile);
  const setGlobalSetting = useAppStore(state => state.setGlobalSetting);
  const globalSettings = useAppStore(state => state.globalSettings);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const openEditModal = useAppStore(state => state.openEditModal);
  
  // ✅ دسترسی به متد باز کردن تنظیمات
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  
  const [showShapes, setShowShapes] = useState(false);

  const handleShapeSelect = (shape) => {
    setGlobalSetting('shape', shape);
    setShowShapes(false);
  };

  return (
    <>
      {/* Shape Menu ... (بدون تغییر) */}
      {showShapes && (
        <div className="absolute bottom-20 left-0 w-full flex justify-center z-30 animate-in slide-in-from-bottom-5 fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex gap-4">
             {/* ... دکمه‌های انتخاب شکل ... */}
             <ShapeBtn active={globalSettings.shape === 'hex'} onClick={() => handleShapeSelect('hex')} icon={<Hexagon size={24} />} label="شش‌ضلعی" />
             <ShapeBtn active={globalSettings.shape === 'square'} onClick={() => handleShapeSelect('square')} icon={<Square size={24} />} label="مربع" />
             <ShapeBtn active={globalSettings.shape === 'circle'} onClick={() => handleShapeSelect('circle')} icon={<Circle size={24} />} label="دایره" />
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        
        {/* ✅ دکمه تنظیمات: حالا کار می‌کند */}
        <button 
          onClick={() => setSettingsOpen(true)}
          className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <Settings size={24} />
        </button>

        {/* Shape Toggle */}
        <button 
          onClick={() => setShowShapes(!showShapes)}
          className={`p-3 rounded-xl transition-all active:scale-95 ${showShapes ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
        >
          {showShapes ? <X size={28} /> : (
            globalSettings.shape === 'hex' ? <Hexagon size={28} /> :
            globalSettings.shape === 'square' ? <Square size={28} /> :
            <Circle size={28} />
          )}
        </button>

        {/* Add / Edit Action */}
        {focusedTileId ? (
          <button 
            onClick={() => openEditModal(focusedTileId)}
            className="bg-amber-500 text-white p-3 rounded-xl shadow-lg shadow-amber-200 active:scale-90 transition-transform"
          >
            <Pencil size={28} strokeWidth={2.5} />
          </button>
        ) : (
          <button 
            onClick={() => addTile()}
            className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-transform"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        )}

      </div>
    </>
  );
};

const ShapeBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon}
  </button>
);

export default MobileToolbar;