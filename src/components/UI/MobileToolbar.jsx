import React from 'react';
import { Plus, Settings, Pencil, Loader2 } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const MobileToolbar = () => {
  const addTile = useAppStore(state => state.addTile);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const openEditModal = useAppStore(state => state.openEditModal);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const totalPrice = useAppStore(state => state.totalPrice);
  const isCalculating = useAppStore(state => state.isCalculating);
  const tiles = useAppStore(state => state.tiles);

  const formatted = new Intl.NumberFormat('fa-IR').format(totalPrice);

  return (
    <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">

      {/* دکمه تنظیمات */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 active:scale-95 transition-transform"
      >
        <Settings size={24} />
      </button>

      {/* قیمت لحظه‌ای — وسط */}
      <div className="flex-1 flex justify-center">
        {tiles.length === 0 ? (
          <span className="text-xs text-slate-400">کاشی اضافه کن</span>
        ) : isCalculating ? (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">محاسبه...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-blue-600 tabular-nums">{formatted}</span>
            <span className="text-xs text-slate-400">تومان</span>
          </div>
        )}
      </div>

      {/* افزودن / ویرایش */}
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
  );
};

export default MobileToolbar;