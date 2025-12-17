import { useEffect, useRef } from 'react';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel } from '../../utils/hexMath';
import { squareToPixel } from '../../utils/squareMath';

// Hooks
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useGhostManager } from './hooks/useGhostManager';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useCameraController } from './hooks/useCameraController';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const containerRef = useRef(null);

  // داده‌های مورد نیاز از استور
  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const globalSettings = useAppStore(state => state.globalSettings);

  // 1. Setup Canvas
  const fabricRef = useCanvasSetup(canvasEl, containerRef, wallColor);

  // 2. Managers
  const ghostManager = useGhostManager(fabricRef);
  
  // 3. Events & Logic (Drop, Click, Move)
  useCanvasEvents(fabricRef, ghostManager);

  // 4. Camera Controller
  const { updateCamera } = useCameraController(fabricRef, tiles, viewMode, focusedTileId);

  // 5. Sync Tiles (Render Logic)
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // پاک کردن آبجکت‌های قدیمی (بجز گوست‌ها)
    canvas.getObjects().forEach(o => {
      if (o.type !== 'ghost') canvas.remove(o);
    });

    // رندر مجدد کاشی‌ها
    tiles.forEach(tileData => {
      let pos;
      if (tileData.shape === 'hex') {
        pos = hexToPixel(tileData.q, tileData.r, 0, 0);
      } else {
        pos = squareToPixel(tileData.x, tileData.y, 0, 0);
      }

      const tileObj = TileFactory.create(tileData, pos, tileData.shape);
      canvas.add(tileObj);
    });

    // درخواست آپدیت دوربین بعد از رندر
    setTimeout(() => updateCamera(), 50);

  }, [tiles, wallColor, globalSettings.shape]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
    </div>
  );
};

export default FabricCanvas;