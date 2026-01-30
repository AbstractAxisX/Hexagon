import React from 'react';
import { Palette, X, Box } from 'lucide-react'; // آیکون Box برای گوشه اضافه شد
import useAppStore from '../../store/useAppStore';
import { APP_CONFIG } from '../../data/appConfig';

const SettingsModal = () => {
  const isOpen = useAppStore(state => state.isSettingsOpen);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  
  // تنظیمات رنگ دیوار
  const wallColor = useAppStore(state => state.wallColor);
  const setWallColor = useAppStore(state => state.setWallColor);

  // ✅ تنظیمات گلوبال (برای گوشه)
  const globalSettings = useAppStore(state => state.globalSettings);
  const setGlobalSetting = useAppStore(state => state.setGlobalSetting);

  if (!isOpen) return null;

  // لیست رنگ‌ها
  const colors = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#fee2e2', '#dbeafe', '#dcfce7', '#1a1a1a'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
       {/* لایه پس‌زمینه تیره */}
       <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setSettingsOpen(false)} 
      />

      {/* باکس مودال */}
      <div className={`
        relative bg-white flex flex-col shadow-2xl overflow-hidden
        w-full rounded-t-2xl pb-safe md:w-[480px] md:rounded-2xl transition-all
        animate-in slide-in-from-bottom-10 duration-300
      `}>
        
        {/* هدر مودال */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h2 className="text-lg font-bold text-slate-800">تنظیمات طراحی</h2>
           <button 
             onClick={() => setSettingsOpen(false)} 
             className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        {/* محتوای تنظیمات */}
        <div className="p-6 space-y-8">
           
           {/* بخش ۱: گوشه‌های شکل (جدید) */}
           <div>
             <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
               <Box size={18} />
               حالت گوشه‌ها
             </label>
             <div className="bg-slate-100 p-1.5 rounded-xl flex gap-2">
               {APP_CONFIG.corners.map(opt => {
                 const isActive = globalSettings.corner === opt.id;
                 return (
                   <button
                     key={opt.id}
                     onClick={() => setGlobalSetting('corner', opt.id)}
                     className={`
                       flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                       flex items-center justify-center gap-2
                       ${isActive 
                         ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                         : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                       }
                     `}
                   >
                     {/* نمایش بصری ساده برای تیز و گرد */}
                     <span className={`w-3 h-3 border-2 border-current ${opt.id === 'rounded' ? 'rounded-full' : 'rounded-none'}`} />
                     {opt.name}
                   </button>
                 );
               })}
             </div>
             <p className="text-xs text-slate-400 mt-2 px-1">
               این تنظیم روی تمام کاشی‌های شش‌ضلعی و مربعی اعمال می‌شود.
             </p>
           </div>

           <div className="w-full h-px bg-slate-100" />

           {/* بخش ۲: رنگ پس‌زمینه */}
           <div>
             <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
               <Palette size={18} />
               رنگ پس‌زمینه بوم
             </label>
             <div className="grid grid-cols-7 gap-3">
               {colors.map(color => (
                 <button
                   key={color}
                   onClick={() => setWallColor(color)}
                   className={`
                     w-10 h-10 rounded-full border border-slate-200 shadow-sm transition-all
                     ${wallColor === color 
                       ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' 
                       : 'hover:scale-110 hover:shadow-md'
                     }
                   `}
                   style={{ backgroundColor: color }}
                   title={color}
                 />
               ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;