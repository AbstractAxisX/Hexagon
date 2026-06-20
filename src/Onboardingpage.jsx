// ============================================================
// OnboardingPage.jsx — صفحه انتخاب اولیه (پیش از ادیتور)
// سکشن اول: فرم کلاسیک راست + پنجره پیش‌نمایش چپ
// + دکمه «ادامه طراحی» اگر طرح ذخیره‌شده در localStorage باشد
// ============================================================
import React, { useState, useEffect } from 'react';
import { createSession, ApiError } from './services/mockApi';
import { APP_CONFIG } from './data/appConfig';
import useAppStore from './store/useAppStore';
import { hasSavedDesign } from './utils/persistDesign';
import { Check, Loader2, RotateCcw } from 'lucide-react';

const MATERIAL_TEXTURE = {
  forex:      'https://picsum.photos/id/1060/700/700',
  aluminum:   'https://picsum.photos/id/1070/700/700',
  plexiglass: 'https://picsum.photos/id/1080/700/700',
};

const SHAPE_CLIP = {
  hex:    'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  square: 'none',
  circle: 'circle(50% at 50% 50%)',
};

export default function OnboardingPage({ onDone }) {
  const setGlobalSetting = useAppStore(s => s.setGlobalSetting);
  const loadSavedDesign  = useAppStore(s => s.loadSavedDesign);

  const [selections, setSelections] = useState({
    shape: 'hex', size: 'm', material: 'forex', corner: 'sharp',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [canContinue, setCanContinue] = useState(false);

  // چک کردن localStorage فقط یه بار، موقع لود صفحه
  useEffect(() => {
    setCanContinue(hasSavedDesign());
  }, []);

  const pick = (key, value) => setSelections(p => ({ ...p, [key]: value }));

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const { settings } = await createSession(selections);
      Object.entries(settings).forEach(([k, v]) => setGlobalSetting(k, v));
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطای غیرمنتظره. دوباره تلاش کن.');
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    const loaded = loadSavedDesign();
    if (loaded) onDone();
  }

  return (
    // صفحه آزاد، بدون هیچ قفلی روی اسکرول
    <div dir="rtl" className="bg-white font-[Vazirmatn]">

      {/* ══════════ سکشن اول: فرم + پیش‌نمایش ══════════ */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── راست: فرم کلاسیک ── */}
          <div className="order-1">
            <p className="text-sm font-bold text-red-600 mb-2">پیکربندی محصول</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">کاشی‌های دیواری بساز</h1>
            <p className="text-base text-slate-500 mb-8">شکل، سایز و متریال را انتخاب کن.</p>

            {/* ── نوار «طرح ذخیره‌شده داری» ── */}
            {canContinue && (
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition-colors mb-8"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <RotateCcw size={16} className="text-blue-600" />
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-bold text-blue-700">ادامه طراحی قبلی</span>
                    <span className="block text-xs text-blue-500/70">یک طرح ذخیره‌شده روی این دستگاه پیدا شد</span>
                  </span>
                </span>
              </button>
            )}

            <form onSubmit={e => { e.preventDefault(); handleStart(); }} className="space-y-6">

              {/* شکل */}
              <FormField label="شکل کاشی">
                <select
                  value={selections.shape}
                  onChange={e => pick('shape', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-base text-slate-800 bg-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {APP_CONFIG.shapes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </FormField>

              {/* سایز */}
              <FormField label="سایز">
                <select
                  value={selections.size}
                  onChange={e => pick('size', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-base text-slate-800 bg-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {APP_CONFIG.sizes.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </FormField>

              {/* متریال — رادیو کارت ساده */}
              <FormField label="متریال">
                <div className="grid grid-cols-3 gap-3">
                  {APP_CONFIG.materials.map(m => {
                    const active = selections.material === m.id;
                    return (
                      <label key={m.id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                          ${active ? 'border-red-500 bg-red-50/50 ring-1 ring-red-200' : 'border-slate-300 hover:border-slate-400'}`}>
                        <input
                          type="radio" name="material" className="sr-only"
                          checked={active}
                          onChange={() => pick('material', m.id)}
                        />
                        <div className="w-12 h-12 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${MATERIAL_TEXTURE[m.id]})`,
                            clipPath: SHAPE_CLIP.hex,
                          }} />
                        <span className={`text-xs font-medium text-center ${active ? 'text-red-600' : 'text-slate-600'}`}>{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </FormField>

              {/* گوشه — رادیو ساده */}
              <FormField label="گوشه‌ها">
                <div className="flex gap-3">
                  {APP_CONFIG.corners.map(c => {
                    const active = selections.corner === c.id;
                    return (
                      <label key={c.id}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all
                          ${active ? 'border-red-500 bg-red-50/50 ring-1 ring-red-200 text-red-600' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        <input
                          type="radio" name="corner" className="sr-only"
                          checked={active}
                          onChange={() => pick('corner', c.id)}
                        />
                        {active && <Check size={15} />}
                        <span className="text-sm font-medium">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </FormField>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

              {/* ── دکمه‌های اقدام: شروع (+ ادامه کنارش اگر طرح داشت) ── */}
              <div className={`grid gap-3 ${canContinue ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-base shadow-md disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> در حال آماده‌سازی...</>
                    : 'شروع طراحی جدید'}
                </button>

                {canContinue && (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-bold text-base hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={17} /> ادامه طراحی
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── چپ: پنجره پیش‌نمایش ── */}
          <div className="order-2">
            <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-[#10131c] aspect-square lg:aspect-auto lg:h-[520px] flex items-center justify-center relative">
              <BacklitPreview selections={selections} />
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">پیش‌نمایش زنده — با تغییر گزینه‌ها آپدیت می‌شود</p>
          </div>

        </div>
      </section>

      {/* ══════════ این‌جا سکشن‌های بعدی رو اضافه کن ══════════ */}

    </div>
  );
}

// ════════════════════════════════════════════════════════════
function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function BacklitPreview({ selections }) {
  const { shape, material, corner, size } = selections;
  const texture = MATERIAL_TEXTURE[material];
  const sizeScale = { xs: 0.62, s: 0.76, m: 0.9, l: 1.04, xl: 1.18 }[size] ?? 0.9;
  const radius = corner === 'rounded' ? '16px' : '2px';
  const clip = shape === 'square' ? 'none' : SHAPE_CLIP[shape];

  const tiles = [
    { x: 0,   y: 0,   scale: 1.2,  z: 3 },
    { x: -95, y: -55, scale: 0.85, z: 2 },
    { x: 95,  y: 50,  scale: 0.9,  z: 1 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] rounded-full bg-white/[0.07] blur-[90px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative w-[260px] h-[260px]">
        {tiles.map((t, i) => {
          const s = sizeScale * t.scale;
          const baseSize = 120;
          return (
            <div key={i}
              className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out"
              style={{
                width: baseSize * s,
                height: baseSize * s,
                transform: `translate(calc(-50% + ${t.x * sizeScale}px), calc(-50% + ${t.y * sizeScale}px))`,
                zIndex: t.z,
              }}
            >
              <div className="absolute inset-[-26%] rounded-full bg-white/[0.10] blur-xl -z-10" />
              <div
                className="w-full h-full bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${texture})`,
                  clipPath: clip,
                  borderRadius: shape === 'square' ? radius : 0,
                  boxShadow: '0 18px 36px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <div className="absolute inset-0 opacity-30"
                  style={{
                    clipPath: clip,
                    borderRadius: shape === 'square' ? radius : 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 35%)',
                  }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}