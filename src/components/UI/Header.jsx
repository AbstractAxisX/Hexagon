import React from 'react'; // useRef و useState و useEffect حذف شدند چون دیگر نیاز نیستند
import { Settings, Plus, Layout } from 'lucide-react'; // Palette و ChevronDown حذف شدند
import useAppStore from '../../store/useAppStore';

const Header = () => {
  const globalSettings = useAppStore(state => state.globalSettings);
  const setGlobalSetting = useAppStore(state => state.setGlobalSetting);
  const addTile = useAppStore(state => state.addTile);
  
  // ✅ فقط متد باز کردن مودال را می‌گیریم
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm relative shrink-0">
      
      {/* === LOGO === */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Layout size={20} />
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Modulari <span className="text-blue-600">Editor</span>
        </h1>
      </div>

      {/* === CENTER TOOLS === */}
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
        
        {/* SETTINGS BUTTON (Updated) */}
        <button 
          onClick={() => setSettingsOpen(true)} // ✅ باز کردن مودال مرکزی
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">تنظیمات</span>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        <button
          onClick={() => addTile()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>افزودن کاشی</span>
        </button>
      </div>
    </header>
  );
};

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