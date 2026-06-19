import React, { useState, useEffect, useCallback, useRef } from 'react';
import LivePreviewCanvas from './EditModal/LivePreviewCanvas';
import {
  Trash2, Plus, Check, ChevronDown, ChevronUp,
  Type, Palette, Sparkles, Layers, RotateCw,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';

// ─────────────────────────────────────────────
const FONTS = [
  { label: 'Vazirmatn',        value: 'Vazirmatn' },
  { label: 'Arial',            value: 'Arial' },
  { label: 'Tahoma',           value: 'Tahoma' },
  { label: 'Times New Roman',  value: 'Times New Roman' },
  { label: 'Impact',           value: 'Impact' },
  { label: 'Georgia',          value: 'Georgia' },
  { label: 'Courier New',      value: 'Courier New' },
];
const SWATCHES = [
  '#000000','#ffffff','#ef4444','#f97316','#eab308',
  '#22c55e','#3b82f6','#8b5cf6','#ec4899','#64748b',
];

const makeLayer = () => ({
  id:                  crypto.randomUUID(),
  text:                'متن جدید',
  fontSize:            32,
  fontFamily:          'Vazirmatn',
  fontWeight:          'normal',
  fontStyle:           'normal',
  textAlign:           'center',
  fill:                '#000000',
  stroke:              null,
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
});

// ─── Atoms ───────────────────────────────────

const ColorDot = ({ color, active, onClick }) => (
  <button
    onClick={onClick}
    title={color}
    style={{ backgroundColor: color }}
    className={`w-7 h-7 rounded-full border-2 transition-all shrink-0
      ${active ? 'border-blue-500 scale-110 ring-2 ring-blue-300 ring-offset-1' : 'border-white/60 hover:scale-110'}`}
  />
);

const PickerRow = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <span
      style={{ backgroundColor: value || '#000' }}
      className="w-7 h-7 rounded-lg border-2 border-slate-200 shadow-sm group-hover:scale-105 transition-transform shrink-0"
    />
    <span className="text-xs text-slate-500">{label}</span>
    <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
      className="sr-only" />
  </label>
);

const Knob = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px] text-slate-400">
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="w-full h-1.5 accent-blue-500 rounded-full" />
  </div>
);

const NumInput = ({ label, value, onChange, min, max }) => (
  <div className="flex flex-col items-center gap-1">
    <input type="number" min={min} max={max} value={value}
      onChange={e => onChange(parseInt(e.target.value) || 0)}
      className="w-full text-center text-sm font-mono border-2 border-slate-200 rounded-lg py-1.5 outline-none focus:border-blue-400 bg-white"
    />
    <span className="text-[10px] text-slate-400">{label}</span>
  </div>
);

// ─── Panel Tab ────────────────────────────────
const PanelTab = ({ id, active, icon: Icon, label, onClick }) => (
  <button onClick={() => onClick(id)}
    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all
      ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════
const TextEditorTab = ({ savedTextConfig, onSave, onDelete }) => {
  const [layers,        setLayers]        = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [panel,         setPanel]         = useState('text'); // text | style | effects | transform
  const [panelOpen,     setPanelOpen]     = useState(true);

  // ── Init ──
  useEffect(() => {
    if (savedTextConfig?.layers?.length) {
      setLayers(savedTextConfig.layers);
      setActiveLayerId(savedTextConfig.layers.at(-1).id);
    } else {
      const first = makeLayer();
      setLayers([first]);
      setActiveLayerId(first.id);
    }
  }, []);

  const active = layers.find(l => l.id === activeLayerId);

  const set = (key, value) => {
    if (!activeLayerId) return;
    setLayers(p => p.map(l => l.id === activeLayerId ? { ...l, [key]: value } : l));
  };

  const addLayer = () => {
    const l = makeLayer();
    setLayers(p => [...p, l]);
    setActiveLayerId(l.id);
    setPanel('text');
    setPanelOpen(true);
  };

  const removeActive = () => {
    if (!activeLayerId) return;
    setLayers(p => {
      const next = p.filter(l => l.id !== activeLayerId);
      setActiveLayerId(next.at(-1)?.id ?? null);
      return next;
    });
  };

  const handleCanvasUpdate = useCallback((id, props) => {
    setLayers(p => p.map(l => l.id === id ? { ...l, ...props } : l));
  }, []);

  const handleSelectLayer = useCallback(id => {
    setActiveLayerId(id);
    setPanelOpen(true);
  }, []);

  // ── Panel Content ──
  const renderPanel = () => {
    if (!active) return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Layers size={32} className="mx-auto mb-2 opacity-30" />
        <p>لایه‌ای انتخاب نشده</p>
      </div>
    );

    switch (panel) {
      case 'text': return (
        <div className="space-y-3">
          {/* textarea */}
          <textarea
            value={active.text}
            onChange={e => set('text', e.target.value)}
            rows={3}
            placeholder="متن خود را وارد کنید..."
            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none transition-colors"
            style={{ fontFamily: active.fontFamily, direction: 'rtl' }}
            autoFocus
          />
          {/* font + size */}
          <div className="grid grid-cols-2 gap-2">
            <select value={active.fontFamily} onChange={e => set('fontFamily', e.target.value)}
              className="px-3 py-2 bg-slate-100 rounded-xl text-sm outline-none border-2 border-transparent focus:border-blue-300">
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 border-2 border-transparent focus-within:border-blue-300">
              <Type size={14} className="text-slate-400 shrink-0" />
              <input type="number" min={8} max={300} value={active.fontSize}
                onChange={e => set('fontSize', parseInt(e.target.value) || 24)}
                className="w-full bg-transparent py-2 text-sm outline-none" />
            </div>
          </div>
          {/* Bold / Italic / Align */}
          <div className="flex items-center gap-2">
            <button onClick={() => set('fontWeight', active.fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`p-2 rounded-lg border-2 transition-all ${active.fontWeight === 'bold' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
              <Bold size={15} />
            </button>
            <button onClick={() => set('fontStyle', active.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`p-2 rounded-lg border-2 transition-all ${active.fontStyle === 'italic' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
              <Italic size={15} />
            </button>
            <div className="flex gap-1 mr-auto border-2 border-slate-200 rounded-lg p-0.5">
              {[['right','راست', AlignRight], ['center','وسط', AlignCenter], ['left','چپ', AlignLeft]].map(([val, tip, Icon]) => (
                <button key={val} title={tip} onClick={() => set('textAlign', val)}
                  className={`p-1.5 rounded transition-all ${active.textAlign === val ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case 'style': return (
        <div className="space-y-4">
          {/* رنگ متن */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">رنگ متن</p>
            <div className="flex flex-wrap gap-1.5">
              {SWATCHES.map(c => (
                <ColorDot key={c} color={c} active={active.fill === c} onClick={() => set('fill', c)} />
              ))}
              <label className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 relative overflow-hidden shrink-0">
                <Plus size={12} className="text-slate-400 pointer-events-none" />
                <input type="color" value={active.fill || '#000000'} onChange={e => set('fill', e.target.value)}
                  className="absolute opacity-0 inset-0 w-full h-full" />
              </label>
            </div>
          </div>
          {/* Stroke */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">دورخط</p>
              <PickerRow label="" value={active.stroke} onChange={v => set('stroke', v)} />
            </div>
            <Knob label="ضخامت" value={active.strokeWidth || 0} min={0} max={15} step={0.5}
              onChange={v => set('strokeWidth', v)} />
          </div>
          {/* Opacity */}
          <Knob label="شفافیت" value={Math.round((active.opacity ?? 1) * 100)} min={10} max={100}
            onChange={v => set('opacity', v / 100)} unit="%" />
          {/* Highlight */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">پس‌زمینه (Highlight)</p>
              {active.textBackgroundColor && (
                <button onClick={() => set('textBackgroundColor', null)}
                  className="text-[11px] text-red-400 hover:text-red-600">حذف</button>
              )}
            </div>
            <PickerRow label="انتخاب رنگ" value={active.textBackgroundColor || '#ffffff'}
              onChange={v => set('textBackgroundColor', v)} />
          </div>
        </div>
      );

      case 'effects': return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">رنگ سایه</p>
            <PickerRow label="" value={active.shadowColor} onChange={v => set('shadowColor', v)} />
          </div>
          <Knob label="محوی (Blur)" value={active.shadowBlur || 0} min={0} max={60}
            onChange={v => set('shadowBlur', v)} />
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="افقی X" value={active.shadowOffsetX || 0}
              onChange={v => set('shadowOffsetX', v)} min={-50} max={50} />
            <NumInput label="عمودی Y" value={active.shadowOffsetY || 0}
              onChange={v => set('shadowOffsetY', v)} min={-50} max={50} />
          </div>
        </div>
      );

      case 'transform': return (
        <div className="space-y-3">
          <Knob label="چرخش" value={active.angle ?? 0} min={-180} max={180}
            onChange={v => set('angle', v)} unit="°" />
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="مقیاس X" value={Math.round((active.scaleX ?? 1) * 100)}
              onChange={v => set('scaleX', v / 100)} min={10} max={500} />
            <NumInput label="مقیاس Y" value={Math.round((active.scaleY ?? 1) * 100)}
              onChange={v => set('scaleY', v / 100)} min={10} max={500} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="موقعیت X" value={Math.round(active.previewLeft ?? 150)}
              onChange={v => set('previewLeft', v)} min={0} max={300} />
            <NumInput label="موقعیت Y" value={Math.round(active.previewTop ?? 150)}
              onChange={v => set('previewTop', v)} min={0} max={300} />
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">

      {/* ══ پریویو ══════════════════════════════════════════════ */}
      <div className="relative shrink-0 mx-auto w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-lg my-3 bg-slate-200">
        <LivePreviewCanvas
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={handleSelectLayer}
          onUpdateLayer={handleCanvasUpdate}
        />

        {/* نوار لایه‌ها روی پریویو */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-2 py-2 bg-black/50 backdrop-blur-sm">
          <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
            {layers.map(l => (
              <button key={l.id} onClick={() => handleSelectLayer(l.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all max-w-[80px] truncate
                  ${l.id === activeLayerId
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'}`}>
                {l.text || '(خالی)'}
              </button>
            ))}
          </div>
          <button onClick={addLayer}
            className="shrink-0 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">
            <Plus size={14} />
          </button>
          {activeLayerId && (
            <button onClick={removeActive}
              className="shrink-0 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ══ Panel ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden mx-3 mb-3 rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* تب‌های panel */}
        <div className="flex items-center gap-1 px-2 py-2 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <PanelTab id="text"      active={panel==='text'}      icon={Type}      label="متن"       onClick={p => { setPanel(p); setPanelOpen(true); }} />
          <PanelTab id="style"     active={panel==='style'}     icon={Palette}   label="رنگ"       onClick={p => { setPanel(p); setPanelOpen(true); }} />
          <PanelTab id="effects"   active={panel==='effects'}   icon={Sparkles}  label="افکت"      onClick={p => { setPanel(p); setPanelOpen(true); }} />
          <PanelTab id="transform" active={panel==='transform'} icon={RotateCw}  label="تبدیل"     onClick={p => { setPanel(p); setPanelOpen(true); }} />
          <button onClick={() => setPanelOpen(p => !p)}
            className="mr-auto p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
            {panelOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>

        {/* محتوای panel */}
        {panelOpen && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {renderPanel()}
          </div>
        )}
      </div>

      {/* ══ Footer ══════════════════════════════════════════════ */}
      <div className="shrink-0 px-3 pb-3 flex gap-2">
        <button onClick={onDelete}
          className="flex-1 py-3 rounded-xl text-red-500 bg-red-50 font-semibold text-sm hover:bg-red-100 active:scale-95 transition-all">
          پاک کردن
        </button>
        <button onClick={() => onSave({ layers })}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
          <Check size={16} /> ثبت
        </button>
      </div>

    </div>
  );
};

export default TextEditorTab;