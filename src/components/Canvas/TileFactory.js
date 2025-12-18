import { HexTile } from '../Shapes/HexTile';
import { SquareTile } from '../Shapes/SquareTile';
import { CircleTile } from '../Shapes/CircleTile';

export const TileFactory = {
  /**
   * @param {object} tileData - دیتای کاشی
   * @param {object} pixelPos - موقعیت پیکسلی {x, y}
   * @param {string} shape - نوع شکل
   */
  create: (tileData, pixelPos, shape, canvas) => {
    switch (shape) {
      case 'hex':
        return HexTile.create(tileData, pixelPos, canvas);
      case 'square':
        return SquareTile.create(tileData, pixelPos, canvas);
      case 'circle':
        return CircleTile.create(tileData, pixelPos, canvas);
      default:
        console.error('❌ شکل نامعتبر در TileFactory:', shape);
        return null;
    }
  },

  /**
   * ساخت کاشی Ghost بر اساس شکل
   */
  createGhost: (gridPos, pixelPos, shape) => {
    switch (shape) {
      case 'hex':
        return HexTile.createGhost(gridPos, pixelPos);
      case 'square':
        return SquareTile.createGhost(gridPos, pixelPos);
      case 'circle':
        return CircleTile.createGhost(gridPos, pixelPos);
      default:
        console.error('❌ شکل Ghost نامعتبر:', shape);
        return null;
    }
  }
};