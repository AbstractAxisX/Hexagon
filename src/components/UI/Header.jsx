import React, { useState } from 'react';
import { Settings, Plus, Layout, Loader2, ShoppingCart, AlertCircle, Download, Check } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { exportDesignAsImage, downloadImage } from './exportCanvas';

const Header = () => {
  const addTile          = useAppStore(state => state.addTile);
  const setSettingsOpen  = useAppStore(state => state.setSettingsOpen);
  const totalPrice       = useAppStore(state => state.totalPrice);
  const isCalculating    = useAppStore(state => state.isCalculating);
  const tiles            = useAppStore(state => state.tiles);
  const fabricCanvas     = useAppStore(state => state.fabricCanvas);
  const wallColor        = useAppStore(state => state.wallColor);
  const isExporting      = useAppStore(state => state.isExporting);
  const exportError      = useAppStore(state => state.exportError);
  const addDesignToCart  = useAppStore(state => state.addDesignToCart);

  // وضعیت جدا برای دکمه‌ی دانلود مستقیم (مستقل از افزودن به سبد خرید)
  const [downloadState, setDownloadState] = useState('idle'); // idle | loading | done | error

  const formatted = new Intl.NumberFormat('fa-IR').format(totalPrice);

  // ── افزودن به سبد خرید (می‌بره صفحه CartPage) ──
  const handleAddToCart = async () => {
    if (tiles.length === 0 || isExporting) return;
    try {
      const dataUrl = await exportDesignAsImage(fabricCanvas, wallColor, { padding: 80, multiplier: 2 });
      await addDesignToCart(dataUrl);
    } catch (err) {
      console.error('خطا در افزودن به سبد خرید:', err);
    }
  };

  // ── دانلود مستقیم عکس (برای نشون دادن به کسی، بدون رفتن به سبد خرید) ──
  const handleDownload = async () => {
    if (tiles.length === 0 || downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      const dataUrl = await exportDesignAsImage(fabricCanvas, wallColor, { padding: 80, multiplier: 2 });
      downloadImage(dataUrl, `tile-design-${Date.now()}.png`);
      setDownloadState('done');
      setTimeout(() => setDownloadState('idle'), 1500);
    } catch (err) {
      console.error('خطا در دانلود:', err);
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 2000);
    }
  };

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
      <div className="flex items-center gap-2.5">

        {exportError && (
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle size={14} /> {exportError}
          </span>
        )}

        {/* دکمه دانلود مستقیم عکس */}
        <button
          onClick={handleDownload}
          disabled={tiles.length === 0 || downloadState === 'loading'}
          title="دانلود عکس طرح (برای نمایش به دیگران)"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${downloadState === 'done'
              ? 'bg-green-50 text-green-600'
              : downloadState === 'error'
                ? 'bg-red-50 text-red-500'
                : 'text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}
        >
          {downloadState === 'loading' ? (
            <Loader2 size={17} className="animate-spin" />
          ) : downloadState === 'done' ? (
            <Check size={17} />
          ) : (
            <Download size={17} />
          )}
          <span className="hidden lg:inline">
            {downloadState === 'loading' ? 'در حال آماده‌سازی...'
              : downloadState === 'done' ? 'دانلود شد'
              : 'دانلود عکس'}
          </span>
        </button>

        {/* دکمه افزودن به سبد خرید */}
        <button
          onClick={handleAddToCart}
          disabled={tiles.length === 0 || isExporting}
          title="افزودن طرح به سبد خرید"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>در حال آماده‌سازی...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>افزودن به سبد خرید</span>
            </>
          )}
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1" />

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