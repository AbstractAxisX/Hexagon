import { createHexTile, createHexGhost } from './HexTile';
import { createSquareTile, createSquareGhost } from './SquareTile';
import { createCircleTile, createCircleGhost } from './CircleTile';

export const ShapeFactory = {
  create: (tileData, pixelPos) => {
    const shape = tileData.shape || 'hex';

    switch (shape) {
      case 'hex':
        return createHexTile(tileData, pixelPos);
      case 'square':
        return createSquareTile(tileData, pixelPos);
      case 'circle':
        return createCircleTile(tileData, pixelPos);
      default:
        console.error('❌ شکل نامعتبر:', shape);
        return null;
    }
  },

  createGhost: (gridPos, pixelPos, shape) => {
    switch (shape) {
      case 'hex':
        return createHexGhost(gridPos, pixelPos);
      case 'square':
        return createSquareGhost(gridPos, pixelPos);
      case 'circle':
        return createCircleGhost(gridPos, pixelPos);
      default:
        console.error('❌ شکل Ghost نامعتبر:', shape);
        return null;
    }
  }
};
