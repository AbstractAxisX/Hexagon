import React, { useState, useRef, useEffect } from 'react';
import { X, MoreVertical, Palette, Settings, Image as ImageIcon } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';

const ModalHeader = ({ tile }) => {
  const closeEditModal = useAppStore(state => state.closeEditModal);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // بستن منو وقتی بیرونش کلیک میشه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (tabName) => {
    setActiveTab(tabName);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white relative z-50">
      
      {/* سمت راست: اطلاعات تایل */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">تنظیمات تایل</h2>
          <p className="text-xs text-slate-500 font-mono">
            ID: {tile.id.slice(0, 8)} • {tile.shape === 'hex' ? 'شش‌ضلعی' : tile.shape === 'square' ? 'مربع' : 'دایره'}
          </p>
        </div>
      </div>

      {/* سمت چپ: ابزارها و بستن */}
      <div className="flex items-center gap-2">
        
        {/* Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-slate-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
            title="ابزارها و تنظیمات"
          >
            <MoreVertical size={20} />
          </button>

          {/* منوی بازشونده */}
          {isMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <p className="text-xs font-bold text-slate-400 px-3 py-2">ابزارهای ویرایش</p>
                
                <button 
                  onClick={() => handleMenuAction('upload')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-right"
                >
                  <ImageIcon size={16} />
                  تغییر تصویر
                </button>

                <button 
                  onClick={() => handleMenuAction('color')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-right"
                >
                  <Palette size={16} />
                  تغییر رنگ پس‌زمینه
                </button>
                
                {/* اینجا می‌تونید ابزارهای آینده رو اضافه کنید */}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        <button 
          onClick={closeEditModal}
          className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
          title="بستن"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;