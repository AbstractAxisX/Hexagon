import React, { useState } from 'react';
import {
  Plus, Loader2, ShoppingCart, AlertCircle,
  Download, Check, ChevronDown, Save, Hexagon, Settings as SettingsIcon,
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { exportDesignAsImage, downloadImage } from './exportCanvas';
import BackgroundModal from './BackgroundModal';
import { APP_CONFIG } from '../../data/appConfig';

// ─── تبدیل id به label فارسی ────────────────────────
const getLabel = (configKey, id) => {
  const list = APP_CONFIG[configKey] || [];
  return list.find(item => item.id === id)?.name
      ?? list.find(item => item.id === id)?.label
      ?? id;
};

const Header = () => {
  const addTile          = useAppStore(state => state.addTile);
  const setSettingsOpen  = useAppStore(state => state.setSettingsOpen);
  const totalPrice       = useAppStore(state => state.totalPrice);
  const isCalculating    = useAppStore(state => state.isCalculating);
  const tiles            = useAppStore(state => state.tiles);
  const fabricCanvas     = useAppStore(state => state.fabricCanvas);
  const wallColor        = useAppStore(state => state.wallColor);
  const setWallColor     = useAppStore(state => state.setWallColor);
  const isExporting      = useAppStore(state => state.isExporting);
  const exportError      = useAppStore(state => state.exportError);
  const addDesignToCart  = useAppStore(state => state.addDesignToCart);
  const globalSettings   = useAppStore(state => state.globalSettings);

  const [downloadState, setDownloadState] = useState('idle');
  const [bgOpen, setBgOpen] = useState(false);

  const formatted = new Intl.NumberFormat('fa-IR').format(totalPrice);

  // ── جزئیات طرح از globalSettings ──
  const shapeLabel    = getLabel('shapes',    globalSettings.shape);
  const materialLabel = getLabel('materials', globalSettings.material);
  const sizeLabel     = getLabel('sizes',     globalSettings.size);
  const cornerLabel   = getLabel('corners',   globalSettings.corner);

  // ── افزودن به سبد خرید ──
  const handleAddToCart = async () => {
    if (tiles.length === 0 || isExporting) return;
    try {
      const dataUrl = await exportDesignAsImage(fabricCanvas, wallColor, { padding: 80, multiplier: 2 });
      await addDesignToCart(dataUrl);
    } catch (err) {
      console.error('خطا در افزودن به سبد خرید:', err);
    }
  };

  // ── دانلود مستقیم عکس ──
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

  // ── ذخیره طرح ──
  const handleSaveDesign = () => {
    if (tiles.length === 0) return;
    handleDownload();
  };

  // ── آیتم جزئیات طرح ──
  const DetailItem = ({ label, value }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-400">{label}:</span>
      <span className="text-xs font-medium text-slate-700">{value}</span>
    </div>
  );

  return (
    <>
      <header className="bg-white relative z-20 shrink-0 shadow-sm select-none">

        {/* ═══════ ردیف اول (Top Bar) ═══════ */}
        <div className="h-14 flex items-center justify-between px-6 relative">

          {/* LOGO — فقط آیکون نارنجی، بدون متن */}
          <div className="flex items-center">
            <Hexagon
              size={26}
              className="text-[#FF6B35]"
              fill="currentColor"
              stroke="none"
            />
          </div>

          {/* CENTER: جزئیات طرح (شکل · سایز · متریال · گوشه) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" dir='rtl'>
            {tiles.length === 0 ? (
              <span className="text-sm text-slate-400">طرح خالی است — اولین کاشی را اضافه کنید</span>
            ) : isCalculating ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">در حال محاسبه...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-200">
                <DetailItem label="شکل"   value={shapeLabel} />
                <span className="w-px h-3 bg-slate-200" />
                <DetailItem label="سایز"   value={sizeLabel} />
                <span className="w-px h-3 bg-slate-200" />
                <DetailItem label="متریال" value={materialLabel} />
                <span className="w-px h-3 bg-slate-200" />
                <DetailItem label="گوشه"   value={cornerLabel} />
                <span className="w-px h-3 bg-slate-200" />
                <DetailItem label="تعداد"  value={`${tiles.length} عدد`} />
              </div>
            )}
          </div>

          {/* RIGHT: قیمت + سبد خرید */}
          <div className="flex items-center gap-3">

            {exportError && (
              <span className="flex items-center gap-1.5 text-xs text-red-500" title={exportError}>
                <AlertCircle size={14} /> خطا
              </span>
            )}

            {tiles.length > 0 && !isCalculating && (
              <div className="flex items-baseline gap-1.5 px-2">
                <span className="text-base font-bold text-slate-800 tabular-nums">{formatted}</span>
                <span className="text-xs text-slate-400">تومان</span>
              </div>
            )}

            {/* دکمه نارنجی «افزودن به سبد» */}
            <button
              onClick={handleAddToCart}
              disabled={tiles.length === 0 || isExporting}
              className="flex items-center gap-2 px-4 h-10 text-sm font-semibold
                         bg-[#FF6B35] text-white hover:bg-[#E55A2B]
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
              <span>افزودن به سبد</span>
            </button>
          </div>
        </div>

        {/* خط جداکننده نازک */}
        <div className="h-px bg-slate-200" />

        {/* ═══════ ردیف دوم (Secondary Menu) ═══════ */}
        <div className="h-11 flex items-center justify-between px-6">

          {/* LEFT: منوی فرعی */}
          <div className="flex items-center gap-1">

            {/* ── پس‌زمینه (باز کردن مودال رنگ) ── */}
            <button
              onClick={() => setBgOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span
                className="w-3.5 h-3.5 border border-slate-300"
                style={{ background: wallColor }}
              />
              <span>پس‌زمینه</span>
              <ChevronDown size={14} className="text-[#FF6B35]" />
            </button>

            {/* ── تنظیمات ── */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <SettingsIcon size={14} className="text-slate-500" />
              <span>تنظیمات</span>
              <ChevronDown size={14} className="text-[#FF6B35]" />
            </button>

            {/* ── ذخیره طرح ── */}
            <button
              onClick={handleSaveDesign}
              disabled={tiles.length === 0 || downloadState === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={14} className="text-slate-500" />
              <span>ذخیره طرح</span>
            </button>
          </div>

          {/* RIGHT: افزودن کاشی + دانلود */}
          <div className="flex items-center gap-2">

            <button
              onClick={handleDownload}
              disabled={tiles.length === 0 || downloadState === 'loading'}
              title="دانلود عکس طرح"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors
                ${downloadState === 'done'
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : downloadState === 'error'
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'text-slate-600 hover:bg-slate-50 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {downloadState === 'loading' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : downloadState === 'done' ? (
                <Check size={14} />
              ) : (
                <Download size={14} />
              )}
              <span>
                {downloadState === 'loading' ? '...'
                  : downloadState === 'done' ? 'دانلود شد'
                  : 'دانلود عکس'}
              </span>
            </button>

            <button
              onClick={() => addTile()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                         bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <Plus size={14} />
              <span>افزودن کاشی</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═════ مودال رنگ پس‌زمینه ═════ */}
      <BackgroundModal
        isOpen={bgOpen}
        onClose={() => setBgOpen(false)}
        currentColor={wallColor}
        onSelect={(c) => setWallColor(c)}
      />
    </>
  );
};

export default Header;
