import React from 'react';
import { Layers, Check } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

const CoatingTab = ({ activeCoatingId, onSelectCoating }) => {
  const coatings = APP_CONFIG.coatings || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers size={16} className="text-purple-600" />
          روکش محافظ
        </h3>
        <p className="text-xs text-slate-400 mt-1">روکش‌های ویژه یکپارچه روی سطح کاشی اعمال می‌شوند.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {coatings.map(coating => {
          const active = activeCoatingId === coating.id;
          return (
            <button
              key={coating.id}
              onClick={() => onSelectCoating(coating)}
              className={`
                relative flex items-center gap-3 p-3 rounded-2xl border-2 text-right transition-all
                ${active
                  ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-100'
                  : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'}
              `}
            >
              <div
                className="w-12 h-12 rounded-full border border-slate-200 shadow-sm shrink-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${coating.textureUrl})`, backgroundColor: coating.previewColor }}
              />
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-semibold truncate ${active ? 'text-purple-700' : 'text-slate-700'}`}>
                  {coating.name}
                </span>
                <span className="text-[10px] text-slate-400">روکش ویژه</span>
              </div>
              {active && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white rounded-full p-0.5">
                  <Check size={11} />
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