import React, { useEffect } from 'react';
import { Palette, X, Box, Ruler, Layers } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { APP_CONFIG } from '../../data/appConfig';

// ─── عکس placeholder برای متریال (از picsum، بعداً از API میاد) ───
const MATERIAL_IMAGES = {
  forex:      'https://picsum.photos/id/1060/400/300', // سطح سفید/روشن
  aluminum:   'https://picsum.photos/id/1070/400/300', // متالیک
  plexiglass: 'https://picsum.photos/id/1080/400/300', // شفاف/براق
};

const SettingsModal = () => {
  const isOpen        = useAppStore(s => s.isSettingsOpen);
  const setOpen       = useAppStore(s => s.setSettingsOpen);
  const wallColor     = useAppStore(s => s.wallColor);
  const setWallColor  = useAppStore(s => s.setWallColor);
  const globalSettings   = useAppStore(s => s.globalSettings);
  const setGlobalSetting = useAppStore(s => s.setGlobalSetting);
  const fetchPrice    = useAppStore(s => s.fetchPriceFromBackend);
  const tiles         = useAppStore(s => s.tiles);

  // ── هر بار که متریال یا سایز عوض میشه قیمت دوباره محاسبه بشه ──
  useEffect(() => {
    if (!isOpen || tiles.length === 0) return;
    fetchPrice();
  }, [globalSettings.material, globalSettings.size, isOpen]);

  if (!isOpen) return null;

  const colors = ['#f8fafc','#f1f5f9','#e2e8f0','#fee2e2','#dbeafe','#dcfce7','#1a1a1a'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative bg-white flex flex-col shadow-2xl overflow-hidden w-full rounded-t-2xl pb-safe md:w-[500px] md:rounded-2xl max-h-[90vh]">

        {/* هدر */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">تنظیمات طراحی</h2>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* اسکرول‌پذیر */}
        <div className="overflow-y-auto p-6 space-y-8">

          {/* ── ۱. متریال ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Layers size={18} />
              متریال
            </label>
            <div className="grid grid-cols-3 gap-3">
              {APP_CONFIG.materials.map(mat => {
                const isActive = globalSettings.material === mat.id;
                const imgUrl = MATERIAL_IMAGES[mat.id];
                return (
                  <button
                    key={mat.id}
                    onClick={() => setGlobalSetting('material', mat.id)}
                    className={`
                      relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-right
                      ${isActive
                        ? 'border-blue-500 shadow-md shadow-blue-100'
                        : 'border-slate-200 hover:border-slate-400'
                      }
                    `}
                  >
                    {/* عکس */}
                    <div className="w-full aspect-[4/3] bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={mat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {/* لیبل */}
                    <div className={`px-2 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-600'}`}>
                      {mat.name}
                    </div>
                    {/* تیک انتخاب */}
                    {isActive && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 10 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* ── ۲. گوشه‌ها ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Box size={18} />
              حالت گوشه‌ها
            </label>
            <div className="bg-slate-100 p-1.5 rounded-xl flex gap-2">
              {APP_CONFIG.corners.map(opt => {
                const isActive = globalSettings.corner === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGlobalSetting('corner', opt.id)}
                    className={`
                      flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center justify-center gap-2
                      ${isActive
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }
                    `}
                  >
                    <span className={`w-3 h-3 border-2 border-current ${opt.id === 'rounded' ? 'rounded-full' : 'rounded-none'}`} />
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* ── ۳. سایز ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Ruler size={18} />
              سایز کاشی‌ها
            </label>
            <div className="grid grid-cols-5 gap-2">
              {APP_CONFIG.sizes.map(opt => {
                const isActive = globalSettings.size === opt.id;
                const dims = opt.label.match(/\(([^)]+)\)/)?.[1] ?? '';
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGlobalSetting('size', opt.id)}
                    className={`
                      flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-sm transition-all duration-200
                      ${isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700'
                      }
                    `}
                  >
                    <span className="font-semibold text-base">{opt.id.toUpperCase()}</span>
                    {dims && <span className="text-[10px] mt-0.5 opacity-70 text-center leading-tight">{dims}</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2 px-1">تغییر سایز روی همه کاشی‌ها اعمال می‌شود.</p>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* ── ۴. رنگ پس‌زمینه ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Palette size={18} />
              رنگ پس‌زمینه بوم
            </label>
            <div className="grid grid-cols-7 gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setWallColor(color)}
                  className={`
                    w-10 h-10 rounded-full border border-slate-200 shadow-sm transition-all
                    ${wallColor === color ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-110 hover:shadow-md'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;