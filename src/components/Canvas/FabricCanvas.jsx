import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric'; // ✅ ایمپورت فابریک اضافه شد
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel } from '../../utils/hexMath';
import { squareToPixel } from '../../utils/squareMath';

// Components
import TrashZone from '../UI/TrashZone';

// Hooks
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useGhostManager } from './hooks/useGhostManager';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useCameraController } from './hooks/useCameraController';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const containerRef = useRef(null);
  const trashRef = useRef(null);

  const [isTrashHovered, setTrashHovered] = useState(false);

  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const globalSettings = useAppStore(state => state.globalSettings);

  // 1. Setup
  const fabricRef = useCanvasSetup(canvasEl, containerRef, wallColor);

  // 2. Managers
  const ghostManager = useGhostManager(fabricRef);
  
  // 3. Events
  useCanvasEvents(fabricRef, ghostManager, trashRef, setTrashHovered);

  // 4. Camera
  const { updateCamera } = useCameraController(fabricRef, tiles, viewMode, focusedTileId);

  // 5. Sync Tiles (بخش اصلی تغییر کرده برای نمایش متن)
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // پاک کردن اشیاء قدیمی (به جز Ghostها)
    canvas.getObjects().forEach(o => {
      if (o.type !== 'ghost') canvas.remove(o);
    });

    tiles.forEach(tileData => {
      let pos;
      if (tileData.shape === 'hex') {
        pos = hexToPixel(tileData.q, tileData.r, 0, 0);
      } else {
        pos = squareToPixel(tileData.x, tileData.y, 0, 0);
      }

      // ساخت کاشی
      const tileObj = TileFactory.create(tileData, pos, tileData.shape, canvas);

      if (tileObj) {
        // ============================================================
        // ✅ بخش جدید: اگر کاشی دارای متن بود، آن را لود و ماسک کن
        // ============================================================
        if (tileData.content?.type === 'text' && tileData.content.data?.imageSrc) {
          const { imageSrc } = tileData.content.data;

          fabric.Image.fromURL(imageSrc, (img) => {
            // تنظیمات تصویر متن
            img.set({
              originX: 'center',
              originY: 'center',
              scaleX: 0.5, // سایز متن نسبت به شکل
              scaleY: 0.5,
              left: 0, // چون داخل گروه است، نسبت به مرکز گروه 0 میشود
              top: 0
            });

            // 🎯 ایجاد ماسک (Clipping)
            // شکل اصلی کاشی اولین آیتم داخل گروه است (index 0)
            const baseShape = tileObj.getObjects()[0];

            if (baseShape) {
              // باید از شکل یک کپی بگیریم تا به عنوان clipPath استفاده شود
              baseShape.clone((clonedShape) => {
                clonedShape.set({
                  originX: 'center',
                  originY: 'center',
                  left: 0,
                  top: 0,
                  absolutePositioned: false 
                });

                // اعمال ماسک روی تصویر متن
                img.clipPath = clonedShape;

                // اضافه کردن تصویر متن به گروه کاشی
                tileObj.add(img);

                // رندر مجدد برای نمایش تغییرات
                canvas.requestRenderAll();
              });
            }
          });
        }
        // ============================================================

        canvas.add(tileObj);
      }
    });

    setTimeout(() => updateCamera(), 50);

  }, [tiles, wallColor, globalSettings.shape]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
      
      <TrashZone ref={trashRef} isHovered={isTrashHovered} />
    </div>
  );
};

export default FabricCanvas;