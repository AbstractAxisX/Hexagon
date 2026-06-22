import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

/**
 * StockImagesTab — گالری ساده
 * کلیک روی عکس → onSelectImage(url) → میره به تب آپلود با externalImageSrc
 * (اونجا با cropper crop می‌شه)
 */
const StockImagesTab = ({ onSelectImage }) => {
  const images = APP_CONFIG.stockImages || [];

  return (
    <div className="h-full flex flex-col">

      {/* هدر */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <h3 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
          <ImageIcon size={16} className="text-[#FF6B35]" />
          گالری تصاویر
        </h3>
        <p className="text-xs text-[#888] mt-1">
          یک تصویر را انتخاب کن تا وارد کراپر بشی. بعدش می‌تونی crop و تنظیم کنی.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2.5">
              {images.map(img => (
                <button
                  key={img.id}
                  onClick={() => onSelectImage(img.url)}
                  className="group relative aspect-square overflow-hidden border border-[#E0E0E0] bg-[#F5F5F5]
                             hover:border-[#FF6B35] transition-colors focus:outline-none focus:border-[#FF6B35]"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* لیبل روی هاور */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/65 backdrop-blur-sm p-1.5
                                  opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-medium truncate block text-center">
                      {img.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-[#888] bg-[#F5F5F5] border border-dashed border-[#E0E0E0]">
              <ImageIcon size={28} className="mb-2 opacity-50" />
              <span className="text-sm">تصویری در گالری موجود نیست</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockImagesTab;
