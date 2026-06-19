import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import useAppStore from '../../../../store/useAppStore';
import { TAILWIND_COLORS } from '../../../../data/tailwindColors';

const ColorTab = ({ tile }) => {
  const setTileColor = useAppStore(s => s.setTileColor);
  const currentColor = tile.content?.type === 'color' ? tile.content.data : null;
  const [query, setQuery] = useState('');

  const groups = Object.entries(TAILWIND_COLORS).filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  const isLight = (groupName, colorName) => {
    if (['White', 'Yellow', 'Amber'].includes(groupName)) return true;
    const shade = parseInt(colorName.split(' ')[1]);
    return shade < 300;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800 mb-1">پالت رنگی</h3>
        <p className="text-xs text-slate-400">انتخاب رنگ، تصویر فعلی کاشی را جایگزین می‌کند.</p>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="جستجوی طیف رنگ..."
          className="w-full pr-9 pl-3 py-2 bg-slate-100 rounded-xl text-sm outline-none border-2 border-transparent focus:border-blue-300 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {groups.map(([groupName, colors]) => (
          <div key={groupName}>
            <h4 className="text-[11px] font-bold text-slate-400 mb-2 sticky top-0 bg-white py-1">
              {groupName}
            </h4>
            <div className="grid grid-cols-8 gap-1.5">
              {colors.map(color => {
                const active = currentColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => setTileColor(tile.id, color.value)}
                    title={color.name}
                    style={{ backgroundColor: color.value }}
                    className={`
                      relative aspect-square rounded-lg border border-black/5 transition-all
                      hover:scale-110 hover:shadow-md
                      ${active ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : ''}
                    `}
                  >
                    {active && (
                      <Check
                        size={12}
                        className={`absolute inset-0 m-auto ${isLight(groupName, color.name) ? 'text-black' : 'text-white'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorTab;