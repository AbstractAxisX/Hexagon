import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// پالت رنگ پس‌زمینه دیوار — دسته‌بندی‌شده، مشابه مرجع
// ════════════════════════════════════════════════════════════
const WALL_COLOR_GROUPS = [
  {
    name: 'تک‌رنگ‌ها: خنثی',
    swatches: [
      { name: 'سفید',     value: '#FFFFFF' },
      { name: 'روشن',     value: '#F5F5F5' },
      { name: 'کرم',      value: '#F0E6D2' },
      { name: 'سبز مهره', value: '#C5D0B3' },
      { name: 'سایه',     value: '#8D8D6E' },
      { name: 'مویی',     value: '#D3D3D3' },
      { name: 'نقره‌ای',  value: '#B8B8B8' },
      { name: 'سرد',      value: '#5A5A5A' },
      { name: 'زغالی',    value: '#222222' },
      { name: 'جوهر',     value: '#000000' },
    ],
  },
  {
    name: 'قرمزها: گلی',
    swatches: [
      { name: 'گل‌بهی',        value: '#E6D7D0' },
      { name: 'صورتی نوزادی', value: '#C8A2B8' },
      { name: 'رز',            value: '#D67D7D' },
      { name: 'سرخابی',        value: '#B86B6B' },
      { name: 'آب‌نباتی',      value: '#FF6B6B' },
    ],
  },
  {
    name: 'آبی‌ها: اقیانوسی',
    swatches: [
      { name: 'آبی روشن',  value: '#DBEAFE' },
      { name: 'آبی آسمان', value: '#93C5FD' },
      { name: 'آبی',       value: '#3B82F6' },
      { name: 'سرمه‌ای',   value: '#1E3A8A' },
      { name: 'مشکی آبی',  value: '#0F172A' },
    ],
  },
  {
    name: 'سبزها: طبیعت',
    swatches: [
      { name: 'سبز شکفته', value: '#DCFCE7' },
      { name: 'سبز نعنا',  value: '#86EFAC' },
      { name: 'سبز',       value: '#22C55E' },
      { name: 'سبز جنگل', value: '#166534' },
      { name: 'زیتونی',    value: '#4D5D2C' },
    ],
  },
];

// آستانه روشنایی برای انتخاب رنگ متن (سیاه/سفید) روی هر سواچ
function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // luminance — فرمول perceived brightness
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

// ────────────────────────────────────────────────────────────
// کامپوننت اصلی
// ────────────────────────────────────────────────────────────
const BackgroundModal = ({ isOpen, onClose, currentColor, onSelect }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — مطابق مرجع: سفید، گوشه‌های تیز، بدون سایه */}
      <div className="
        relative bg-white flex flex-col overflow-hidden
        w-full max-w-[640px] max-h-[88dvh]
        md:max-h-[80vh]
      ">

        {/* ── نوار بالایی با دکمه بستن (مثل مرجع) ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-2">
            {/* نقطه نارنجی به‌عنوان اکسنت */}
            <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
            <span className="text-sm font-medium text-[#333]">رنگ پس‌زمینه دیوار</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-[#FF6B35] hover:bg-[#F5F5F5] transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── محتوای پالت رنگ ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {WALL_COLOR_GROUPS.map(group => (
            <div key={group.name}>
              {/* عنوان دسته — بولد مشکی، مثل مرجع */}
              <h3 className="text-base font-bold text-[#1a1a1a] mb-3">
                {group.name}
              </h3>

              {/* گرید ۵ ستونه سواچ‌ها — گوشه‌های تیز */}
              <div className="grid grid-cols-5 gap-3">
                {group.swatches.map(sw => {
                  const active = currentColor?.toLowerCase() === sw.value.toLowerCase();
                  const light = isLightColor(sw.value);
                  return (
                    <button
                      key={sw.value}
                      onClick={() => { onSelect(sw.value); onClose(); }}
                      className="group relative aspect-square flex flex-col items-center justify-center
                                 border border-[#E0E0E0] hover:border-[#FF6B35] transition-colors
                                 cursor-pointer overflow-hidden"
                      style={{ background: sw.value }}
                      title={sw.name}
                    >
                      {/* نام رنگ روی سواچ */}
                      <span
                        className={`text-[11px] font-medium px-1 leading-tight text-center
                          ${light ? 'text-[#333]' : 'text-white'}`}
                      >
                        {sw.name}
                      </span>

                      {/* نشان انتخاب — خط نارنجی پایین */}
                      {active && (
                        <span className="absolute bottom-0 inset-x-0 h-1 bg-[#FF6B35]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* فوتر کوچک */}
          <div className="pt-4 border-t border-[#E0E0E0] text-xs text-[#888] text-center">
            رنگ انتخاب‌شده روی بوم دیوار اعمال می‌شود
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundModal;
