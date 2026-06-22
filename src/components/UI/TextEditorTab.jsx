import React, { useState, useEffect, useCallback } from 'react';
import LivePreviewCanvas from './EditModal/LivePreviewCanvas';
import {
  Trash2, Plus, Check, ChevronDown, ChevronUp,
  Type, Palette, Sparkles, RotateCw,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Copy, FlipHorizontal, FlipVertical, RotateCcw, X,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// ثابت‌ها
// ═══════════════════════════════════════════════
const ACCENT     = '#FF6B35';
const ACCENT_BG  = '#FFF1EB';
const BORDER     = '#E0E0E0';
const TEXT       = '#1a1a1a';
const TEXT_MUTED = '#666';
const TEXT_FAINT = '#888';
const BG_SOFT    = '#F5F5F5';

const FONTS = [
  { label: 'Vazirmatn (پیش‌فرض)', value: 'Vazirmatn' },
  { label: 'Arial',               value: 'Arial' },
  { label: 'Tahoma',              value: 'Tahoma' },
  { label: 'Times New Roman',     value: 'Times New Roman' },
  { label: 'Impact',              value: 'Impact' },
  { label: 'Georgia',             value: 'Georgia' },
  { label: 'Courier New',         value: 'Courier New' },
];

const SWATCHES = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b',
];

// ساخت لایه‌ی جدید با مقادیر پیش‌فرض منطقی
const makeLayer = (overrides = {}) => ({
  id:                  crypto.randomUUID(),
  text:                'متن جدید',
  fontSize:            32,
  fontFamily:          'Vazirmatn',
  fontWeight:          'normal',
  fontStyle:           'normal',
  underline:           false,
  linethrough:         false,
  textAlign:           'center',
  lineHeight:          1.16,
  charSpacing:         0,
  fill:                '#000000',
  stroke:              '#ffffff',
  strokeWidth:         0,
  textBackgroundColor: null,
  shadowColor:         '#000000',
  shadowBlur:          0,
  shadowOffsetX:       0,
  shadowOffsetY:       0,
  opacity:             1,
  previewLeft:         150,
  previewTop:          150,
  scaleX:              1,
  scaleY:              1,
  angle:               0,
  flipX:               false,
  flipY:               false,
  ...overrides,
});

// ═══════════════════════════════════════════════
// اتم‌ها (Atoms)
// ═══════════════════════════════════════════════

// دایره‌ی رنگ کوچک
const ColorDot = ({ color, active, onClick }) => (
  <button
    onClick={onClick}
    title={color}
    style={{ backgroundColor: color }}
    className={`w-7 h-7 border-2 transition-all shrink-0
      ${active ? `scale-110` : 'border-white hover:scale-110'}`}
  >
    {active && (
      <span
        className="block w-full h-full border-2"
        style={{
          borderColor: color === '#ffffff' || color === '#f5f5f5' ? '#999' : ACCENT
        }}
      />
    )}
  </button>
);

// ردیف انتخاب رنگ با color input مخفی
const ColorRow = ({ label, value, onChange, onClear }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs font-medium text-[#1a1a1a]">{label}</span>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <span
          style={{ backgroundColor: value || 'transparent' }}
          className={`w-7 h-7 border-2 shrink-0 group-hover:border-[#999] transition-colors
            ${value ? 'border-[#E0E0E0]' : 'border-dashed border-[#bbb]'}`}
        >
          {!value && <span className="text-[10px] text-[#888] flex items-center justify-center h-full">×</span>}
        </span>
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
      {value && onClear && (
        <button
          onClick={onClear}
          title="حذف"
          className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  </div>
);

// اسلایدر با لیبل و عدد
const Knob = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px]">
      <span className="text-[#666]">{label}</span>
      <span className="font-mono tabular-nums text-[#1a1a1a]">
        {step < 1 ? value.toFixed(1) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="w-full h-1.5"
      style={{ accentColor: ACCENT }}
    />
  </div>
);

// عدد ورودی با لیبل پایین
const NumInput = ({ label, value, onChange, min, max, step = 1 }) => (
  <div className="flex flex-col items-center gap-1">
    <input
      type="number" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full text-center text-sm font-mono border border-[#E0E0E0] py-1.5 outline-none focus:border-[#FF6B35] bg-white text-[#1a1a1a]"
    />
    <span className="text-[10px] text-[#888]">{label}</span>
  </div>
);

// دکمه‌ی toggle بزرگ با متن + آیکون
const ToggleBtn = ({ active, onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-medium border-2 transition-colors
      ${active
        ? 'border-[#FF6B35] bg-[#FFF1EB] text-[#FF6B35]'
        : 'border-[#E0E0E0] bg-white text-[#666] hover:border-[#999] hover:text-[#1a1a1a]'}`}
  >
    {children}
  </button>
);

// دکمه‌ی toggle آیکونی (مربع کوچک)
const IconToggle = ({ active, onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex-1 flex items-center justify-center py-2 transition-colors
      ${active
        ? 'bg-[#FF6B35] text-white'
        : 'text-[#666] hover:bg-[#F5F5F5]'}`}
  >
    {children}
  </button>
);

// تب پنل (با بیرون‌زدگی)
const PanelTab = ({ id, active, icon: Icon, label, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`relative flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] font-medium
      whitespace-nowrap transition-colors -mb-px border-t-2
      ${active
        ? 'bg-white text-[#FF6B35] border-t-[#FF6B35] border-x border-[#E0E0E0]'
        : 'bg-transparent text-[#666] hover:text-[#1a1a1a] border-t-transparent'}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

// عنوان بخش داخل تب
const SectionTitle = ({ children }) => (
  <h4 className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2 mt-1">
    {children}
  </h4>
);

// ═══════════════════════════════════════════════
// کامپوننت اصلی
// ═══════════════════════════════════════════════
const TextEditorTab = ({ savedTextConfig, onSave, onDelete }) => {
  const [layers,        setLayers]        = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [panel,         setPanel]         = useState('text');
  const [panelOpen,     setPanelOpen]     = useState(true);

  // ── Init ──
  useEffect(() => {
    if (savedTextConfig?.layers?.length) {
      // نرمال‌سازی لایه‌های قدیمی
      const normalized = savedTextConfig.layers.map(l => ({
        ...makeLayer(),
        ...l,
        // اگه bold(bool) بود به fontWeight تبدیل کن
        fontWeight: l.fontWeight || (l.bold ? 'bold' : 'normal'),
        fontStyle:  l.fontStyle  || (l.italic ? 'italic' : 'normal'),
      }));
      setLayers(normalized);
      setActiveLayerId(normalized.at(-1).id);
    } else {
      const first = makeLayer();
      setLayers([first]);
      setActiveLayerId(first.id);
    }
  }, []);

  const active = layers.find(l => l.id === activeLayerId);

  // ست‌کننده‌ی عمومی
  const set = (key, value) => {
    if (!activeLayerId) return;
    setLayers(p => p.map(l => l.id === activeLayerId ? { ...l, [key]: value } : l));
  };

  // toggle بولد
  const toggleBold = () => {
    if (!active) return;
    const next = active.fontWeight !== 'bold';
    set('fontWeight', next ? 'bold' : 'normal');
  };

  // toggle ایتالیک
  const toggleItalic = () => {
    if (!active) return;
    const next = active.fontStyle !== 'italic';
    set('fontStyle', next ? 'italic' : 'normal');
  };

  // افزودن لایه
  const addLayer = () => {
    const l = makeLayer({
      // اگه لایه‌ی فعلی هست، فونت و استایل همون رو به‌ ارث ببر
      fontFamily: active?.fontFamily || 'Vazirmatn',
      fontSize:   active?.fontSize   || 32,
      fill:       active?.fill       || '#000000',
      // یه کم شیفت بده تا روی هم نیفتن
      previewLeft: (active?.previewLeft ?? 150) + 15,
      previewTop:  (active?.previewTop  ?? 150) + 15,
    });
    setLayers(p => [...p, l]);
    setActiveLayerId(l.id);
    setPanel('text');
    setPanelOpen(true);
  };

  // حذف لایه‌ی فعال
  const removeActive = () => {
    if (!activeLayerId) return;
    setLayers(p => {
      const next = p.filter(l => l.id !== activeLayerId);
      setActiveLayerId(next.at(-1)?.id ?? null);
      return next;
    });
  };

  // ✅ دیپلیکیت لایه‌ی فعال (با id و موقعیت جدید)
  const duplicateActive = () => {
    if (!active) return;
    const copy = makeLayer({
      ...active,
      id:          crypto.randomUUID(),
      previewLeft: (active.previewLeft ?? 150) + 20,
      previewTop:  (active.previewTop  ?? 150) + 20,
    });
    setLayers(p => {
      const idx = p.findIndex(l => l.id === active.id);
      const next = [...p];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveLayerId(copy.id);
  };

  // جابجایی لایه (z-index)
  const moveLayer = (dir) => {
    if (!active) return;
    setLayers(p => {
      const idx = p.findIndex(l => l.id === active.id);
      if (idx === -1) return p;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= p.length) return p;
      const next = [...p];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // ریست تبدیل‌ها
  const resetTransform = () => {
    set('previewLeft', 150);
    set('previewTop',  150);
    set('scaleX', 1);
    set('scaleY', 1);
    set('angle',  0);
    set('flipX', false);
    set('flipY', false);
  };

  const handleCanvasUpdate = useCallback((id, props) => {
    setLayers(p => p.map(l => l.id === id ? { ...l, ...props } : l));
  }, []);

  const handleSelectLayer = useCallback(id => {
    setActiveLayerId(id);
    setPanelOpen(true);
  }, []);

  // ── محتوای پنل ──
  const renderPanel = () => {
    if (!active) return (
      <div className="text-center py-8 text-[#888] text-sm">
        <Type size={32} className="mx-auto mb-2 opacity-30" />
        <p>لایه‌ای انتخاب نشده</p>
        <button
          onClick={addLayer}
          className="mt-3 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium hover:bg-[#E55A2B] transition-colors"
        >
          + افزودن لایه
        </button>
      </div>
    );

    switch (panel) {
      // ══════ تب متن ══════
      case 'text': return (
        <div className="space-y-4">
          <div>
            <SectionTitle>محتوای متن</SectionTitle>
            <textarea
              value={active.text}
              onChange={e => set('text', e.target.value)}
              rows={2}
              placeholder="متن خود را وارد کنید..."
              className="w-full px-3 py-2.5 border border-[#E0E0E0] text-sm outline-none focus:border-[#FF6B35] resize-none transition-colors text-[#1a1a1a] bg-white"
              style={{ fontFamily: active.fontFamily, direction: 'rtl' }}
              autoFocus
            />
          </div>

          <div>
            <SectionTitle>فونت و سایز</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={active.fontFamily}
                onChange={e => set('fontFamily', e.target.value)}
                className="px-3 py-2 bg-[#F5F5F5] text-sm outline-none border border-[#E0E0E0] focus:border-[#FF6B35] text-[#1a1a1a]"
              >
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 border border-[#E0E0E0] focus-within:border-[#FF6B35]">
                <Type size={14} className="text-[#888] shrink-0" />
                <input
                  type="number" min={8} max={300} value={active.fontSize}
                  onChange={e => set('fontSize', parseInt(e.target.value) || 24)}
                  className="w-full bg-transparent py-2 text-sm outline-none text-[#1a1a1a]"
                />
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>استایل</SectionTitle>
            <div className="flex gap-2">
              <ToggleBtn active={active.fontWeight === 'bold'} onClick={toggleBold} title="بولد">
                <Bold size={15} /> بولد
              </ToggleBtn>
              <ToggleBtn active={active.fontStyle === 'italic'} onClick={toggleItalic} title="ایتالیک">
                <Italic size={15} /> ایتالیک
              </ToggleBtn>
              <ToggleBtn active={!!active.underline} onClick={() => set('underline', !active.underline)} title="زیرخط">
                <Underline size={15} /> زیرخط
              </ToggleBtn>
              <ToggleBtn active={!!active.linethrough} onClick={() => set('linethrough', !active.linethrough)} title="خط‌خورده">
                <Strikethrough size={15} /> خط‌خورده
              </ToggleBtn>
            </div>
          </div>

          <div>
            <SectionTitle>چینش</SectionTitle>
            <div className="flex border border-[#E0E0E0]">
              {[
                ['right',   AlignRight],
                ['center',  AlignCenter],
                ['left',    AlignLeft],
                ['justify', AlignJustify],
              ].map(([val, Icon], idx) => (
                <IconToggle
                  key={val}
                  active={active.textAlign === val}
                  onClick={() => set('textAlign', val)}
                  title={val}
                >
                  <Icon size={15} />
                  <span className="block w-full h-px" style={{ background: idx > 0 ? '#E0E0E0' : 'transparent' }} />
                </IconToggle>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>فاصله‌گذاری</SectionTitle>
            <div className="space-y-3">
              <Knob
                label="ارتفاع خط (Line Height)"
                value={active.lineHeight ?? 1.16}
                min={0.8} max={3} step={0.05}
                onChange={v => set('lineHeight', v)}
              />
              <Knob
                label="فاصله حروف (Letter Spacing)"
                value={active.charSpacing ?? 0}
                min={-200} max={800} step={10}
                onChange={v => set('charSpacing', v)}
                unit=""
              />
            </div>
          </div>
        </div>
      );

      // ══════ تب رنگ ══════
      case 'style': return (
        <div className="space-y-5">
          {/* رنگ متن */}
          <div>
            <SectionTitle>رنگ متن</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SWATCHES.map(c => (
                <ColorDot
                  key={c}
                  color={c}
                  active={active.fill === c}
                  onClick={() => set('fill', c)}
                />
              ))}
              <label className="w-7 h-7 border-2 border-dashed border-[#999] flex items-center justify-center cursor-pointer hover:border-[#FF6B35] relative overflow-hidden shrink-0">
                <Plus size={12} className="text-[#888] pointer-events-none" />
                <input
                  type="color"
                  value={active.fill || '#000000'}
                  onChange={e => set('fill', e.target.value)}
                  className="absolute opacity-0 inset-0 w-full h-full"
                />
              </label>
            </div>
          </div>

          {/* ✅ بوردر متن (Stroke) — با toggle و حذف */}
          <div className="pt-3 border-t border-[#E0E0E0]">
            <SectionTitle>بوردر متن</SectionTitle>
            <div className="space-y-3">
              <ColorRow
                label="رنگ بوردر"
                value={(active.strokeWidth || 0) > 0 ? active.stroke : null}
                onChange={v => {
                  set('stroke', v);
                  if (!active.strokeWidth) set('strokeWidth', 2);
                }}
                onClear={() => {
                  set('stroke', null);
                  set('strokeWidth', 0);
                }}
              />
              {(active.strokeWidth || 0) > 0 && (
                <Knob
                  label="ضخامت بوردر"
                  value={active.strokeWidth}
                  min={0.5} max={10} step={0.5}
                  onChange={v => set('strokeWidth', v)}
                  unit="px"
                />
              )}
              {!(active.strokeWidth || 0) && (
                <p className="text-[11px] text-[#888]">
                  برای فعال‌سازی بوردر، یک رنگ انتخاب کن.
                </p>
              )}
            </div>
          </div>

          {/* ✅ بک‌گراند متن (Highlight) — با دکمه حذف صریح */}
          <div className="pt-3 border-t border-[#E0E0E0]">
            <SectionTitle>بک‌گراند متن (Highlight)</SectionTitle>
            <ColorRow
              label="رنگ بک‌گراند"
              value={active.textBackgroundColor}
              onChange={v => set('textBackgroundColor', v)}
              onClear={() => set('textBackgroundColor', null)}
            />
            {active.textBackgroundColor && (
              <button
                onClick={() => set('textBackgroundColor', null)}
                className="mt-2 w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                حذف بک‌گراند متن
              </button>
            )}
          </div>

          {/* شفافیت */}
          <div className="pt-3 border-t border-[#E0E0E0]">
            <SectionTitle>شفافیت</SectionTitle>
            <Knob
              label="Opacity"
              value={Math.round((active.opacity ?? 1) * 100)}
              min={10} max={100}
              onChange={v => set('opacity', v / 100)}
              unit="%"
            />
          </div>
        </div>
      );

      // ══════ تب افکت‌ها ══════
      case 'effects': return (
        <div className="space-y-4">
          <SectionTitle>سایه (Shadow)</SectionTitle>

          <ColorRow
            label="رنگ سایه"
            value={(active.shadowBlur > 0 || active.shadowOffsetX || active.shadowOffsetY)
              ? active.shadowColor : null}
            onChange={v => {
              set('shadowColor', v);
              if (!active.shadowBlur) set('shadowBlur', 8);
            }}
            onClear={() => {
              set('shadowBlur', 0);
              set('shadowOffsetX', 0);
              set('shadowOffsetY', 0);
            }}
          />

          {(active.shadowBlur > 0 || active.shadowOffsetX || active.shadowOffsetY) && (
            <>
              <Knob
                label="محوی (Blur)"
                value={active.shadowBlur || 0}
                min={0} max={60}
                onChange={v => set('shadowBlur', v)}
                unit="px"
              />
              <div className="grid grid-cols-2 gap-2">
                <NumInput
                  label="افست افقی X"
                  value={active.shadowOffsetX || 0}
                  onChange={v => set('shadowOffsetX', v)}
                  min={-50} max={50}
                />
                <NumInput
                  label="افست عمودی Y"
                  value={active.shadowOffsetY || 0}
                  onChange={v => set('shadowOffsetY', v)}
                  min={-50} max={50}
                />
              </div>

              {/* دکمه‌های پیش‌فرض سایه */}
              <div className="pt-2">
                <p className="text-[11px] text-[#888] mb-2">پیش‌تنظیم‌ها:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { set('shadowBlur', 4); set('shadowOffsetX', 2); set('shadowOffsetY', 2); }}
                    className="py-2 text-[11px] border border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    نرم
                  </button>
                  <button
                    onClick={() => { set('shadowBlur', 0); set('shadowOffsetX', 3); set('shadowOffsetY', 3); }}
                    className="py-2 text-[11px] border border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    سخت
                  </button>
                  <button
                    onClick={() => { set('shadowBlur', 15); set('shadowOffsetX', 0); set('shadowOffsetY', 0); }}
                    className="py-2 text-[11px] border border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    درخشش
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      );

      // ══════ تب تبدیل‌ها ══════
      case 'transform': return (
        <div className="space-y-5">
          <div>
            <SectionTitle>موقعیت</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <NumInput
                label="موقعیت X"
                value={Math.round(active.previewLeft ?? 150)}
                onChange={v => set('previewLeft', v)}
                min={0} max={300}
              />
              <NumInput
                label="موقعیت Y"
                value={Math.round(active.previewTop ?? 150)}
                onChange={v => set('previewTop', v)}
                min={0} max={300}
              />
            </div>
          </div>

          <div>
            <SectionTitle>مقیاس</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <NumInput
                label="مقیاس X ٪"
                value={Math.round((active.scaleX ?? 1) * 100)}
                onChange={v => set('scaleX', v / 100)}
                min={10} max={500}
              />
              <NumInput
                label="مقیاس Y ٪"
                value={Math.round((active.scaleY ?? 1) * 100)}
                onChange={v => set('scaleY', v / 100)}
                min={10} max={500}
              />
            </div>
          </div>

          <div>
            <SectionTitle>چرخش</SectionTitle>
            <Knob
              label="زاویه"
              value={active.angle ?? 0}
              min={-180} max={180}
              onChange={v => set('angle', v)}
              unit="°"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[-90, 0, 90, 180].map(deg => (
                <button
                  key={deg}
                  onClick={() => set('angle', deg)}
                  className="py-1.5 text-[11px] font-medium border border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>برعکس کردن</SectionTitle>
            <div className="flex gap-2">
              <ToggleBtn active={!!active.flipX} onClick={() => set('flipX', !active.flipX)} title="برعکس افقی">
                <FlipHorizontal size={15} /> افقی
              </ToggleBtn>
              <ToggleBtn active={!!active.flipY} onClick={() => set('flipY', !active.flipY)} title="برعکس عمودی">
                <FlipVertical size={15} /> عمودی
              </ToggleBtn>
            </div>
          </div>

          <button
            onClick={resetTransform}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-[#666] border border-[#E0E0E0] hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <RotateCcw size={14} /> ریست تبدیل‌ها
          </button>
        </div>
      );

      default: return null;
    }
  };

  const activeIdx = layers.findIndex(l => l.id === activeLayerId);

  return (
    <div className="flex flex-col h-full bg-white select-none">

      {/* ══ پریویو ═══════════════════════════════════════════ */}
      <div className="relative shrink-0 mx-auto w-full max-w-[300px] aspect-square overflow-hidden my-3 bg-[#F5F5F5] border border-[#E0E0E0]">
        <LivePreviewCanvas
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={handleSelectLayer}
          onUpdateLayer={handleCanvasUpdate}
        />

        {/* نوار لایه‌ها روی پریویو */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-2 py-2 bg-black/55 backdrop-blur-sm">
          <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
            {layers.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => handleSelectLayer(l.id)}
                className={`shrink-0 px-2.5 py-1 text-xs font-medium transition-colors max-w-[90px] truncate
                  ${l.id === activeLayerId
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white/15 text-white/80 hover:bg-white/25'}`}
                title={l.text || '(خالی)'}
              >
                {idx + 1}. {l.text || '(خالی)'}
              </button>
            ))}
          </div>
          {/* دکمه‌های کنترل لایه */}
          <button onClick={addLayer} title="افزودن لایه جدید"
            className="shrink-0 w-7 h-7 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
            <Plus size={14} />
          </button>
          {active && (
            <button onClick={duplicateActive} title="کپی لایه"
              className="shrink-0 w-7 h-7 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
              <Copy size={13} />
            </button>
          )}
          {active && (
            <button onClick={removeActive} title="حذف لایه"
              className="shrink-0 w-7 h-7 bg-red-500/85 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ══ پنل ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden mx-3 mb-3">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col overflow-hidden border border-[#E0E0E0] bg-white">

          {/* تب‌های پنل */}
          <div className="flex items-stretch gap-0 px-2 pt-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
            <PanelTab id="text"      active={panel==='text'}      icon={Type}      label="متن"   onClick={p => { setPanel(p); setPanelOpen(true); }} />
            <PanelTab id="style"     active={panel==='style'}     icon={Palette}   label="رنگ"   onClick={p => { setPanel(p); setPanelOpen(true); }} />
            <PanelTab id="effects"   active={panel==='effects'}   icon={Sparkles}  label="افکت"  onClick={p => { setPanel(p); setPanelOpen(true); }} />
            <PanelTab id="transform" active={panel==='transform'} icon={RotateCw}  label="تبدیل" onClick={p => { setPanel(p); setPanelOpen(true); }} />

            {/* دکمه‌های جابجایی لایه + بستن پنل */}
            <div className="ml-auto flex items-center gap-1 self-center pr-1">
              {layers.length > 1 && active && (
                <>
                  <button
                    onClick={() => moveLayer(-1)}
                    disabled={activeIdx === 0}
                    title="لایه به عقب"
                    className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#FF6B35] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => moveLayer(1)}
                    disabled={activeIdx === layers.length - 1}
                    title="لایه به جلو"
                    className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#FF6B35] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown size={15} />
                  </button>
                </>
              )}
              <button
                onClick={() => setPanelOpen(p => !p)}
                className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#FF6B35] hover:bg-white transition-colors"
                aria-label="باز/بسته کردن پنل"
              >
                {panelOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
              </button>
            </div>
          </div>

          {/* محتوای پنل */}
          {panelOpen && (
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
              {renderPanel()}
            </div>
          )}
        </div>
      </div>

      {/* ══ فوتر ════════════════════════════════════════════ */}
      <div className="shrink-0 px-3 pb-3">
        <div className="w-full max-w-2xl mx-auto flex gap-2">
          <button onClick={onDelete}
            className="flex-1 py-3 text-red-500 bg-red-50 font-semibold text-sm hover:bg-red-100 active:scale-[0.98] transition-all border border-red-200">
            پاک کردن
          </button>
          <button
            onClick={() => onSave({ layers })}
            className="flex-[2] py-3 bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Check size={16} /> ثبت
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorTab;
