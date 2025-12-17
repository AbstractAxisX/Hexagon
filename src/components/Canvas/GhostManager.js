import { ShapeFactory } from '../Shapes/ShapeFactory';
import { hexToPixel, getNeighbors, HEX_MATH } from '../../utils/hexMath';
import { squareToPixel, getSquareNeighbors, SQUARE_MATH } from '../../utils/squareMath';
import { Logger } from '../../utils/logger';

const COMPONENT = 'GhostManager';

export const showGhostSlots = (draggedObj, canvas, ghostObjects, allTiles) => {
  clearGhosts(canvas, ghostObjects);

  const shape = draggedObj.data.shape;
  const validGhostCoords = new Set();

  if (shape === 'hex') {
    // منطق Hex Grid
    const existingCoords = new Set(
      allTiles.filter(t => t.shape === 'hex').map(t => `${t.q},${t.r}`)
    );

    allTiles.forEach(tile => {
      if (tile.id === draggedObj.data.id || tile.shape !== 'hex') return;

      const neighbors = getNeighbors(tile.q, tile.r);
      neighbors.forEach(n => {
        const key = `${n.q},${n.r}`;
        if (!existingCoords.has(key)) {
          validGhostCoords.add(key);
        }
      });
    });

    // رندر Ghost های Hex
    validGhostCoords.forEach(key => {
      const [q, r] = key.split(',').map(Number);
      const pos = hexToPixel(q, r, 0, 0);

      const ghost = ShapeFactory.createGhost({ q, r }, pos, 'hex');
      const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);

      if (dist < HEX_MATH.RADIUS * 0.8) {
        ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
        ghost.item(0).set({ 
          stroke: '#4ade80', 
          strokeWidth: 3, 
          fill: 'rgba(74, 222, 128, 0.2)' 
        });
      } else {
        ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
      }

      canvas.add(ghost);
      canvas.sendToBack(ghost);
      ghostObjects.current.push(ghost);
    });

  } else {
    // منطق Square/Circle Grid
    const existingCoords = new Set(
      allTiles.filter(t => t.shape !== 'hex').map(t => `${t.x},${t.y}`)
    );

    allTiles.forEach(tile => {
      if (tile.id === draggedObj.data.id || tile.shape === 'hex') return;

      const neighbors = getSquareNeighbors(tile.x, tile.y);
      neighbors.forEach(n => {
        const key = `${n.x},${n.y}`;
        if (!existingCoords.has(key)) {
          validGhostCoords.add(key);
        }
      });
    });

    // رندر Ghost های Square/Circle
    validGhostCoords.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const pos = squareToPixel(x, y, 0, 0);

      const ghost = ShapeFactory.createGhost({ x, y }, pos, shape);
      const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);

      if (dist < SQUARE_MATH.SIZE * 0.8) {
        ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
        ghost.item(0).set({ 
          stroke: '#4ade80', 
          strokeWidth: 3, 
          fill: 'rgba(74, 222, 128, 0.2)' 
        });
      } else {
        ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
      }

      canvas.add(ghost);
      canvas.sendToBack(ghost);
      ghostObjects.current.push(ghost);
    });
  }

  canvas.requestRenderAll();
  Logger.info(COMPONENT, 'Ghosts Rendered', { count: validGhostCoords.size });
};

export const clearGhosts = (canvas, ghostObjects) => {
  if (!canvas) return;
  
  ghostObjects.current.forEach(g => canvas.remove(g));
  ghostObjects.current = [];
  
  Logger.info(COMPONENT, 'Ghosts Cleared');
};
