import React, { useEffect } from 'react';
import { Image as ImageIcon, Palette, Type } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';

// Components
import ModalHeader from './ModalHeader'; 
import ImageUploadTab from './Tabs/ImageUploadTab';
import ColorTab from './Tabs/ColorTab';
import TextEditorTab from '../TextEditorTab';

const TileEditModal = () => {
  const isOpen = useAppStore(state => state.isModalOpen);
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const editingTileId = useAppStore(state => state.editingTileId);
  
  // ✅ بازگرداندن متد اختصاصی که شما در کد قدیمی داشتید
  const updateTileText = useAppStore(state => state.updateTileText); 

  const currentTile = useAppStore(state => 
    state.tiles.find(t => t.id === editingTileId)
  );

  const handleClose = () => {
    useAppStore.setState({ isModalOpen: false, editingTileId: null });
  };

  // جلوگیری از اسکرول بادی وقتی مودال باز است (UI Fix)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !currentTile) return null;

  const tabs = [
    { id: 'upload', label: 'تصویر', icon: ImageIcon },
    { id: 'color', label: 'رنگ و طرح', icon: Palette }, // لیبل کوتاه‌تر برای موبایل
    { id: 'text', label: 'متن', icon: Type },
  ];

  // ✅ لاجیک ذخیره دقیقا طبق کد قدیمی شما
  const handleSaveText = (textData) => {
    updateTileText(editingTileId, textData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose} 
      />

      {/* Main Container - UI جدید و موبایل فرندلی */}
      <div className={`
        relative bg-white flex flex-col shadow-2xl overflow-hidden
        
        /* 📱 Mobile Styles: تمام صفحه */
        w-full h-[100dvh] rounded-none
        
        /* 💻 Desktop Styles: سایز ثابت */
        md:w-[700px] md:h-[650px] md:rounded-2xl md:border md:border-slate-200
        
        animate-in zoom-in-95 duration-200
      `}>
        
        {/* Header Section */}
        <div className="shrink-0 z-10 bg-white">
          <ModalHeader tile={currentTile} onClose={handleClose} />
          
          {/* Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 pt-2 flex items-end gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm border-t border-x border-slate-200 -mb-px relative z-10' 
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                  }
                `}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 w-full relative">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-full p-4">
            {activeTab === 'upload' && (
              <ImageUploadTab tile={currentTile} />
            )}
            
            {activeTab === 'color' && (
              <ColorTab tile={currentTile} />
            )}

            {activeTab === 'text' && (
               <TextEditorTab 
                 initialContent={currentTile.content?.type === 'text' ? currentTile.content.data.jsonContent : undefined}
                 // ✅ بازگرداندن پراپ حیاتی برای کانفیگ متن
                 savedTextConfig={currentTile.textConfig} 
                 onSave={handleSaveText}
                 onCancel={handleClose}
               />
            )}
          </div>
          
          {/* Spacer for Mobile Scrolling */}
          <div className="h-20 md:hidden"></div>
        </div>

      </div>
    </div>
  );
};

export default TileEditModal;