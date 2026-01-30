import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

const StockImagesTab = ({ onSelectImage }) => {
  const images = APP_CONFIG.stockImages || [];

  return (
    <div className="h-full flex flex-col">
      {/* هدر کوچک برای راهنمایی */}
      <div className="mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ImageIcon size={16} className="text-blue-500"/>
          انتخاب از گالری تصاویر
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          با انتخاب هر تصویر، به مرحله تنظیم ابعاد (کراپ) منتقل می‌شوید.
        </p>
      </div>

      {/* شبکه تصاویر (Grid) */}
      <div className="flex-1 overflow-y-auto pr-1">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => onSelectImage(img.url)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* افکت هاور متن */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-xs font-medium truncate block">
                    {img.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <ImageIcon size={32} className="mb-2 opacity-50"/>
            <span className="text-sm">تصویری در گالری موجود نیست</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockImagesTab;