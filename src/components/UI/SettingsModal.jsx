import React, { useEffect } from 'react';
import { Palette, X, Box, Ruler, Layers } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { APP_CONFIG } from '../../data/appConfig';

// ─── عکس placeholder برای متریال ───
const MATERIAL_IMAGES = {
  forex:      'https://picsum.photos/id/1060/400/300',
  aluminum:   'https://picsum.photos/id/1070/400/300',
  plexiglass: 'https://picsum.photos/id/1080/400/300',
};

// پالت رنگ پس‌زمینه — مطابق مرجع (دسته‌بندی‌شده)
const WALL_COLORS = [
  '#FFFFFF', '#F5F5F5', '#F0E6D2', '#C5D0B3', '#8D8D6E',
  '#D3D3D3', '#B8B8B8', '#5A5A5A', '#222222', '#000000',
  '#E6D7D0', '#C8A2B8', '#D67D7D', '#B86B6B', '#FF6B6B',
  '#DBEAFE', '#93C5FD', '#3B82F6', '#1E3A8A', '#0F172A',
];

function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

const SettingsModal = () => {
  const isOpen            = useAppStore(s => s.isSettingsOpen);
  const setOpen           = useAppStore(s => s.setSettingsOpen);
  const wallColor         = useAppStore(s => s.wallColor);
  const setWallColor      = useAppStore(s => s.setWallColor);
  const globalSettings    = useAppStore(s => s.globalSettings);
  const setGlobalSetting  = useAppStore(s => s.setGlobalSetting);
  const fetchPrice        = useAppStore(s => s.fetchPriceFromBackend);
  const tiles             = useAppStore(s => s.tiles);

  useEffect(() => {
    if (!isOpen || tiles.length === 0) return;
    fetchPrice();
  }, [globalSettings.material, globalSettings.size, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* ═══════ مودال: سفید، گوشه تیز ═══════ */}
      <div className="relative bg-white flex flex-col overflow-hidden w-full max-w-[560px] max-h-[90vh]">

        {/* هدر */}
        <div className="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F5F5F5] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
            <h2 className="text-sm font-semibold text-[#1a1a1a]">تنظیمات طراحی</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-[#FF6B35] hover:bg-white transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        {/* اسکرول‌پذیر */}
        <div className="overflow-y-auto p-6 space-y-7">

          {/* ── ۱. متریال ── */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a] mb-3">
              <Layers size={16} className="text-[#666]" />
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
                      relative overflow-hidden border text-right transition-colors
                      ${isActive
                        ? 'border-[#FF6B35]'
                        : 'border-[#E0E0E0] hover:border-[#999]'
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
                    <div className={`px-2 py-1.5 text-xs font-medium transition-colors
                      ${isActive ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'bg-white text-[#666]'}`}>
                      {mat.name}
                    </div>
                    {/* نشان انتخاب — خط پایین نارنجی */}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#FF6B35]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-[#E0E0E0]" />

          {/* ── ۲. گوشه‌ها ── */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a] mb-3">
              <Box size={16} className="text-[#666]" />
              حالت گوشه‌ها
            </label>
            <div className="border border-[#E0E0E0] flex">
              {APP_CONFIG.corners.map((opt, idx) => {
                const isActive = globalSettings.corner === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGlobalSetting('corner', opt.id)}
                    className={`
                      flex-1 py-2.5 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2
                      ${idx > 0 ? 'border-r border-[#E0E0E0]' : ''}
                      ${isActive
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'text-[#666] hover:bg-[#F5F5F5]'
                      }
                    `}
                  >
                    <span className={`w-3 h-3 border-2 border-current ${opt.id === 'rounded' ? 'rounded-full' : ''}`} />
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-[#E0E0E0]" />

          {/* ── ۳. سایز ── */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a] mb-3">
              <Ruler size={16} className="text-[#666]" />
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
                      flex flex-col items-center justify-center py-3 px-2 border text-sm transition-colors
                      ${isActive
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-[#E0E0E0] bg-white text-[#666] hover:border-[#999] hover:text-[#333]'
                      }
                    `}
                  >
                    <span className="font-semibold text-base">{opt.id.toUpperCase()}</span>
                    {dims && <span className="text-[10px] mt-0.5 opacity-70 text-center leading-tight">{dims}</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#888] mt-2 px-1">تغییر سایز روی همه کاشی‌ها اعمال می‌شود.</p>
          </div>

          <div className="h-px bg-[#E0E0E0]" />

          {/* ── ۴. رنگ پس‌زمینه — گرید تخت، گوشه تیز ═════ */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a] mb-3">
              <Palette size={16} className="text-[#666]" />
              رنگ پس‌زمینه بوم
            </label>
            <div className="grid grid-cols-5 gap-2">
              {WALL_COLORS.map(color => {
                const active = wallColor?.toLowerCase() === color.toLowerCase();
                const light = isLightColor(color);
                return (
                  <button
                    key={color}
                    onClick={() => setWallColor(color)}
                    className={`
                      relative aspect-square flex items-center justify-center border transition-colors
                      ${active
                        ? 'border-[#FF6B35]'
                        : 'border-[#E0E0E0] hover:border-[#999]'}
                    `}
                    style={{ background: color }}
                    title={color}
                  >
                    {active && (
                      <span className={`text-xs font-bold ${light ? 'text-[#1a1a1a]' : 'text-white'}`}>✓</span>
                    )}
                    {/* خط پایین نارنجی برای انتخاب */}
                    {active && (
                      <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#FF6B35]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
