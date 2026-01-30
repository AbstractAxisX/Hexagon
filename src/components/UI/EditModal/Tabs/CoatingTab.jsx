import React from 'react';
import { Layers, Check } from 'lucide-react'; // آیکون Layers مناسب روکش است
import { APP_CONFIG } from '../../../../data/appConfig';

const CoatingTab = ({ activeCoatingId, onSelectCoating }) => {
  const coatings = APP_CONFIG.coatings || [];

  return (
    <div className="h-full flex flex-col">
      {/* هدر راهنما */}
      <div className="mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Layers size={16} className="text-purple-600"/>
          انتخاب روکش محافظ
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          روکش‌های ویژه به صورت یکپارچه روی سطح تایل اعمال می‌شوند.
        </p>
      </div>

      {/* لیست روکش‌ها */}
      <div className="grid grid-cols-2 gap-4">
        {coatings.map((coating) => {
          const isActive = activeCoatingId === coating.id;
          
          return (
            <button
              key={coating.id}
              onClick={() => onSelectCoating(coating)}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl border transition-all text-right group
                ${isActive 
                  ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' 
                  : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'
                }
              `}
            >
              {/* پیش‌نمایش دایره‌ای روکش */}
              <div 
                className="w-12 h-12 rounded-full border border-slate-200 shadow-sm shrink-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${coating.textureUrl})`,
                  backgroundColor: coating.previewColor 
                }}
              />
              
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${isActive ? 'text-purple-700' : 'text-slate-700'}`}>
                  {coating.name}
                </span>
                <span className="text-[10px] text-slate-400">
                   {coating.type === 'special' ? 'روکش ویژه' : 'استاندارد'}
                </span>
              </div>

              {/* نشانگر انتخاب */}
              {isActive && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white rounded-full p-0.5">
                  <Check size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoatingTab;