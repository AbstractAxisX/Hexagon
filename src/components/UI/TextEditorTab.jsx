import React, { useState, useEffect } from 'react';
import LivePreviewCanvas from './EditModal/LivePreviewCanvas';
import useAppStore from '../../store/useAppStore'; 
import { 
    TrashIcon, 
    CheckIcon, 
    PlusIcon, 
    ChevronUpIcon, 
    ChevronDownIcon, 
    SwatchIcon, 
    LanguageIcon as Type, // آیکون واقعی LanguageIcon را به نام Type تغییر نام دادیم
    Square2StackIcon as CubeIcon, // آیکون Square2StackIcon را به نام CubeIcon تغییر نام دادیم
    SparklesIcon 
} from '@heroicons/react/24/outline';
const FONTS = ['Vazirmatn', 'Arial', 'Tahoma', 'Times New Roman', 'Impact'];
const COLORS = ['#000000', '#FFFFFF', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const TextEditorTab = ({ savedTextConfig, onSave, onDelete }) => {
  const mainCanvas = useAppStore(state => state.fabricCanvas);
  const editingTileId = useAppStore(state => state.editingTileId);
  
  // استیت لایه‌ها
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  
  // استیت برای مدیریت بخش‌های آکاردئونی (پیش‌فرض بخش متن باز است)
  const [openSection, setOpenSection] = useState('text'); // 'layers', 'text', 'style', 'effects'

  // لود دیتا
  useEffect(() => {
    if (savedTextConfig && savedTextConfig.layers) {
        setLayers(savedTextConfig.layers);
        if (savedTextConfig.layers.length > 0) {
            setActiveLayerId(savedTextConfig.layers[savedTextConfig.layers.length - 1].id);
        }
    } else {
        addLayer();
    }
  }, [savedTextConfig]);

  // --- Layer Logic ---
  const addLayer = () => {
    const newLayer = {
        id: Date.now(),
        text: 'متن جدید',
        fontSize: 24,
        fontFamily: 'Vazirmatn',
        fill: '#000000',
        stroke: null,
        strokeWidth: 0,
        textBackgroundColor: null,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        previewLeft: 150, 
        previewTop: 150
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setOpenSection('text'); // بعد از ساخت، برو روی ادیت متن
  };

  const removeLayer = (id) => {
      setLayers(prev => prev.filter(l => l.id !== id));
      if (activeLayerId === id) setActiveLayerId(null);
  };

  const updateActiveLayer = (key, value) => {
      if (!activeLayerId) return;
      setLayers(prev => prev.map(l => 
          l.id === activeLayerId ? { ...l, [key]: value } : l
      ));
  };

  const handleCanvasUpdate = (id, newProps) => {
      setLayers(prev => prev.map(l => 
          l.id === id ? { ...l, ...newProps } : l
      ));
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // --- UI Components ---
  const SectionHeader = ({ id, title, icon: Icon }) => (
      <button 
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${openSection === id ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-600 border border-slate-100'}`}
      >
          <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5" />}
              <span className="font-bold text-sm">{title}</span>
          </div>
          {openSection === id ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
      </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* 1. Preview Area (Fixed Top / Flexible on Desktop) */}
      <div className="relative w-full aspect-square max-h-[300px] bg-slate-200 mx-auto rounded-xl overflow-hidden shadow-inner my-2 shrink-0">
         <LivePreviewCanvas 
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={(id) => { setActiveLayerId(id); setOpenSection('text'); }}
            onUpdateLayer={handleCanvasUpdate}
         />
         <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
           Live Preview
         </div>
      </div>

      {/* 2. Scrollable Controls Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-20 space-y-2">
        
        {/* SECTION: Layers Manager */}
        <SectionHeader id="layers" title="مدیریت لایه‌ها" icon={CubeIcon} />
        {openSection === 'layers' && (
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-fadeIn">
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                    {layers.slice().reverse().map(layer => (
                        <div 
                            key={layer.id}
                            onClick={() => setActiveLayerId(layer.id)}
                            className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer touch-manipulation ${activeLayerId === layer.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-100'}`}
                        >
                            <span className="text-sm font-medium truncate w-3/4">{layer.text}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={addLayer} className="mt-3 w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2">
                    <PlusIcon className="w-5 h-5"/> لایه جدید
                </button>
            </div>
        )}

        {/* Check if active layer exists for editing controls */}
        {activeLayer ? (
            <>
                {/* SECTION: Text Content */}
                <SectionHeader id="text" title="متن و محتوا" icon={Type} />
                {openSection === 'text' && (
                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-fadeIn">
                        <textarea 
                            value={activeLayer.text}
                            onChange={(e) => updateActiveLayer('text', e.target.value)}
                            className="w-full p-3 border-2 border-slate-200 rounded-xl text-base focus:border-blue-500 outline-none min-h-[80px] resize-none"
                            placeholder="اینجا بنویسید..."
                        />
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <select 
                                value={activeLayer.fontFamily}
                                onChange={(e) => updateActiveLayer('fontFamily', e.target.value)}
                                className="p-3 bg-slate-100 rounded-xl text-sm outline-none"
                            >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="flex items-center bg-slate-100 rounded-xl px-3">
                                <span className="text-xs text-slate-500 mr-2">S</span>
                                <input 
                                    type="number" 
                                    value={activeLayer.fontSize}
                                    onChange={(e) => updateActiveLayer('fontSize', parseInt(e.target.value))}
                                    className="w-full bg-transparent py-3 text-sm outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION: Style (Color & Stroke) */}
                <SectionHeader id="style" title="رنگ و استایل" icon={SwatchIcon} />
                {openSection === 'style' && (
                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-fadeIn space-y-4">
                        {/* Text Color */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-2 block">رنگ متن</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => updateActiveLayer('fill', c)}
                                        className={`w-10 h-10 rounded-full border shadow-sm ${activeLayer.fill === c ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <div className="relative w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    <input type="color" className="absolute opacity-0 w-full h-full" onChange={(e) => updateActiveLayer('fill', e.target.value)} />
                                    <PlusIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Stroke */}
                        <div className="pt-3 border-t">
                             <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400">دورخط (Stroke)</label>
                                <input 
                                    type="color" 
                                    value={activeLayer.stroke || '#000000'}
                                    onChange={(e) => updateActiveLayer('stroke', e.target.value)}
                                    className="w-8 h-8 rounded-lg border-none"
                                />
                             </div>
                             <input 
                                type="range" min="0" max="5" step="0.1"
                                value={activeLayer.strokeWidth || 0}
                                onChange={(e) => updateActiveLayer('strokeWidth', parseFloat(e.target.value))}
                                className="w-full h-6 accent-blue-600"
                             />
                        </div>

                        {/* Background */}
                        <div className="pt-3 border-t">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">رنگ پس‌زمینه (Highlight)</label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="color" 
                                    value={activeLayer.textBackgroundColor || '#ffffff'}
                                    onChange={(e) => updateActiveLayer('textBackgroundColor', e.target.value)}
                                    className="w-10 h-10 rounded-lg border-none"
                                />
                                {activeLayer.textBackgroundColor && (
                                    <button onClick={() => updateActiveLayer('textBackgroundColor', null)} className="text-xs text-red-500 border border-red-200 px-3 py-2 rounded-lg">حذف</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION: Effects (Shadow) */}
                <SectionHeader id="effects" title="سایه و افکت" icon={SparklesIcon} />
                {openSection === 'effects' && (
                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-fadeIn space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-400">رنگ سایه</label>
                            <input type="color" value={activeLayer.shadowColor || '#000000'} onChange={(e) => updateActiveLayer('shadowColor', e.target.value)} className="w-8 h-8 rounded-lg" />
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1"><span>محوی (Blur)</span><span>{activeLayer.shadowBlur}</span></div>
                            <input type="range" min="0" max="50" value={activeLayer.shadowBlur || 0} onChange={(e) => updateActiveLayer('shadowBlur', parseInt(e.target.value))} className="w-full h-6 accent-blue-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-slate-500 block mb-1">افقی X</span>
                                <input type="number" value={activeLayer.shadowOffsetX || 0} onChange={(e) => updateActiveLayer('shadowOffsetX', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-center" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block mb-1">عمودی Y</span>
                                <input type="number" value={activeLayer.shadowOffsetY || 0} onChange={(e) => updateActiveLayer('shadowOffsetY', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-center" />
                            </div>
                        </div>
                    </div>
                )}
            </>
        ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
                هیچ لایه‌ای انتخاب نشده است.<br/>برای ویرایش، یک لایه انتخاب کنید یا بسازید.
            </div>
        )}

      </div>
      
      {/* 3. Sticky Footer Actions */}
      <div className="sticky bottom-0 left-0 right-0 max-w-[40rem] rounded-2xl mx-4 mx-auto  bg-white border-t p-3 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
            <button onClick={onDelete} className="flex-1 py-3 text-red-500 bg-red-50 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                حذف متن
            </button>
            <button onClick={() => onSave({ layers })} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex justify-center items-center gap-2">
                <CheckIcon className="w-5 h-5"/> ثبت نهایی
            </button>
      </div>
    </div>
  );
};

export default TextEditorTab;