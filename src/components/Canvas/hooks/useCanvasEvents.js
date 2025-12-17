import { useEffect } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';
import { Logger } from '../../../utils/logger';
import { pixelToHex, getNeighbors, hexToPixel } from '../../../utils/hexMath';
import { pixelToSquare, getSquareNeighbors, squareToPixel } from '../../../utils/squareMath';

export const useCanvasEvents = (fabricRef, ghostManager) => {
  const { showGhostSlots, clearGhosts } = ghostManager;
  
  // دسترسی مستقیم به اکشن‌های استور
  const setFocus = useAppStore(state => state.setFocus);
  const setOverview = useAppStore(state => state.setOverview);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // --- Handlers ---

    const handleObjectMoving = (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }
      showGhostSlots(obj);
    };

    const handleObjectModified = (e) => {
      const obj = e.target;
      clearGhosts();
      obj.set({ opacity: 1 });
      handleDropLogic(obj, canvas);
    };

    const handleMouseDown = (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    };

    const handleDblClick = (e) => {
      if (!e.target) {
        setOverview();
      }
    };

    // --- Bind Events ---
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:dblclick', handleDblClick);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:dblclick', handleDblClick);
    };
  }, [fabricRef.current]); // وابسته به رفرنس بوم

  // --- Drop Logic (Internal Helper) ---
  const handleDropLogic = (obj, canvas) => {
    // نکته مهم: برای دسترسی به state تازه، از getState استفاده می‌کنیم
    const allTiles = useAppStore.getState().tiles;
    const { id, shape } = obj.data;
    
    let targetCoord, oldCoord, targetTile, hasNeighbor;

    if (shape === 'hex') {
      const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
      targetCoord = { q, r };
      oldCoord = { q: obj.data.q, r: obj.data.r };
      
      targetTile = allTiles.find(t => t.shape === 'hex' && t.q === q && t.r === r && t.id !== id);
      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape !== 'hex') return false;
        return getNeighbors(t.q, t.r).some(n => n.q === q && n.r === r);
      });

    } else {
      const { x, y } = pixelToSquare(obj.left, obj.top, 0, 0);
      targetCoord = { x, y };
      oldCoord = { x: obj.data.x, y: obj.data.y };

      targetTile = allTiles.find(t => t.shape !== 'hex' && t.x === x && t.y === y && t.id !== id);
      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape === 'hex') return false;
        // ✅ چک کردن ۸ همسایه برای دراپ معتبر
        return getSquareNeighbors(t.x, t.y).some(n => n.x === x && n.y === y);
      });
    }

    if (targetTile) {
      moveOrSwapTile(id, targetCoord);
      Logger.success('DropLogic', 'Swapped Tiles', { from: oldCoord, to: targetCoord });
    } else if (hasNeighbor) {
      moveOrSwapTile(id, targetCoord);
      Logger.success('DropLogic', 'Moved Tile', { to: targetCoord });
    } else {
      Logger.warn('DropLogic', 'Invalid Drop -> Reverting');
      
      let oldPos;
      if (shape === 'hex') oldPos = hexToPixel(oldCoord.q, oldCoord.r, 0, 0);
      else oldPos = squareToPixel(oldCoord.x, oldCoord.y, 0, 0);

      obj.animate({ left: oldPos.x, top: oldPos.y, opacity: 1 }, {
        duration: 300,
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBack
      });
    }
  };
};