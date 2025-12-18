import React from 'react';
import { Check } from 'lucide-react';
import useAppStore from '../../../../store/useAppStore';
import { TAILWIND_COLORS } from '../../../../data/tailwindColors';

const ColorTab = ({ tile }) => {
  const setTileColor = useAppStore(state => state.setTileColor);
  
  // تشخیص رنگ فعلی (اگر نوعش رنگ باشه)
  const currentColor = tile.content?.type === 'color' ? tile.content.data : null;

  const handleColorSelect = (colorValue) => {
    setTileColor(tile.id, colorValue);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-1">پالت رنگی</h3>
        <p className="text-xs text-slate-400">یک رنگ را برای پس‌زمینه انتخاب کنید. این کار تصویر فعلی را حذف می‌کند.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6 pb-10">
          {Object.entries(TAILWIND_COLORS).map(([groupName, colors]) => (
            <div key={groupName}>
              <h4 className="text-xs font-bold text-slate-400 mb-3 sticky top-0 bg-slate-50/95 py-2 backdrop-blur-sm z-10">
                طیف {groupName}
              </h4>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`
                      group relative w-full aspect-square rounded-lg shadow-sm border border-slate-200 
                      hover:scale-110 hover:shadow-md transition-all duration-200
                      ${currentColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {currentColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className={['White', 'Yellow', 'Amber'].includes(groupName) || parseInt(color.name.split(' ')[1]) < 300 ? "text-black" : "text-white"} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorTab;