import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Palette, Type, LayoutGrid, BrickWall, Layers,
  X, Hexagon, Circle, Square,
} from 'lucide-react';
import useAppStore from '../../../store/useAppStore';
import ImageUploadTab  from './Tabs/ImageUploadTab';
import ColorTab        from './Tabs/ColorTab';
import TextEditorTab   from '../TextEditorTab';
import StockImagesTab  from './Tabs/StockImagesTab.jsx';
import TextureTab      from './Tabs/TextureTab';
import CoatingTab      from './Tabs/CoatingTab';

const TABS = [
  { id: 'upload',  label: 'آپلود',   icon: ImageIcon  },
  { id: 'stock',   label: 'گالری',   icon: LayoutGrid },
  { id: 'texture', label: 'تکسچر',   icon: BrickWall  },
  { id: 'coating', label: 'روکش',    icon: Layers     },
  { id: 'color',   label: 'رنگ',     icon: Palette    },
  { id: 'text',    label: 'متن',     icon: Type       },
];

const SHAPE_ICON  = { hex: Hexagon, circle: Circle, square: Square };
const SHAPE_LABEL = { hex: 'شش‌ضلعی', circle: 'دایره', square: 'مربع' };

const TileEditModal = () => {
  const isOpen         = useAppStore(s => s.isModalOpen);
  const activeTab      = useAppStore(s => s.activeTab);
  const setActiveTab   = useAppStore(s => s.setActiveTab);
  const editingTileId  = useAppStore(s => s.editingTileId);
  const updateTileText = useAppStore(s => s.updateTileText);
  const setTileImage   = useAppStore(s => s.setTileImage);
  const currentTile    = useAppStore(s => s.tiles.find(t => t.id === editingTileId));

  const [stockSrc, setStockSrc] = useState(null);

  const close = () => {
    useAppStore.setState({ isModalOpen: false, editingTileId: null });
    setTimeout(() => setStockSrc(null), 300);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !currentTile) return null;

  const ShapeIcon = SHAPE_ICON[currentTile.shape] ?? Hexagon;

  const handleSaveText  = data => { updateTileText(editingTileId, data); close(); };
  const handleCoating   = c    => { if (c.textureUrl) { setTileImage(editingTileId, c.textureUrl); close(); } };
  const handlePickStock = url  => { setStockSrc(url); setActiveTab('upload'); };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      {/* ═══════ مودال: سفید، گوشه تیز، بدون سایه ═══════ */}
      <div className="
        relative bg-white flex flex-col overflow-hidden
        w-full h-[92dvh] sm:min-h-[92vh]
        md:w-[850px] md:h-[680px]
      ">

        {/* ── هدر + نوار تب (یکه‌پیوسته مثل مرجع) ──
            نکته: border-b حذف شده تا تب فعال بدون فاصله به محتوای سفید وصل بشه */}
        <div className="shrink-0 bg-[#F5F5F5]" dir='rtl'>
          <div className="flex items-center justify-between pt-1 pb-0">
            {/* سمت چپ: آیکون شکل + عنوان */}

          </div>

          {/* ردیف تب‌ها — تب فعال بیرون می‌زنه: بوردر تاپ نارنجی + پس‌زمینه سفید
              و بدون بوردر پایین تا با محتوای سفید پایین یکی بشه (حس جزوه) */}
          <div className="flex gap-0 px-4 overflow-x-auto no-scrollbar relative overflow-hidden">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-1.5 px-6 py-2.5 text-[15px] font-medium whitespace-nowrap
                    transition-colors -mb-px
                    ${active
                      // تب فعال: پس‌زمینه سفید، بوردر تاپ + چپ + راست (بدون پایین)
                      // تا با محتوای سفید زیرش یکی بشه و حس «بیرون زدن» بده
                      ? 'bg-white text-[#FF6B35] border-t-2 border-x border-[#E0E0E0] border-t-[#FF6B35] rounded-t-sm'
                      // تب غیرفعال: شفاف روی پس‌زمینه خاکستری نوار، بدون بوردر
                      : 'bg-transparent text-[#666] hover:text-[#333] border-t-2 border-transparent'}
                  `}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── محتوای تب — پس‌زمینه سفید، بوردر تاپ حذف شده (تب فعال ادامه‌اش) ── */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full overflow-y-auto p-5 md:p-6">
            {activeTab === 'upload'  && <ImageUploadTab tile={currentTile} externalImageSrc={stockSrc} />}
            {activeTab === 'stock'   && <StockImagesTab onSelectImage={handlePickStock} tile={currentTile} />}
            {activeTab === 'texture' && <TextureTab onSelectTexture={handlePickStock} tile={currentTile} />}
            {activeTab === 'coating' && <CoatingTab activeCoatingId={null} onSelectCoating={handleCoating} />}
            {activeTab === 'color'   && <ColorTab tile={currentTile} />}
            {activeTab === 'text'    && (
              <TextEditorTab
                savedTextConfig={currentTile.textConfig}
                onSave={handleSaveText}
                onDelete={() => { updateTileText(editingTileId, null); close(); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TileEditModal;
