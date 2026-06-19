import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

const StockImagesTab = ({ onSelectImage }) => {
  const images = APP_CONFIG.stockImages || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon size={16} className="text-blue-500" />
          گالری تصاویر
        </h3>
        <p className="text-xs text-slate-400 mt-1">یک تصویر را انتخاب کن، بعد ابعادش را تنظیم می‌کنیم.</p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {images.map(img => (
            <button
              key={img.id}
              onClick={() => onSelectImage(img.url)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img src={img.url} alt={img.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[11px] font-medium truncate block">{img.title}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={ImageIcon} text="تصویری در گالری موجود نیست" />
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="h-44 flex flex-col items-center justify-center text-slate-300 bg-slate-50 rounded-xl border border-dashed border-slate-200">
    <Icon size={30} className="mb-2 opacity-50" />
    <span className="text-sm text-slate-400">{text}</span>
  </div>
);

export default StockImagesTab;