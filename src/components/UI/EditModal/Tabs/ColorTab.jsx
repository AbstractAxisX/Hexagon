import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import useAppStore from '../../../../store/useAppStore';
import { TAILWIND_COLORS } from '../../../../data/tailwindColors';

// آستانه روشنایی برای انتخاب رنگ متن روی سواچ
function isLightColor(hex) {
  if (!hex) return true;
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

const ColorTab = ({ tile }) => {
  const setTileColor  = useAppStore(s => s.setTileColor);
  const currentColor  = tile.content?.type === 'color' ? tile.content.data : null;
  const [query, setQuery] = useState('');

  const groups = Object.entries(TAILWIND_COLORS).filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">

      {/* ══ هدر + جستجو — وسط‌چین، حداکثر عرض ══ */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <h3 className="text-base font-bold text-[#1a1a1a] mb-1">رنگ کاشی</h3>
        <p className="text-xs text-[#888] mb-3">انتخاب رنگ، تصویر فعلی کاشی را جایگزین می‌کند.</p>

        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="جستجوی طیف رنگ..."
            className="w-full pr-9 pl-3 py-2 bg-[#F5F5F5] text-sm outline-none border border-[#E0E0E0]
                       focus:border-[#FF6B35] transition-colors placeholder:text-[#999] text-[#333]"
          />
        </div>
      </div>

      {/* ══ لیست دسته‌بندی‌ها — محدود به max-w-2xl ══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {groups.length === 0 && (
            <div className="text-center text-sm text-[#888] py-8">نتیجه‌ای یافت نشد</div>
          )}

          <div className="space-y-5">
            {groups.map(([groupName, colors]) => (
              <div key={groupName}>
                {/* عنوان دسته — بولد مشکی */}
                <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-2.5 sticky top-0 bg-white py-1 z-10">
                  {groupName}
                </h4>

                {/* گرید ۶ ستونه سواچ‌ها — فشرده‌تر، گوشه تیز */}
                <div className="grid grid-cols-6 gap-2">
                  {colors.map(color => {
                    const active = currentColor?.toLowerCase() === color.value?.toLowerCase();
                    const light = isLightColor(color.value);
                    return (
                      <button
                        key={color.value}
                        onClick={() => setTileColor(tile.id, color.value)}
                        title={color.name}
                        style={{ background: color.value }}
                        className={`
                          relative aspect-square flex items-center justify-center border transition-colors
                          ${active
                            ? 'border-[#FF6B35]'
                            : 'border-[#E0E0E0] hover:border-[#999]'}
                        `}
                      >
                        {active && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className={light ? 'text-[#1a1a1a]' : 'text-white'}
                          />
                        )}
                        {active && (
                          <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#FF6B35]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTab;
