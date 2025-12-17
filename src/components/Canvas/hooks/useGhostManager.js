import { useRef } from 'react';
import { TileFactory } from '../TileFactory';
import { hexToPixel, getNeighbors, HEX_MATH } from '../../../utils/hexMath';
import { squareToPixel, getSquareNeighbors, SQUARE_MATH } from '../../../utils/squareMath';
import useAppStore from '../../../store/useAppStore';

export const useGhostManager = (fabricRef) => {
  const ghostObjects = useRef([]);

  const clearGhosts = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    ghostObjects.current.forEach(g => canvas.remove(g));
    ghostObjects.current = [];
  };

  const showGhostSlots = (draggedObj) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    clearGhosts();

    const allTiles = useAppStore.getState().tiles;
    const draggedShape = draggedObj.data.shape;
    
    let existingCoords = new Set();
    let validGhostCoords = new Set();

    if (draggedShape === 'hex') {
      // --- منطق Hexagon ---
      existingCoords = new Set(allTiles.filter(t => t.shape === 'hex').map(t => `${t.q},${t.r}`));
      
      allTiles.filter(t => t.shape === 'hex').forEach(tile => {
        if (tile.id === draggedObj.data.id) return;
        getNeighbors(tile.q, tile.r).forEach(n => {
          const key = `${n.q},${n.r}`;
          if (!existingCoords.has(key)) validGhostCoords.add(key);
        });
      });

      validGhostCoords.forEach(key => {
        const [q, r] = key.split(',').map(Number);
        const pos = hexToPixel(q, r, 0, 0);
        createAndAddGhost({ q, r }, pos, 'hex', draggedObj, canvas);
      });

    } else {
      // --- منطق Square/Circle (با ۸ همسایه) ---
      existingCoords = new Set(allTiles.filter(t => t.shape !== 'hex').map(t => `${t.x},${t.y}`));
      
      allTiles.filter(t => t.shape !== 'hex').forEach(tile => {
        if (tile.id === draggedObj.data.id) return;
        // ✅ استفاده از getSquareNeighbors که ۸ جهت را برمی‌گرداند
        getSquareNeighbors(tile.x, tile.y).forEach(n => {
          const key = `${n.x},${n.y}`;
          if (!existingCoords.has(key)) validGhostCoords.add(key);
        });
      });

      validGhostCoords.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const pos = squareToPixel(x, y, 0, 0);
        createAndAddGhost({ x, y }, pos, draggedShape, draggedObj, canvas);
      });
    }
  };

  // تابع کمکی داخلی برای جلوگیری از تکرار کد
  const createAndAddGhost = (coords, pos, shape, draggedObj, canvas) => {
    const ghost = TileFactory.createGhost(coords, pos, shape);
    
    const radius = shape === 'hex' ? HEX_MATH.RADIUS : SQUARE_MATH.SIZE / 2; // تخمینی برای مربع
    const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);
    const triggerDist = shape === 'hex' ? radius * 0.8 : SQUARE_MATH.SIZE * 0.8;

    if (dist < triggerDist) {
      ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
      ghost.item(0).set({ stroke: '#4ade80', strokeWidth: 3, fill: 'rgba(74, 222, 128, 0.2)' });
    } else {
      ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
    }

    canvas.add(ghost);
    canvas.sendToBack(ghost);
    ghostObjects.current.push(ghost);
  };

  return { showGhostSlots, clearGhosts };
};