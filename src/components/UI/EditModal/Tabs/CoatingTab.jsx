import React from 'react';
import { Layers, Check, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../../../data/appConfig';

// ─── کارت روکش — فلت، فشرده، زیبا ════════════════════════════
// هر کارت:
//  ┌────────────────────┐
//  │ ▓▓▓▓  نام روکش    │
//  │ ▓▓▓▓  توضیح کوتاه │
//  │ ▓▓▓▓               │
//  └────────────────────┘
// پیش‌نمایش ۵۶ پیکسل مربع + متن کناری
// ──────────────────────────────────────────────────────────────
const CoatingCard = ({ coating, active, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(coating)}
      className={`
        group relative flex items-center gap-3 p-2.5 border text-right transition-colors
        ${active
          ? 'border-[#FF6B35] bg-[#FFF1EB]'
          : 'border-[#E0E0E0] bg-white hover:border-[#999] hover:bg-[#FAFAFA]'}
      `}
    >
      {/* پیش‌نمایش — مربع ۵۶ پیکسل، تصویر + رنگ پس‌زمینه fallback */}
      <div
        className="relative w-14 h-14 shrink-0 border border-[#E0E0E0] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:    coating.textureUrl ? `url(${coating.textureUrl})` : undefined,
          backgroundColor:    coating.previewColor || '#F5F5F5',
        }}
      >
        {/* اگه تصویر نبود، یه آیکون وسط نشون بده */}
        {!coating.textureUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={18} className="text-[#888]" />
          </div>
        )}

        {/* نشان انتخاب — گوشه چپ بالا، کوچیک */}
        {active && (
          <div className="absolute top-0 left-0 w-5 h-5 bg-[#FF6B35] flex items-center justify-center">
            <Check size={11} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>

      {/* متن — عنوان + توضیح کوتاه */}
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold leading-tight truncate
          ${active ? 'text-[#FF6B35]' : 'text-[#1a1a1a]'}`}>
          {coating.name}
        </div>
        <div className="text-[11px] text-[#888] mt-0.5 truncate">
          {coating.description || 'روکش محافظ ویژه'}
        </div>
        {/* نوار راهنمای قیمت/سختی — اگه موجود بود */}
        {(coating.hardness || coating.finish) && (
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#888]">
            {coating.hardness && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-[#999]" />
                {coating.hardness}
              </span>
            )}
            {coating.finish && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-[#999]" />
                {coating.finish}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

// ─── کامپوننت اصلی ═══════════════════════════════════════════
const CoatingTab = ({ activeCoatingId, onSelectCoating }) => {
  const coatings = APP_CONFIG.coatings || [];

  return (
    <div className="h-full flex flex-col">

      {/* ══ هدر تب — وسط‌چین، حداکثر عرض محدود ══ */}
      <div className="w-full max-w-2xl mx-auto mb-5">
        <h3 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
          <Layers size={16} className="text-[#FF6B35]" />
          روکش محافظ
        </h3>
        <p className="text-xs text-[#888] mt-1">
          روکش‌های ویژه یکپارچه روی سطح کاشی اعمال می‌شوند.
        </p>
      </div>

      {/* ══ لیست روکش‌ها — محدود به max-w-2xl ══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {coatings.length > 0 ? (
            // گرید ۲ ستونه فشرده — کارت‌ها کش نمیان
            <div className="grid grid-cols-2 gap-2.5">
              {coatings.map(coating => (
                <CoatingCard
                  key={coating.id}
                  coating={coating}
                  active={activeCoatingId === coating.id}
                  onSelect={onSelectCoating}
                />
              ))}
            </div>
          ) : (
            // حالت خالی
            <div className="h-44 flex flex-col items-center justify-center text-[#888] bg-[#F5F5F5] border border-dashed border-[#E0E0E0]">
              <Layers size={28} className="mb-2 opacity-50" />
              <span className="text-sm">روکشی موجود نیست</span>
            </div>
          )}
        </div>
      </div>

      {/* فوتر کوچک — توضیح */}
      <div className="w-full max-w-2xl mx-auto mt-4 pt-3 border-t border-[#E0E0E0]">
        <p className="text-[11px] text-[#888] text-center">
          روکش‌ها پس از چاپ روی سطح اعمال می‌شوند و در برابر خط و خش مقاوم‌ترند.
        </p>
      </div>
    </div>
  );
};

export default CoatingTab;
