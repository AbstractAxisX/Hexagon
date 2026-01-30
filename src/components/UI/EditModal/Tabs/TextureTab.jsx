import React from 'react';
import { BrickWall } from 'lucide-react'; // آیکون مناسب تکسچر
import { APP_CONFIG } from '../../../../data/appConfig';

const TextureTab = ({ onSelectTexture }) => {
  const textures = APP_CONFIG.textures || [];

  return (
    <div className="h-full flex flex-col">
      {/* هدر */}
      <div className="mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BrickWall size={16} className="text-orange-500"/>
          انتخاب تکسچر و متریال
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          یک بافت را انتخاب کنید تا روی تایل اعمال شود.
        </p>
      </div>

      {/* شبکه تکسچرها */}
      <div className="flex-1 overflow-y-auto pr-1">
        {textures.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {textures.map((tex) => (
              <button
                key={tex.id}
                onClick={() => onSelectTexture(tex.url)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-orange-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
              >
                <img
                  src={tex.url}
                  alt={tex.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* لیبل روی تکسچر */}
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-[10px] font-medium truncate block text-center">
                    {tex.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <BrickWall size={32} className="mb-2 opacity-50"/>
            <span className="text-sm">تکسچری یافت نشد</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextureTab;