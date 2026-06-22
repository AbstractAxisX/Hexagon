import { pixelToHex, hexToPixel, getNeighbors } from './hexMath';
import { pixelToSquare, squareToPixel, getSquareNeighbors } from './squareMath';
import { Logger } from './logger';

const COMPONENT = 'DropLogic';

export const handleTileDrop = (obj, canvas, allTiles, moveOrSwapTile) => {
  const { id, shape } = obj.data;

  let targetCoord, oldCoord, targetTile, hasNeighbor, oldPos;

  if (shape === 'hex') {
    const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
    const oldQ = obj.data.q;
    const oldR = obj.data.r;

    targetCoord = { q, r };
    oldCoord = { q: oldQ, r: oldR };
    oldPos = hexToPixel(oldQ, oldR, 0, 0);

    targetTile = allTiles.find(t => t.shape === 'hex' && t.q === q && t.r === r && t.id !== id);

    hasNeighbor = allTiles.some(t => {
      if (t.id === id || t.shape !== 'hex') return false;
      const neighbors = getNeighbors(t.q, t.r);
      return neighbors.some(n => n.q === q && n.r === r);
    });

  } else {
    const { x, y } = pixelToSquare(obj.left, obj.top, 0, 0);
    const oldX = obj.data.x;
    const oldY = obj.data.y;

    targetCoord = { x, y };
    oldCoord = { x: oldX, y: oldY };
    oldPos = squareToPixel(oldX, oldY, 0, 0);

    targetTile = allTiles.find(t => t.shape !== 'hex' && t.x === x && t.y === y && t.id !== id);

    hasNeighbor = allTiles.some(t => {
      if (t.id === id || t.shape === 'hex') return false;
      const neighbors = getSquareNeighbors(t.x, t.y);
      return neighbors.some(n => n.x === x && n.y === y);
    });
  }

  // تصمیم‌گیری
  if (targetTile) {
    moveOrSwapTile(id, targetCoord);
    Logger.success(COMPONENT, 'Swapped Tiles', { from: oldCoord, to: targetCoord });
  } else if (hasNeighbor) {
    moveOrSwapTile(id, targetCoord);
    Logger.success(COMPONENT, 'Moved Tile', { to: targetCoord });
  } else {
    Logger.warn(COMPONENT, 'Invalid Drop -> Reverting');
    obj.animate(
      { left: oldPos.x, top: oldPos.y, opacity: 1 },
      {
        duration: 300,
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBack
      }
    );
  }
};
