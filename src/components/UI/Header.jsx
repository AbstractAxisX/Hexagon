import React from 'react';
import { Settings, Plus, Layout, Loader2 } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const Header = () => {
  const addTile = useAppStore(state => state.addTile);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const totalPrice = useAppStore(state => state.totalPrice);
  const isCalculating = useAppStore(state => state.isCalculating);
  const tiles = useAppStore(state => state.tiles);

  const formatted = new Intl.NumberFormat('fa-IR').format(totalPrice);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm relative shrink-0">

      {/* LOGO */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Layout size={20} />
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Modulari <span className="text-blue-600">Editor</span>
        </h1>
      </div>

      {/* CENTER: قیمت لحظه‌ای */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {tiles.length === 0 ? (
          <span className="text-sm text-slate-400">هنوز کاشی‌ای اضافه نشده</span>
        ) : isCalculating ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">در حال محاسبه...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-xl">
            <span className="text-sm text-slate-500">قیمت کل:</span>
            <span className="text-base font-bold text-blue-600 tabular-nums">{formatted}</span>
            <span className="text-xs text-slate-400">تومان</span>
          </div>
        )}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">تنظیمات</span>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1" />

        <button
          onClick={() => addTile()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>افزودن کاشی</span>
        </button>
      </div>
    </header>
  );
};

export default Header;