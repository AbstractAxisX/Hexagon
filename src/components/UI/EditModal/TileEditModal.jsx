import React from 'react';
import { Image as ImageIcon, Palette, Type } from 'lucide-react';
import useAppStore from '../../../store/useAppStore'; // مسیر ایمپورت را چک کنید

// Components
import ModalHeader from './ModalHeader'; 
import ImageUploadTab from './Tabs/ImageUploadTab';
import ColorTab from './Tabs/ColorTab';
import TextEditorTab from '../TextEditorTab'; // ✅ فرض بر این است که فایل را اینجا ساختید

const TileEditModal = () => {
  const isOpen = useAppStore(state => state.isModalOpen);
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const editingTileId = useAppStore(state => state.editingTileId);
  const updateTileContent = useAppStore(state => state.updateTileContent); // ✅ نیاز داریم برای ذخیره

  const currentTile = useAppStore(state => 
    state.tiles.find(t => t.id === editingTileId)
  );

  const handleClose = () => {
    useAppStore.setState({ isModalOpen: false, editingTileId: null });
  };

  if (!isOpen || !currentTile) return null;

  const tabs = [
    { id: 'upload', label: 'تصویر', icon: ImageIcon },
    { id: 'color', label: 'رنگ و طرح', icon: Palette },
    { id: 'text', label: 'متن', icon: Type }, // ✅ تب متن فعال شد
  ];

  // هندل کردن ذخیره متن
  const handleSaveText = (textData) => {
    updateTileContent(editingTileId, 'text', textData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* ✅ پراپ onClose اضافه شد تا ModalHeader بتواند پنجره را ببندد */}
        <ModalHeader tile={currentTile} onClose={handleClose} />

        {/* نوار تب‌ها */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 pt-3 flex items-end gap-1 select-none shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] z-10 -mb-px border-t border-x border-slate-200' 
                  : 'bg-slate-200/60 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-transparent'
                }
              `}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* محتوای اصلی */}
        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[400px]">
          {activeTab === 'upload' && (
            <ImageUploadTab tile={currentTile} />
          )}
          
          {activeTab === 'color' && (
            <ColorTab tile={currentTile} />
          )}

          {/* ✅ اضافه شدن تب متن */}
          {activeTab === 'text' && (
             <TextEditorTab 
               initialContent={currentTile.content?.type === 'text' ? currentTile.content.data.jsonContent : undefined}
               onSave={handleSaveText}
               onCancel={handleClose}
             />
          )}
        </div>

      </div>
    </div>
  );
};

export default TileEditModal;