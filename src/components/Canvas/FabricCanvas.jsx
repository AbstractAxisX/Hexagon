import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel } from '../../utils/hexMath';
import { squareToPixel } from '../../utils/squareMath';

// Components
import TrashZone from '../UI/TrashZone';

// Hooks
import { useGestures } from './hooks/useGestures'; 
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useGhostManager } from './hooks/useGhostManager';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useCameraController } from './hooks/useCameraController';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const containerRef = useRef(null);
  const trashRef = useRef(null);

  const [isTrashHovered, setTrashHovered] = useState(false);
  
  // ✅ استیت جدید برای اینکه بفهمیم بوم واقعا لود شده یا نه
  const [canvasInstance, setCanvasInstance] = useState(null);

  const setFabricCanvas = useAppStore(state => state.setFabricCanvas);
  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const globalSettings = useAppStore(state => state.globalSettings);

  // 1. Setup
  // ما تابع setCanvasInstance رو میفرستیم تا وقتی بوم ساخته شد پر بشه
  const fabricRef = useCanvasSetup(canvasEl, containerRef, wallColor, (canvas) => {
    setCanvasInstance(canvas);
    setFabricCanvas(canvas); // ثبت در استور
  });

  // 2. Managers
  const ghostManager = useGhostManager(fabricRef);
  
  // 3. Events
  useCanvasEvents(fabricRef, ghostManager, trashRef, setTrashHovered);

  // Gestures
  useGestures(fabricRef);

  // 4. Camera
  const { updateCamera } = useCameraController(fabricRef, tiles, viewMode, focusedTileId);
  

  // 5. Sync Tiles (Rendering Logic)
  // ✅ حالا به جای ref به canvasInstance وابسته هستیم که مطمئنیم مقدار داره
  useEffect(() => {
    if (!canvasInstance) return; 

    const canvas = canvasInstance;

    // پاکسازی بوم
    canvas.getObjects().forEach(o => {
      if (o.type !== 'ghost') canvas.remove(o);
    });

    // رسم تایل‌ها
    tiles.forEach(tileData => {
      let pos;
      if (tileData.shape === 'hex') {
        pos = hexToPixel(tileData.q, tileData.r, 0, 0);
      } else {
        // مطمئن میشیم تابع وجود داره
        pos = squareToPixel ? squareToPixel(tileData.x, tileData.y, 0, 0) : {x:0, y:0};
      }

      // ✅ اعمال تنظیمات گوشه گرد
      const effectiveTileData = {
        ...tileData,
        corner: globalSettings.corner 
      };

      const tileObj = TileFactory.create(effectiveTileData, pos, tileData.shape, canvas);

      if (tileObj) {
        // هندل کردن عکس و متن
        if (tileData.content?.type === 'text' && tileData.content.data?.imageSrc) {
           // کدهای قبلی مربوط به متن...
        }
        canvas.add(tileObj);
      }
    });

    canvas.requestRenderAll();
    
    // آپدیت دوربین با یک تاخیر ریز برای اطمینان از رندر
    setTimeout(() => updateCamera(), 50);

  }, [canvasInstance, tiles, globalSettings.shape, globalSettings.corner]); // ✅ corner اضافه شد

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
      <TrashZone ref={trashRef} isHovered={isTrashHovered} />
    </div>
  );
};

export default FabricCanvas;