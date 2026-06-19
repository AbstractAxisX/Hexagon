import React from 'react';
import { BrickWall } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

const TextureTab = ({ onSelectTexture }) => {
  const textures = APP_CONFIG.textures || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BrickWall size={16} className="text-orange-500" />
          تکسچر و متریال
        </h3>
        <p className="text-xs text-slate-400 mt-1">یک بافت را انتخاب کن تا روی کاشی اعمال شود.</p>
      </div>

      {textures.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {textures.map(tex => (
            <button
              key={tex.id}
              onClick={() => onSelectTexture(tex.url)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-100 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <img src={tex.url} alt={tex.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-medium truncate block text-center">{tex.title}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center text-slate-300 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <BrickWall size={30} className="mb-2 opacity-50" />
          <span className="text-sm text-slate-400">تکسچری یافت نشد</span>
        </div>
      )}
    </div>
  );
};

export default TextureTab;