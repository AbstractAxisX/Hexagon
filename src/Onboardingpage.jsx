// ============================================================
// OnboardingPage.jsx — صفحه انتخاب اولیه (پیش از ادیتور)
// طراحی مجدد کامل: هویت بصری «کاشی نوری» + اسکرول سالم + قابل گسترش
// ============================================================
import React, { useState } from 'react';
import { Check, Loader2, Sun, Moon, Magnet, RefreshCw, LayoutGrid, ChevronDown } from 'lucide-react';

// ── توکن‌های طراحی ──────────────────────────────────────────
// همه‌ی رنگ‌ها به‌صورت inline style اعمال می‌شن، نه کلاس‌های دلخواه
// تیلویند، چون این محیط کامپایلر JIT نداره و فقط کلاس‌های پایه
// از پیش ساخته‌شده رو می‌شناسه.
const C = {
  bgDeep: '#15110D',
  bgPanel: '#1D1812',
  paper: '#FBF7F1',
  paperDim: '#F1E8D9',
  ink: '#1C1611',
  inkSoft: '#56493B',
  muted: '#9C8E7B',
  line: '#E7DCC8',
  amber: '#FF8A3D',
  amberDeep: '#D85F1B',
  amberSoft: '#FFD9AE',
  white: '#FFFFFF',
};
const FONT_DISPLAY = "'Noto Naskh Arabic', serif";
const FONT_BODY = "'Vazirmatn', sans-serif";

const SHAPES = [
  { id: 'hex', name: 'شش‌ضلعی' },
  { id: 'square', name: 'مربع' },
  { id: 'circle', name: 'دایره' },
];
const SIZES = [
  { id: 'xs', label: '۱۵ × ۱۵', scale: 0.6 },
  { id: 's', label: '۲۰ × ۲۰', scale: 0.74 },
  { id: 'm', label: '۲۵ × ۲۵', scale: 0.9 },
  { id: 'l', label: '۳۰ × ۳۰', scale: 1.04 },
  { id: 'xl', label: '۴۰ × ۴۰', scale: 1.2 },
];
const MATERIALS = [
  { id: 'forex', name: 'فورکس', desc: 'مات، سبک و اقتصادی — انتخاب اول اکثر مشتری‌ها', texture: 'https://picsum.photos/id/1060/700/700' },
  { id: 'aluminum', name: 'آلومینیوم', desc: 'فلزی، مدرن و فوق بادوام', texture: 'https://picsum.photos/id/1070/700/700' },
  { id: 'plexiglass', name: 'پلکسی‌گلاس', desc: 'شفاف، براق با عمق بصری لوکس', texture: 'https://picsum.photos/id/1080/700/700' },
];
const CORNERS = [
  { id: 'sharp', name: 'تیز' },
  { id: 'rounded', name: 'گرد' },
];
const SHAPE_CLIP = {
  hex: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  square: 'none',
  circle: 'circle(50% at 50% 50%)',
};
const STEPS = [
  { id: 'shape', title: 'شکل کاشی' },
  { id: 'size', title: 'سایز' },
  { id: 'material', title: 'متریال' },
  { id: 'corner', title: 'گوشه‌ها' },
];

function fakeCreateSession(selections) {
  return new Promise(resolve => setTimeout(() => resolve({ ok: true, selections }), 850));
}

export default function OnboardingPage({ onDone = () => {} }) {
  const [selections, setSelections] = useState({ shape: 'hex', size: 'm', material: 'forex', corner: 'sharp' });
  const [activeStep, setActiveStep] = useState('shape');
  const [lightOn, setLightOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const pick = (stepId, value) => {
    setSelections(p => ({ ...p, [stepId]: value }));
    const idx = STEPS.findIndex(s => s.id === stepId);
    setActiveStep(STEPS[idx + 1]?.id ?? null);
  };

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      await fakeCreateSession(selections);
      setDone(true);
      onDone(selections);
    } catch {
      setError('یه خطای غیرمنتظره پیش اومد. دوباره امتحان کن.');
    } finally {
      setLoading(false);
    }
  }

  const sizeObj = SIZES.find(s => s.id === selections.size);
  const matObj = MATERIALS.find(m => m.id === selections.material);
  const cornerObj = CORNERS.find(c => c.id === selections.corner);

  return (
    <div dir="rtl" style={{ background: C.paper, fontFamily: FONT_BODY, width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500;700&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap');
        *:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
        @keyframes obp-drift { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
        @keyframes obp-flicker { 0%,100%{ opacity: 1 } 92%{ opacity: 1 } 93%{ opacity: 0.55 } 94%{ opacity: 1 } }
      `}</style>

      {/* ═══════════ سکشن ۱: کانفیگوریتور ═══════════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', width: '100%' }} className="lg:grid-cols-2">

        {/* پنل پیش‌نمایش — موبایل بالا، دسکتاپ چپ */}
        <div className="order-1 lg:order-2" style={{ position: 'relative', minHeight: 520, background: C.bgDeep, overflow: 'hidden' }}>
          <div className="lg:sticky" style={{ top: 0, width: '100%', minHeight: 520 }}>
            <LightboxPreview selections={selections} lightOn={lightOn} onToggleLight={() => setLightOn(v => !v)} sizeScale={sizeObj?.scale ?? 0.9} />
          </div>
        </div>

        {/* پنل ساخت — موبایل پایین، دسکتاپ راست */}
        <div className="order-2 lg:order-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="px-6 sm:px-12 lg:px-16 xl:px-20 py-14 lg:py-20">
            <div className="max-w-xl mx-auto lg:mx-0">

              <div
                className="inline-flex items-center gap-2 mb-5"
                style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: C.amberDeep, textTransform: 'uppercase' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: C.amber, display: 'inline-block' }} />
                کاشی نوری — مرحله ساخت
              </div>

              <h1 className="mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.25, color: C.ink }}>
                نور را به دیوار دعوت کن
              </h1>
              <p className="mb-12" style={{ fontSize: 18, color: C.inkSoft, lineHeight: 1.9 }}>
                شکل، سایز و متریال رو انتخاب کن — همین‌جا، کنار دستت، ببین وقتی روشنش می‌کنی چه شکلی می‌شه.
              </p>

              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <StepCard
                    key={step.id}
                    index={i}
                    isLast={i === STEPS.length - 1}
                    title={step.title}
                    summary={
                      step.id === 'shape' ? SHAPES.find(s => s.id === selections.shape)?.name :
                      step.id === 'size' ? `${sizeObj?.label} سانت` :
                      step.id === 'material' ? matObj?.name :
                      cornerObj?.name
                    }
                    open={activeStep === step.id}
                    onToggle={() => setActiveStep(p => (p === step.id ? null : step.id))}
                  >
                    {step.id === 'shape' && (
                      <div className="grid grid-cols-3 gap-3">
                        {SHAPES.map(s => (
                          <OptionTile key={s.id} active={selections.shape === s.id} onClick={() => pick('shape', s.id)}>
                            <span
                              style={{
                                width: 44, height: 44, display: 'block',
                                background: selections.shape === s.id ? C.amber : C.ink,
                                clipPath: SHAPE_CLIP[s.id],
                                borderRadius: s.id === 'square' ? 8 : 0,
                              }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 700, color: selections.shape === s.id ? C.amberDeep : C.inkSoft }}>{s.name}</span>
                          </OptionTile>
                        ))}
                      </div>
                    )}

                    {step.id === 'size' && (
                      <div className="space-y-2.5">
                        {SIZES.map(s => {
                          const active = selections.size === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => pick('size', s.id)}
                              className="w-full flex items-center justify-between px-5 py-4 transition-all"
                              style={{
                                borderRadius: 16,
                                border: `2px solid ${active ? C.amber : C.line}`,
                                background: active ? C.amberSoft + '55' : C.paper,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 16, fontWeight: 700, color: active ? C.amberDeep : C.inkSoft }}>{s.label} سانت</span>
                              {active && <Check size={18} style={{ color: C.amberDeep }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step.id === 'material' && (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          {MATERIALS.map(m => (
                            <OptionTile key={m.id} active={selections.material === m.id} onClick={() => pick('material', m.id)}>
                              <div
                                style={{
                                  width: 56, height: 56, backgroundImage: `url(${m.texture})`,
                                  backgroundSize: 'cover', backgroundPosition: 'center',
                                  clipPath: SHAPE_CLIP.hex,
                                  filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))',
                                }}
                              />
                              <span style={{ fontSize: 13, fontWeight: 700, color: selections.material === m.id ? C.amberDeep : C.inkSoft }}>{m.name}</span>
                            </OptionTile>
                          ))}
                        </div>
                        <p className="mt-4" style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{matObj?.desc}</p>
                      </>
                    )}

                    {step.id === 'corner' && (
                      <div className="grid grid-cols-2 gap-3">
                        {CORNERS.map(c => {
                          const active = selections.corner === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => pick('corner', c.id)}
                              className="flex items-center justify-center gap-3 py-5 transition-all"
                              style={{
                                borderRadius: 16,
                                border: `2px solid ${active ? C.amber : C.line}`,
                                background: active ? C.amberSoft + '55' : C.paper,
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  width: 18, height: 18,
                                  border: `3px solid ${active ? C.amberDeep : C.muted}`,
                                  borderRadius: c.id === 'rounded' ? 6 : 1,
                                }}
                              />
                              <span style={{ fontSize: 16, fontWeight: 700, color: active ? C.amberDeep : C.inkSoft }}>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </StepCard>
                ))}
              </div>

              {error && (
                <p className="mt-5 px-5 py-4" style={{ fontSize: 15, color: '#B3261E', background: '#FBEAE9', borderRadius: 14 }}>{error}</p>
              )}

              <button
                onClick={handleStart}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-3 transition-all active:scale-95"
                style={{
                  borderRadius: 18, padding: '20px 0', fontSize: 18, fontWeight: 800,
                  color: C.white, background: C.ink, opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'default' : 'pointer', boxShadow: '0 16px 32px -12px rgba(0,0,0,0.35)',
                }}
              >
                {loading ? (<><Loader2 size={20} className="animate-spin" /> داره آماده می‌شه…</>) : 'ادیتور رو باز کن'}
              </button>

              {done && (
                <div className="mt-4 flex items-center gap-2.5 px-5 py-4" style={{ borderRadius: 14, background: '#EAF4EA' }}>
                  <Check size={18} style={{ color: '#2E7D32' }} />
                  <span style={{ fontSize: 15, color: '#2E7D32', fontWeight: 600 }}>ردیفه! کاشی اولت آماده‌ست — این تنظیمات می‌ره تو ادیتور.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ سکشن ۲: چرا کاشی نوری ═══════════ */}
      <Section eyebrow="چرا این محصول" title="فرقش با یه قاب عکس معمولی چیه؟">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { Icon: Magnet, title: 'نصب بدون دریل', desc: 'سیستم آویز مغناطیسی — بدون سوراخ‌کاری روی دیوار' },
            { Icon: LayoutGrid, title: 'قابل گسترش', desc: 'هر زمان خواستی یه کاشی دیگه اضافه کن یا چیدمان رو عوض کن' },
            { Icon: RefreshCw, title: 'تعویض آسان', desc: 'جابه‌جایی و جایگزینی عکس‌ها در عرض چند ثانیه' },
          ].map((item, i) => (
            <div key={i} className="p-7" style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 20 }}>
              <div className="flex items-center justify-center mb-5" style={{ width: 46, height: 46, borderRadius: 14, background: C.amberSoft + '66' }}>
                <item.Icon size={22} style={{ color: C.amberDeep }} />
              </div>
              <h3 className="mb-2" style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════ سکشن ۳: نمونه دیوارها (جای گالری) ═══════════ */}
      <Section eyebrow="الهام بگیر" title="چیدمان‌هایی که مشتری‌ها ساختن" tone="dim">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1011, 1025, 1035, 1043].map(id => (
            <div key={id} style={{ borderRadius: 18, overflow: 'hidden', aspectRatio: '1 / 1' }}>
              <img src={`https://picsum.photos/id/${id}/400/400`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </Section>

      {/* 👇 برای افزودن سکشن بعدی، همینجا یه <Section> دیگه اضافه کن —
          پدینگ، فاصله و تایپوگرافی خودش هماهنگ می‌شه. */}

    </div>
  );
}

// ════════════════════════════════════════════════════════════
function Section({ eyebrow, title, tone = 'light', children }) {
  const bg = tone === 'dim' ? C.paperDim : C.paper;
  return (
    <section className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20" style={{ background: bg, borderTop: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto">
        {eyebrow && (
          <div className="mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: C.amberDeep, textTransform: 'uppercase' }}>
            {eyebrow}
          </div>
        )}
        {title && (
          <h2 className="mb-10" style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 700, color: C.ink }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

function OptionTile({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 py-6 transition-all"
      style={{
        borderRadius: 18,
        border: `2px solid ${active ? C.amber : C.line}`,
        background: active ? C.amberSoft + '55' : C.paper,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function StepCard({ index, isLast, title, summary, open, onToggle, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center" style={{ paddingTop: 18 }}>
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32, borderRadius: 999, fontSize: 14, fontWeight: 800,
            color: open ? C.white : C.inkSoft,
            background: open ? C.ink : C.paperDim,
            border: `1.5px solid ${open ? C.ink : C.line}`,
          }}
        >
          {index + 1}
        </span>
        {!isLast && <span style={{ width: 2, flex: 1, minHeight: 24, background: C.line, marginTop: 6 }} />}
      </div>

      <div className="flex-1" style={{ borderRadius: 18, border: `2px solid ${open ? C.ink : C.line}`, overflow: 'hidden', marginBottom: isLast ? 0 : 8 }}>
        <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4" style={{ background: C.white, cursor: 'pointer' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{title}</span>
          <span className="flex items-center gap-2.5">
            <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{summary}</span>
            <ChevronDown size={18} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
          </span>
        </button>
        {open && <div className="px-5 pb-5" style={{ background: C.white }}>{children}</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// پیش‌نمایش لایت‌باکس — عنصر امضادار صفحه: سوییچ نور واقعی
// ════════════════════════════════════════════════════════════
function LightboxPreview({ selections, lightOn, onToggleLight, sizeScale }) {
  const { shape, material, corner } = selections;
  const mat = MATERIALS.find(m => m.id === material);
  const clip = SHAPE_CLIP[shape];
  const radius = corner === 'rounded' ? 18 : 2;

  const tiles = [
    { x: 0, y: 0, scale: 1.2, z: 3 },
    { x: -86, y: -52, scale: 0.82, z: 2 },
    { x: 88, y: 46, scale: 0.86, z: 1 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: 520, padding: '64px 0' }}>
      {/* درخشش پس‌زمینه */}
      <div
        className="absolute inset-0"
        style={{
          background: lightOn
            ? `radial-gradient(circle at 50% 45%, ${C.amber}33, transparent 60%)`
            : `radial-gradient(circle at 50% 45%, #ffffff0d, transparent 60%)`,
          transition: 'background 500ms ease',
        }}
      />
      <div
        className="absolute"
        style={{
          width: 420, height: 420, borderRadius: 999, top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          background: lightOn ? C.amber : '#FFFFFF',
          opacity: lightOn ? 0.16 : 0.04,
          filter: 'blur(90px)',
          transition: 'opacity 500ms ease, background 500ms ease',
        }}
      />

      {/* سوییچ نور — عنصر امضادار */}
      <button
        onClick={onToggleLight}
        className="absolute flex items-center gap-2.5 transition-all"
        style={{
          top: 24, insetInlineEnd: 24, zIndex: 10, borderRadius: 999,
          padding: '8px 8px 8px 16px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', backdropFilter: 'blur(6px)',
        }}
        aria-pressed={lightOn}
        aria-label="روشن و خاموش کردن نور"
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>نور</span>
        <span
          className="relative flex items-center"
          style={{ width: 42, height: 24, borderRadius: 999, background: lightOn ? C.amber : 'rgba(255,255,255,0.18)', transition: 'background 300ms' }}
        >
          <span
            className="absolute flex items-center justify-center"
            style={{
              width: 20, height: 20, borderRadius: 999, background: C.white, top: 2,
              insetInlineStart: lightOn ? 2 : 20, transition: 'inset-inline-start 300ms ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {lightOn ? <Sun size={12} style={{ color: C.amberDeep }} /> : <Moon size={12} style={{ color: '#555' }} />}
          </span>
        </span>
      </button>

      {/* بافت نوری نقطه‌ای */}
      <div
        className="absolute inset-0"
        style={{ opacity: 0.05, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />

      {/* کاشی‌ها */}
      <div className="relative" style={{ width: 380, height: 380, maxWidth: '78vw', maxHeight: '78vw' }}>
        {tiles.map((t, i) => {
          const s = sizeScale * t.scale;
          const base = 180;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                top: '50%', left: '50%', width: base * s, height: base * s, zIndex: t.z,
                transform: `translate(calc(-50% + ${t.x * sizeScale}px), calc(-50% + ${t.y * sizeScale}px))`,
                animation: `obp-drift ${6 + i}s ease-in-out infinite`,
                transition: 'width 400ms, height 400ms',
              }}
            >
              <div
                className="w-full h-full relative"
                style={{
                  backgroundImage: `url(${mat?.texture})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  clipPath: clip, borderRadius: shape === 'square' ? radius : 0,
                  boxShadow: lightOn
                    ? `0 0 50px ${C.amber}55, 0 28px 50px -16px rgba(0,0,0,0.7)`
                    : '0 20px 40px -16px rgba(0,0,0,0.7)',
                  transition: 'box-shadow 500ms ease',
                  animation: lightOn ? `obp-flicker ${9 + i * 2}s ease-in-out infinite` : 'none',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: clip, borderRadius: shape === 'square' ? radius : 0,
                    background: `linear-gradient(135deg, rgba(255,255,255,${lightOn ? 0.4 : 0.18}) 0%, transparent 35%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-8 inset-x-0 text-center">
        <p style={{ fontSize: 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
          {lightOn ? 'روشن — همینجوری شب می‌درخشه' : 'خاموش — حالت روز'}
        </p>
      </div>
    </div>
  );
}