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

  // دسترسی به اکشن جدید
  const setFabricCanvas = useAppStore(state => state.setFabricCanvas);
  
  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const globalSettings = useAppStore(state => state.globalSettings);

  // 1. Setup
  const fabricRef = useCanvasSetup(canvasEl, containerRef, wallColor);

  // ✅ NEW: ثبت بوم در استور جهانی به محض لود شدن
  useEffect(() => {
    if (fabricRef.current) {
      setFabricCanvas(fabricRef.current);
    }
  }, [fabricRef.current]);

  // 2. Managers
  const ghostManager = useGhostManager(fabricRef);
  
  // 3. Events
  useCanvasEvents(fabricRef, ghostManager, trashRef, setTrashHovered);

  // Gestures (Zoom & Pan)
useGestures(fabricRef);

  // 4. Camera
  const { updateCamera } = useCameraController(fabricRef, tiles, viewMode, focusedTileId);
  

  // 5. Sync Tiles
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

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

      const tileObj = TileFactory.create(tileData, pos, tileData.shape, canvas);

      if (tileObj) {
        // لاجیک لود عکس و متن (بدون تغییر)
        if (tileData.content?.type === 'text' && tileData.content.data?.imageSrc) {
           // ... (کد قبلی شما برای هندل کردن عکس و ماسک) ...
        }
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