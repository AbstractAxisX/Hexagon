import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Palette, Type, LayoutGrid, BrickWall, Layers, X, Hexagon, Circle, Square } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';
import ImageUploadTab  from './Tabs/ImageUploadTab';
import ColorTab        from './Tabs/ColorTab';
import TextEditorTab   from '../TextEditorTab';
import StockImagesTab  from './Tabs/StockImagesTab.jsx';
import TextureTab      from './Tabs/TextureTab';
import CoatingTab      from './Tabs/CoatingTab';

const TABS = [
  { id: 'upload',  label: 'آپلود',        icon: ImageIcon  },
  { id: 'stock',   label: 'گالری',        icon: LayoutGrid },
  { id: 'texture', label: 'تکسچر',        icon: BrickWall  },
  { id: 'coating', label: 'روکش',         icon: Layers     },
  { id: 'color',   label: 'رنگ',          icon: Palette    },
  { id: 'text',    label: 'متن',          icon: Type       },
];

const SHAPE_ICON = { hex: Hexagon, circle: Circle, square: Square };
const SHAPE_LABEL = { hex: 'شش‌ضلعی', circle: 'دایره', square: 'مربع' };

const TileEditModal = () => {
  const isOpen        = useAppStore(s => s.isModalOpen);
  const activeTab     = useAppStore(s => s.activeTab);
  const setActiveTab  = useAppStore(s => s.setActiveTab);
  const editingTileId = useAppStore(s => s.editingTileId);
  const updateTileText = useAppStore(s => s.updateTileText);
  const setTileImage  = useAppStore(s => s.setTileImage);
  const currentTile   = useAppStore(s => s.tiles.find(t => t.id === editingTileId));

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

  const handleSaveText     = data  => { updateTileText(editingTileId, data); close(); };
  const handleCoating      = c     => { if (c.textureUrl) { setTileImage(editingTileId, c.textureUrl); close(); } };
  const handlePickStock    = url   => { setStockSrc(url); setActiveTab('upload'); };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div className="
        relative bg-[#0f1117] flex flex-col shadow-2xl overflow-hidden
        w-full h-[90dvh] sm:min-h-[90vh] rounded-t-3xl
        md:w-[680px] md:h-[680px] md:rounded-2xl
        border border-white/10
        animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-250
      ">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ShapeIcon size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none">ویرایش کاشی</p>
            <p className="text-xs text-white/30 mt-0.5 font-mono">{SHAPE_LABEL[currentTile.shape] ?? '—'} · {currentTile.id?.slice(0,8)}</p>
          </div>
          <button onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="shrink-0 flex gap-1 px-4 pt-3 pb-0 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-medium whitespace-nowrap
                  border-t border-x transition-all
                  ${active
                    ? 'bg-white text-slate-800 border-white/20 shadow-sm -mb-px relative z-10'
                    : 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5'
                  }
                `}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden bg-white rounded-t-2xl">
          <div className="h-full overflow-y-auto p-4 md:p-5">
            {activeTab === 'upload'  && <ImageUploadTab tile={currentTile} externalImageSrc={stockSrc} />}
            {activeTab === 'stock'   && <StockImagesTab onSelectImage={handlePickStock} />}
            {activeTab === 'texture' && <TextureTab onSelectTexture={handlePickStock} />}
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