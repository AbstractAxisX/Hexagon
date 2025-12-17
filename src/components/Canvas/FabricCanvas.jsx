import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel, pixelToHex, getNeighbors, HEX_MATH } from '../../utils/hexMath';
import { Logger } from '../../utils/logger';

const COMPONENT = 'FabricCanvas';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);

  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const setFocus = useAppStore(state => state.setFocus);
  const setOverview = useAppStore(state => state.setOverview);
  const globalSettings = useAppStore(state => state.globalSettings);

  const ghostObjects = useRef([]);
  const prevTileCountRef = useRef(0); // ✅ برای تشخیص کاشی جدید

  // ==================== 1. SETUP ====================
  useEffect(() => {
    if (!canvasEl.current) return;

    Logger.info(COMPONENT, 'Initializing Canvas...');

    const canvas = new fabric.Canvas(canvasEl.current, {
      selection: false,
      preserveObjectStacking: true,
      backgroundColor: wallColor,
      renderOnAddRemove: false,
      hoverCursor: 'default',
    });
    fabricRef.current = canvas;

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.offsetWidth);
        canvas.setHeight(containerRef.current.offsetHeight);
        canvas.requestRenderAll();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // ==================== EVENT LISTENERS ====================

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }
      showGhostSlots(obj);
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      clearGhosts();
      obj.set({ opacity: 1 });
      handleDropLogic(obj, canvas);
    });

    canvas.on('mouse:down', (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    });

    canvas.on('mouse:dblclick', (e) => {
      if (!e.target) {
        setOverview();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
      Logger.info(COMPONENT, 'Canvas disposed');
    };
  }, []);

  // ==================== 3. SYNC TILES ====================
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    Logger.info(COMPONENT, 'Syncing tiles...', { count: tiles.length });

    // پاک کردن کاشی‌های قبلی
    canvas.getObjects().forEach(o => {
      if (o.data?.type !== 'ghost') canvas.remove(o);
    });

    canvas.setBackgroundColor(wallColor, () => {});

    // رندر کاشی‌ها
    tiles.forEach(tileData => {
      const shape = tileData.shape || globalSettings.shape || 'hex';

      const tileObj = TileFactory.create(
        tileData,
        { centerX: 0, centerY: 0 },
        shape
      );

      if (tileObj) {
        canvas.add(tileObj);
      } else {
        Logger.error(COMPONENT, 'Failed to create tile', tileData);
      }
    });

    canvas.requestRenderAll();

    // ✅ فقط اگر کاشی جدید اضافه شده، فوکوس کن
    const currentCount = tiles.length;
    const previousCount = prevTileCountRef.current;

    if (currentCount > previousCount && tiles.length > 0) {
      setTimeout(() => {
        const lastTile = tiles[tiles.length - 1];
        Logger.info(COMPONENT, '🆕 New tile added, focusing...', { id: lastTile.id });
        setFocus(lastTile.id);
      }, 150);
    } else if (currentCount === previousCount && tiles.length > 0) {
      // ✅ اگر فقط جابجایی بوده (نه اضافه شدن)، دوربین رو آپدیت کن بدون تاخیر
      updateCamera();
    }

    prevTileCountRef.current = currentCount;

  }, [tiles, wallColor, globalSettings.shape]);

// ==================== 4. CAMERA CONTROLLER ====================

// ========== تست دیباگ ==========
useEffect(() => {
  if (!fabricRef.current) return;
  
  console.log('🧪 DEBUG TEST:');
  console.log('📦 Total tiles in store:', tiles.length);
  console.log('🎨 Objects on canvas:', fabricRef.current.getObjects().length);
  
  fabricRef.current.getObjects().forEach((obj, index) => {
    if (obj.data?.id) {
      const bounds = obj.getBoundingRect();
      console.log(`🔹 Tile #${index}:`, {
        id: obj.data.id,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height,
        bounds: bounds
      });
    }
  });
  
}, [tiles]);

useEffect(() => {
  if (!fabricRef.current) return;


  
  updateCamera();
}, [viewMode, focusedTileId]);

const updateCamera = () => {
  if (!fabricRef.current) return;
  const canvas = fabricRef.current;

  console.log('🎥 ===== CAMERA DEBUG START =====');
  console.log('📦 Tiles count:', tiles.length);
  console.log('🎯 View Mode:', viewMode);
  console.log('🔍 Focused ID:', focusedTileId);

  // ✅ چک کن همه کاشی‌ها کجا هستن
  const allObjects = canvas.getObjects().filter(o => o.data?.id);
  console.log('🟢 Canvas Objects:', allObjects.map(o => ({
    id: o.data.id,
    left: o.left,
    top: o.top,
    width: o.width,
    height: o.height,
    bounds: o.getBoundingRect()
  })));

  if (tiles.length === 0) {
    canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
    canvas.requestRenderAll();
    return;
  }

  let targetBounds = null;

  // حالت Focus
  if (viewMode === 'focused' && focusedTileId) {
    const targetObj = canvas.getObjects().find(o => o.data?.id === focusedTileId);
    
    console.log('🎯 Looking for tile:', focusedTileId);
    console.log('🎯 Found object:', targetObj ? 'YES' : 'NO');
    
    if (targetObj) {
      const bounds = targetObj.getBoundingRect();
      console.log('📐 Object bounds:', bounds);
      
      const padding = 100;
      targetBounds = {
        left: bounds.left - padding,
        top: bounds.top - padding,
        width: bounds.width + (padding * 2),
        height: bounds.height + (padding * 2)
      };
      
      console.log('🎯 Target bounds (with padding):', targetBounds);
      Logger.info(COMPONENT, '🎯 Focusing', { id: focusedTileId });
    } else {
      console.error('❌ Object not found on canvas!');
    }
  }

  // حالت Overview
  if (!targetBounds) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasTiles = false;

    canvas.getObjects().forEach(obj => {
      if (obj.data?.id) {
        hasTiles = true;
        const bounds = obj.getBoundingRect();
        console.log('📏 Tile bounds:', { id: obj.data.id, bounds });
        
        minX = Math.min(minX, bounds.left);
        minY = Math.min(minY, bounds.top);
        maxX = Math.max(maxX, bounds.left + bounds.width);
        maxY = Math.max(maxY, bounds.top + bounds.height);
      }
    });

    console.log('🌍 Overview bounds:', { minX, minY, maxX, maxY });

    if (hasTiles) {
      const padding = 150;
      targetBounds = {
        left: minX - padding,
        top: minY - padding,
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2)
      };
      console.log('🌍 Final overview bounds:', targetBounds);
      Logger.info(COMPONENT, '🌍 Overview', { tiles: tiles.length });
    }
  }

  if (targetBounds) {
    const scaleX = canvas.width / targetBounds.width;
    const scaleY = canvas.height / targetBounds.height;
    const zoom = Math.min(scaleX, scaleY);
    const finalZoom = Math.min(Math.max(zoom, 0.5), 2.5);

    const centerX = targetBounds.left + targetBounds.width / 2;
    const centerY = targetBounds.top + targetBounds.height / 2;

    const finalPanX = (canvas.width / 2) - (centerX * finalZoom);
    const finalPanY = (canvas.height / 2) - (centerY * finalZoom);

    console.log('📊 Camera calculations:', {
      canvasSize: { w: canvas.width, h: canvas.height },
      zoom: finalZoom,
      center: { x: centerX, y: centerY },
      pan: { x: finalPanX, y: finalPanY }
    });

    const currentZoom = canvas.getZoom();
    const currentPanX = canvas.viewportTransform[4];
    const currentPanY = canvas.viewportTransform[5];

    console.log('📍 Current transform:', {
      zoom: currentZoom,
      pan: { x: currentPanX, y: currentPanY }
    });

    console.log('🎥 ===== CAMERA DEBUG END =====\n');

    // ✅ چک: اگر تغییرات کوچک است، بدون انیمیشن
    const zoomDiff = Math.abs(finalZoom - currentZoom);
    const panDiffX = Math.abs(finalPanX - currentPanX);
    const panDiffY = Math.abs(finalPanY - currentPanY);

    if (zoomDiff < 0.01 && panDiffX < 5 && panDiffY < 5) {
      canvas.setZoom(finalZoom);
      canvas.viewportTransform[4] = finalPanX;
      canvas.viewportTransform[5] = finalPanY;
      canvas.requestRenderAll();
      return;
    }

    // انیمیشن
    fabric.util.animate({
      startValue: 0,
      endValue: 1,
      duration: 500,
      onChange: function(value) {
        const newZoom = currentZoom + (finalZoom - currentZoom) * value;
        const newPanX = currentPanX + (finalPanX - currentPanX) * value;
        const newPanY = currentPanY + (finalPanY - currentPanY) * value;

        canvas.setZoom(newZoom);
        canvas.viewportTransform[4] = newPanX;
        canvas.viewportTransform[5] = newPanY;
        canvas.requestRenderAll();
      },
      onComplete: function() {
        canvas.forEachObject(obj => obj.setCoords());
        canvas.requestRenderAll();
      },
      easing: fabric.util.ease.easeInOutCubic
    });
  }
};


  // ==================== 5. GHOST & DROP LOGIC ====================

  const showGhostSlots = (draggedObj) => {
    const canvas = fabricRef.current;
    clearGhosts();

    const allTiles = useAppStore.getState().tiles;
    const existingCoords = new Set(allTiles.map(t => `${t.q},${t.r}`));
    const validGhostCoords = new Set();

    allTiles.forEach(tile => {
      if (tile.id === draggedObj.data.id) return;

      const neighbors = getNeighbors(tile.q, tile.r);
      neighbors.forEach(n => {
        const key = `${n.q},${n.r}`;
        if (!existingCoords.has(key)) {
          validGhostCoords.add(key);
        }
      });
    });

    const shape = globalSettings.shape || 'hex';

    validGhostCoords.forEach(key => {
      const [q, r] = key.split(',').map(Number);
      const pos = hexToPixel(q, r, 0, 0);

      const ghost = TileFactory.createGhost({ q, r }, pos, shape);

      const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);

      if (dist < HEX_MATH.RADIUS * 0.8) {
        ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
        if (ghost.item(0)) {
          ghost.item(0).set({
            stroke: '#4ade80',
            strokeWidth: 3,
            fill: 'rgba(74, 222, 128, 0.2)'
          });
        }
      } else {
        ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
      }

      canvas.add(ghost);
      canvas.sendToBack(ghost);
      ghostObjects.current.push(ghost);
    });

    canvas.requestRenderAll();
  };

  const clearGhosts = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    ghostObjects.current.forEach(g => canvas.remove(g));
    ghostObjects.current = [];
  };

  const handleDropLogic = (obj, canvas) => {
    const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
    const { id, q: oldQ, r: oldR } = obj.data;

    const allTiles = useAppStore.getState().tiles;
    const targetTile = allTiles.find(t => t.q === q && t.r === r && t.id !== id);

    const hasNeighbor = allTiles.some(t => {
      if (t.id === id) return false;
      const neighbors = getNeighbors(t.q, t.r);
      return neighbors.some(n => n.q === q && n.r === r);
    });

    if (targetTile) {
      moveOrSwapTile(id, q, r);
      Logger.success(COMPONENT, '🔄 Swapped', { from: `${oldQ},${oldR}`, to: `${q},${r}` });
    } else if (hasNeighbor) {
      moveOrSwapTile(id, q, r);
      Logger.success(COMPONENT, '✅ Moved', { to: `${q},${r}` });
    } else {
      Logger.warn(COMPONENT, '❌ Invalid drop, reverting...');
      const oldPos = hexToPixel(oldQ, oldR, 0, 0);
      obj.animate({
        left: oldPos.x,
        top: oldPos.y,
        opacity: 1
      }, {
        duration: 300,
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBack
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
    </div>
  );
};

export default FabricCanvas;
