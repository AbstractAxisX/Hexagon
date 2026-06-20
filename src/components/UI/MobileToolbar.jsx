import React, { useState } from 'react';
import { Plus, Settings, Pencil, Loader2, ShoppingCart } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { exportDesignAsImage } from './exportCanvas';

const MobileToolbar = () => {
  const addTile          = useAppStore(state => state.addTile);
  const focusedTileId    = useAppStore(state => state.focusedTileId);
  const openEditModal    = useAppStore(state => state.openEditModal);
  const setSettingsOpen  = useAppStore(state => state.setSettingsOpen);
  const totalPrice       = useAppStore(state => state.totalPrice);
  const isCalculating    = useAppStore(state => state.isCalculating);
  const tiles            = useAppStore(state => state.tiles);
  const fabricCanvas     = useAppStore(state => state.fabricCanvas);
  const wallColor        = useAppStore(state => state.wallColor);
  const isExporting      = useAppStore(state => state.isExporting);
  const addDesignToCart  = useAppStore(state => state.addDesignToCart);

  const formatted = new Intl.NumberFormat('fa-IR').format(totalPrice);

  const handleAddToCart = async () => {
    if (tiles.length === 0 || isExporting) return;
    try {
      const dataUrl = await exportDesignAsImage(fabricCanvas, wallColor, { padding: 80, multiplier: 2 });
      await addDesignToCart(dataUrl);
    } catch (err) {
      console.error('خطا در افزودن به سبد خرید:', err);
    }
  };

  return (
    <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">

      {/* دکمه تنظیمات */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 active:scale-95 transition-transform"
      >
        <Settings size={22} />
      </button>

      {/* آیکون سبد خرید کوچک */}
      <button
        onClick={handleAddToCart}
        disabled={tiles.length === 0 || isExporting}
        className="relative p-3 rounded-xl text-emerald-600 hover:bg-emerald-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="افزودن به سبد خرید"
      >
        {isExporting ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <>
            <ShoppingCart size={22} />
            {tiles.length > 0 && (
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </>
        )}
      </button>

      {/* قیمت لحظه‌ای — وسط */}
      <div className="flex-1 flex justify-center px-1">
        {tiles.length === 0 ? (
          <span className="text-[11px] text-slate-400">کاشی اضافه کن</span>
        ) : isCalculating ? (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Loader2 size={13} className="animate-spin" />
            <span className="text-[11px]">محاسبه...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-blue-600 tabular-nums">{formatted}</span>
            <span className="text-[10px] text-slate-400">تومان</span>
          </div>
        )}
      </div>

      {/* افزودن / ویرایش */}
      {focusedTileId ? (
        <button
          onClick={() => openEditModal(focusedTileId)}
          className="bg-amber-500 text-white p-3 rounded-xl shadow-lg shadow-amber-200 active:scale-90 transition-transform"
        >
          <Pencil size={26} strokeWidth={2.5} />
        </button>
      ) : (
        <button
          onClick={() => addTile()}
          className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-transform"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      )}

    </div>
  );
};

export default MobileToolbar;