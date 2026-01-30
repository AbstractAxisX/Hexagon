import React from 'react';
import { Palette, X, Settings } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const SettingsModal = () => {
  const isOpen = useAppStore(state => state.isSettingsOpen);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const wallColor = useAppStore(state => state.wallColor);
  const setWallColor = useAppStore(state => state.setWallColor);

  if (!isOpen) return null;

  // لیست رنگ‌ها (می‌تواند بعداً از API بیاید)
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
        
        /* 📱 Mobile: چسبیده به پایین */
        w-full rounded-t-2xl pb-safe
        
        /* 💻 Desktop: وسط صفحه و گرد */
        md:w-[450px] md:rounded-2xl
        
        animate-in slide-in-from-bottom-10 fade-in duration-200
      `}>
        {/* هدر مودال */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-2 font-bold text-slate-700">
             <Settings size={20} className="text-blue-600" />
             <span>تنظیمات سیستم</span>
           </div>
           <button 
             onClick={() => setSettingsOpen(false)} 
             className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        {/* محتوای تنظیمات */}
        <div className="p-6 space-y-6">
           
           {/* بخش ۱: رنگ پس‌زمینه */}
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

           {/* در آینده می‌توانید بخش‌های دیگر (مثل تم تاریک، زبان و ...) را اینجا اضافه کنید */}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;