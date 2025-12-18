import { useEffect, useRef, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel } from '../../utils/hexMath';
import { squareToPixel } from '../../utils/squareMath';

// Components
import TrashZone from '../UI/TrashZone'; // ✅ اضافه شد

// Hooks
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useGhostManager } from './hooks/useGhostManager';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useCameraController } from './hooks/useCameraController';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const containerRef = useRef(null);
  const trashRef = useRef(null); // ✅ رفرنس برای سطل زباله

  const [isTrashHovered, setTrashHovered] = useState(false); // ✅ استیت برای استایل دهی سطل

  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const globalSettings = useAppStore(state => state.globalSettings);

  // 1. Setup
  const fabricRef = useCanvasSetup(canvasEl, containerRef, wallColor);

  // 2. Managers
  const ghostManager = useGhostManager(fabricRef);
  
  // 3. Events (با پاس دادن رفرنس سطل زباله)
  useCanvasEvents(fabricRef, ghostManager, trashRef, setTrashHovered); // ✅ آپدیت شد

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
      const tileObj = TileFactory.create(tileData, pos, tileData.shape , canvas);
      canvas.add(tileObj);
    });

    setTimeout(() => updateCamera(), 50);

  }, [tiles, wallColor, globalSettings.shape]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
      
      {/* ✅ اضافه کردن کامپوننت سطل زباله روی بوم */}
      <TrashZone ref={trashRef} isHovered={isTrashHovered} />
    </div>
  );
};

export default FabricCanvas;