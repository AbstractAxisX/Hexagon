import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Palette, Type, LayoutGrid,BrickWall,Layers  } from 'lucide-react'; // LayoutGrid آیکون مناسب برای گالری
import useAppStore from '../../../store/useAppStore';

// Components
import ModalHeader from './ModalHeader'; 
import ImageUploadTab from './Tabs/ImageUploadTab';
import ColorTab from './Tabs/ColorTab';
import TextEditorTab from '../TextEditorTab';
import StockImagesTab from './Tabs/StockImagesTab.jsx'; 
import TextureTab from './Tabs/TextureTab';
import CoatingTab from './Tabs/CoatingTab';


const TileEditModal = () => {
  const isOpen = useAppStore(state => state.isModalOpen);
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const editingTileId = useAppStore(state => state.editingTileId);
  const updateTileText = useAppStore(state => state.updateTileText); 
  const setTileImage = useAppStore(state => state.setTileImage);

  const currentTile = useAppStore(state => 
    state.tiles.find(t => t.id === editingTileId)
  );

  // ✅ استیت محلی برای انتقال عکس از تب گالری به تب آپلود
  const [selectedStockImage, setSelectedStockImage] = useState(null);

  const handleClose = () => {
    useAppStore.setState({ isModalOpen: false, editingTileId: null });
    // پاکسازی استیت هنگام بسته شدن برای جلوگیری از باگ در باز شدن بعدی
    setTimeout(() => setSelectedStockImage(null), 300);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // تصویر های اماده سایت
  const handleSelectImageSource = (url) => {
    setSelectedStockImage(url);
    setActiveTab('upload'); // سوئیچ به تب کراپ
  };

  // ✅ هندلر جدید اختصاصی برای روکش‌ها (Coating)
  // این تابع بدون پرسش سایز، مستقیماً اعمال می‌کند
  const handleAutoApplyCoating = (coating) => {
    if (coating.textureUrl) {
      // ذخیره مستقیم URL یا دیتای مربوط به روکش
      // نکته: ما اینجا URL را پاس میدهیم. فابریک باید بتواند این URL را لود کند.
      setTileImage(editingTileId, coating.textureUrl);
      
      // آپشنال: اگر بخواهید نوع روکش هم در دیتای تایل ذخیره شود برای قیمت دهی:
      // useAppStore.setState(state => ({
      //   tiles: state.tiles.map(t => t.id === editingTileId ? { ...t, coatingId: coating.id } : t)
      // }));

      // بستن مودال بعد از انتخاب (چون کار تمام است)
      handleClose();
    }
  };

  // ✅ تابع هندلر: وقتی کاربر از گالری عکسی انتخاب کرد
  const handleSelectStockImage = (url) => {
    setSelectedStockImage(url); // عکس را ذخیره کن
    setActiveTab('upload');     // خودکار برو به تب آپلود/کراپ
  };

  // اگر تب تغییر کرد و کاربر رفت سراغ چیزی غیر از آپلود، عکس انتخابی موقت پاک شود بهتر است
  // اما اینجا نگه میداریم شاید بخواهد برگردد. مدیریت state به ImageUploadTab سپرده شده.

  if (!isOpen || !currentTile) return null;

  const currentCoatingId = null;

  const tabs = [
    { id: 'upload', label: 'آپلود', icon: ImageIcon },
    { id: 'stock', label: 'تصاویر سایت', icon: LayoutGrid },
    { id: 'texture', label: 'تکسچر', icon: BrickWall },
    { id: 'coating', label: 'روکش', icon: Layers },
    { id: 'color', label: 'رنگ و طرح', icon: Palette },
    { id: 'text', label: 'متن', icon: Type },
  ];

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

      {/* Main Container */}
      <div className={`
        relative bg-white flex flex-col shadow-2xl overflow-hidden
        w-full h-[100dvh] rounded-none
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
              <ImageUploadTab 
                tile={currentTile} 
                externalImageSrc={selectedStockImage} // ✅ ارسال عکس انتخابی
              />
            )}

            {/* ✅ رندر تب جدید */}
            {activeTab === 'stock' && (
              <StockImagesTab onSelectImage={handleSelectStockImage} />
            )}

{activeTab === 'texture' && (
              <TextureTab onSelectTexture={handleSelectImageSource} />
            )}

{activeTab === 'coating' && (
              <CoatingTab 
                activeCoatingId={currentCoatingId}
                onSelectCoating={handleAutoApplyCoating} 
              />
            )}
            
            {activeTab === 'color' && (
              <ColorTab tile={currentTile} />
            )}

            {activeTab === 'text' && (
               <TextEditorTab 
                 initialContent={currentTile.content?.type === 'text' ? currentTile.content.data.jsonContent : undefined}
                 savedTextConfig={currentTile.textConfig} 
                 onSave={handleSaveText}
                 onCancel={handleClose}
               />
            )}
          </div>
          
          <div className="h-20 md:hidden"></div>
        </div>

      </div>
    </div>
  );
};

export default TileEditModal;