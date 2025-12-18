import React, { useState, useRef, useEffect } from 'react';
import { Settings, Plus, Layout, Palette, ChevronDown } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { TAILWIND_COLORS } from '../../data/tailwindColors'; // اطمینان از وجود این فایل

const Header = () => {
  const globalSettings = useAppStore(state => state.globalSettings);
  const setGlobalSetting = useAppStore(state => state.setGlobalSetting);
  const addTile = useAppStore(state => state.addTile);
  const wallColor = useAppStore(state => state.wallColor);
  const setWallColor = useAppStore(state => state.setWallColor);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm relative shrink-0">
      
      {/* === LOGO & TITLE === */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Layout size={20} />
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Modulari <span className="text-blue-600">Editor</span>
        </h1>
      </div>

      {/* === CENTER TOOLS (SHAPES) === */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 p-1 rounded-xl flex items-center">
        <ShapeBtn 
          active={globalSettings.shape === 'hex'} 
          onClick={() => setGlobalSetting('shape', 'hex')} 
          label="شش‌ضلعی"
          icon="⬡"
        />
        <ShapeBtn 
          active={globalSettings.shape === 'square'} 
          onClick={() => setGlobalSetting('shape', 'square')} 
          label="مربع"
          icon="▢"
        />
        <ShapeBtn 
          active={globalSettings.shape === 'circle'} 
          onClick={() => setGlobalSetting('shape', 'circle')} 
          label="دایره"
          icon="●"
        />
      </div>

      {/* === RIGHT ACTIONS === */}
      <div className="flex items-center gap-3">
        
        {/* SETTINGS DROPDOWN (WALL COLOR) */}
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isSettingsOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">تنظیمات</span>
            <ChevronDown size={14} className={`transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Body */}
          {isSettingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="mb-2 flex items-center gap-2 text-slate-700 font-bold text-sm">
                <Palette size={16} />
                رنگ پس‌زمینه ادیتور
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {/* چند رنگ منتخب از فایل رنگ‌ها برای دسترسی سریع */}
                {['#f8fafc', '#f1f5f9', '#e2e8f0', '#fee2e2', '#dbeafe', '#dcfce7', '#1a1a1a'].map(color => (
                  <button
                    key={color}
                    onClick={() => setWallColor(color)}
                    className={`w-8 h-8 rounded-full border border-slate-200 shadow-sm hover:scale-110 transition-transform ${wallColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* ADD BUTTON */}
        <button
          onClick={() => addTile()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>افزودن کاشی</span>
        </button>
      </div>
    </header>
  );
};

// دکمه‌های انتخاب شکل
const ShapeBtn = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
      ${active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
      }
    `}
  >
    <span className="text-lg leading-none">{icon}</span>
    {label}
  </button>
);

export default Header;