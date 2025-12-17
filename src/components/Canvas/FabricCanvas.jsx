import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel, pixelToHex, getNeighbors, HEX_MATH } from '../../utils/hexMath';
import { squareToPixel, pixelToSquare, getSquareNeighbors, SQUARE_MATH } from '../../utils/squareMath';
import { Logger } from '../../utils/logger';

const COMPONENT = 'FabricCanvas';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);

  // اتصال به استور
  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const setFocus = useAppStore(state => state.setFocus);
  const setOverview = useAppStore(state => state.setOverview);
  const globalSettings = useAppStore(state => state.globalSettings);

  const ghostObjects = useRef([]);

  // ==================== 1. SETUP ====================
  useEffect(() => {
    if (!canvasEl.current) return;

    Logger.info(COMPONENT, 'Initializing...');

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

    // هندل کردن حرکت آبجکت‌ها
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }
      showGhostSlots(obj);
    });

    // هندل کردن رها کردن آبجکت
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      clearGhosts();
      obj.set({ opacity: 1 });

      handleDropLogic(obj, canvas);
    });

    // کلیک روی آبجکت
    canvas.on('mouse:down', (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    });

    // دبل کلیک روی بک‌گراند
    canvas.on('mouse:dblclick', (e) => {
      if (!e.target) {
        setOverview();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // ==================== 2. SYNC TILES ====================
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // پاک کردن همه چیز جز گوست‌ها
    canvas.getObjects().forEach(o => {
      if (o.type !== 'ghost') canvas.remove(o);
    });

    canvas.clear();
    canvas.setBackgroundColor(wallColor, () => {});

    // رسم مجدد کاشی‌ها
    tiles.forEach(tileData => {
      let pos;
      
      // محاسبه پوزیشن بر اساس نوع شکل
      if (tileData.shape === 'hex') {
        pos = hexToPixel(tileData.q, tileData.r, 0, 0);
      } else {
        // برای مربع و دایره
        pos = squareToPixel(tileData.x, tileData.y, 0, 0);
      }

      const tileObj = TileFactory.create(
        tileData,
        pos,
        tileData.shape
      );
      canvas.add(tileObj);
    });

    setTimeout(() => updateCamera(), 50);

  }, [tiles, wallColor, globalSettings.shape]);

  // ==================== 3. CAMERA ====================
  useEffect(() => {
    updateCamera();
  }, [viewMode, focusedTileId]);

  const updateCamera = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    if (tiles.length === 0) {
      canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
      canvas.requestRenderAll();
      return;
    }

    let targetBounds = null;

    if (viewMode === 'focused' && focusedTileId) {
      const targetObj = canvas.getObjects().find(o => o.data?.id === focusedTileId);
      if (targetObj) {
        const padding = 50;
        targetBounds = {
          left: targetObj.left - padding,
          top: targetObj.top - padding,
          width: targetObj.width + (padding * 2),
          height: targetObj.height + (padding * 2)
        };
      }
    }

    if (!targetBounds) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let hasTiles = false;

      canvas.getObjects().forEach(obj => {
        if (obj.data?.id) {
          hasTiles = true;
          if (obj.left < minX) minX = obj.left;
          if (obj.top < minY) minY = obj.top;
          if (obj.left + obj.width > maxX) maxX = obj.left + obj.width;
          if (obj.top + obj.height > maxY) maxY = obj.top + obj.height;
        }
      });

      if (hasTiles) {
        const padding = 150;
        targetBounds = {
          left: minX - padding,
          top: minY - padding,
          width: (maxX - minX) + (padding * 2),
          height: (maxY - minY) + (padding * 2)
        };
      }
    }

    if (targetBounds) {
      const scaleX = canvas.width / targetBounds.width;
      const scaleY = canvas.height / targetBounds.height;
      const zoom = Math.min(scaleX, scaleY);
      const finalZoom = Math.min(zoom, 2.5);

      const centerX = targetBounds.left + targetBounds.width / 2;
      const centerY = targetBounds.top + targetBounds.height / 2;

      const finalPanX = (canvas.width / 2) - (centerX * finalZoom);
      const finalPanY = (canvas.height / 2) - (centerY * finalZoom);

      const currentZoom = canvas.getZoom();
      const currentPanX = canvas.viewportTransform[4];
      const currentPanY = canvas.viewportTransform[5];

      fabric.util.animate({
        startValue: 0,
        endValue: 1,
        duration: 400,
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
          canvas.setCoords();
        },
        easing: fabric.util.ease.easeOutQuad
      });
    }
  };

  // ==================== 4. GHOST & DROP LOGIC ====================

  const showGhostSlots = (draggedObj) => {
    const canvas = fabricRef.current;
    clearGhosts();

    const allTiles = useAppStore.getState().tiles;
    const draggedShape = draggedObj.data.shape;
    
    let existingCoords, validGhostCoords;

    // --- منطق Hexagon ---
    if (draggedShape === 'hex') {
      existingCoords = new Set(allTiles.filter(t => t.shape === 'hex').map(t => `${t.q},${t.r}`));
      validGhostCoords = new Set();

      allTiles.filter(t => t.shape === 'hex').forEach(tile => {
        if (tile.id === draggedObj.data.id) return;

        const neighbors = getNeighbors(tile.q, tile.r);
        neighbors.forEach(n => {
          const key = `${n.q},${n.r}`;
          if (!existingCoords.has(key)) {
            validGhostCoords.add(key);
          }
        });
      });

      validGhostCoords.forEach(key => {
        const [q, r] = key.split(',').map(Number);
        const pos = hexToPixel(q, r, 0, 0);

        const ghost = TileFactory.createGhost({ q, r }, pos, 'hex');
        const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);

        if (dist < HEX_MATH.RADIUS * 0.8) {
          ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
          ghost.item(0).set({ stroke: '#4ade80', strokeWidth: 3, fill: 'rgba(74, 222, 128, 0.2)' });
        } else {
          ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
        }

        canvas.add(ghost);
        canvas.sendToBack(ghost);
        ghostObjects.current.push(ghost);
      });

    } else {
      // --- منطق Square/Circle ---
      existingCoords = new Set(allTiles.filter(t => t.shape !== 'hex').map(t => `${t.x},${t.y}`));
      validGhostCoords = new Set();

      allTiles.filter(t => t.shape !== 'hex').forEach(tile => {
        if (tile.id === draggedObj.data.id) return;

        const neighbors = getSquareNeighbors(tile.x, tile.y);
        neighbors.forEach(n => {
          const key = `${n.x},${n.y}`;
          if (!existingCoords.has(key)) {
            validGhostCoords.add(key);
          }
        });
      });

      validGhostCoords.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const pos = squareToPixel(x, y, 0, 0);

        // اینجا draggedShape مهمه چون ممکنه دایره باشه یا مربع
        const ghost = TileFactory.createGhost({ x, y }, pos, draggedShape);
        const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);

        if (dist < SQUARE_MATH.SIZE * 0.8) {
          ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
          ghost.item(0).set({ stroke: '#4ade80', strokeWidth: 3, fill: 'rgba(74, 222, 128, 0.2)' });
        } else {
          ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
        }

        canvas.add(ghost);
        canvas.sendToBack(ghost);
        ghostObjects.current.push(ghost);
      });
    }
  };

  const clearGhosts = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    ghostObjects.current.forEach(g => canvas.remove(g));
    ghostObjects.current = [];
  };

  const handleDropLogic = (obj, canvas) => {
    const allTiles = useAppStore.getState().tiles;
    const { id, shape } = obj.data;
    
    let targetCoord, oldCoord, targetTile, hasNeighbor;

    if (shape === 'hex') {
      // Hexagonal Drop Logic
      const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
      const oldQ = obj.data.q;
      const oldR = obj.data.r;

      targetCoord = { q, r };
      oldCoord = { q: oldQ, r: oldR };

      targetTile = allTiles.find(t => t.shape === 'hex' && t.q === q && t.r === r && t.id !== id);

      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape !== 'hex') return false;
        const neighbors = getNeighbors(t.q, t.r);
        return neighbors.some(n => n.q === q && n.r === r);
      });

    } else {
      // Square/Circle Drop Logic
      const { x, y } = pixelToSquare(obj.left, obj.top, 0, 0);
      const oldX = obj.data.x;
      const oldY = obj.data.y;

      targetCoord = { x, y };
      oldCoord = { x: oldX, y: oldY };

      targetTile = allTiles.find(t => t.shape !== 'hex' && t.x === x && t.y === y && t.id !== id);

      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape === 'hex') return false;
        const neighbors = getSquareNeighbors(t.x, t.y);
        return neighbors.some(n => n.x === x && n.y === y);
      });
    }

    // تصمیم‌گیری نهایی
    if (targetTile) {
      moveOrSwapTile(id, targetCoord);
      Logger.success(COMPONENT, 'Swapped Tiles', { from: oldCoord, to: targetCoord });
    } else if (hasNeighbor) {
      moveOrSwapTile(id, targetCoord);
      Logger.success(COMPONENT, 'Moved Tile', { to: targetCoord });
    } else {
      Logger.warn(COMPONENT, 'Invalid Drop -> Reverting');
      
      let oldPos;
      if (shape === 'hex') {
        oldPos = hexToPixel(oldCoord.q, oldCoord.r, 0, 0);
      } else {
        oldPos = squareToPixel(oldCoord.x, oldCoord.y, 0, 0);
      }

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