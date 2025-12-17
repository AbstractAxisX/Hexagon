import { fabric } from 'fabric';
import { HEX_MATH } from '../../utils/hexMath';
import { Logger } from '../../utils/logger';

const COMPONENT = 'TileFactory';

export const TileFactory = {
  create(tileData, canvas) {
    const { q, r, id, color, shape } = tileData;
    
    // محاسبه مختصات پیکسلی
    const x = HEX_MATH.SIZE * (3/2 * q);
    const y = HEX_MATH.SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);

    let fabricShape;

    if (shape === 'hex' || !shape) {
      // ✅ نقاط Hexagon (بدون offset!)
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        points.push({
          x: HEX_MATH.RADIUS * Math.cos(angle),
          y: HEX_MATH.RADIUS * Math.sin(angle)
        });
      }

      fabricShape = new fabric.Polygon(points, {
        fill: color || '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 3,
        selectable: true,
        hasControls: false,
        hasBorders: false,
        originX: 'center',  // ✅ کلید اصلی!
        originY: 'center',  // ✅ کلید اصلی!
      });

    } else if (shape === 'square') {
      fabricShape = new fabric.Rect({
        width: HEX_MATH.RADIUS * 2,
        height: HEX_MATH.RADIUS * 2,
        fill: color || '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 3,
        selectable: true,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
      });

    } else if (shape === 'circle') {
      fabricShape = new fabric.Circle({
        radius: HEX_MATH.RADIUS,
        fill: color || '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 3,
        selectable: true,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
      });
    }

    if (!fabricShape) {
      Logger.error(COMPONENT, 'Unknown shape type', { shape });
      return null;
    }

    // ✅ ست کردن موقعیت نهایی
    fabricShape.set({
      left: x,
      top: y,
      data: { id, q, r, shape: shape || 'hex' }
    });

    Logger.info(COMPONENT, '✅ Tile Created', {
      id,
      q, r,
      pixelX: x,
      pixelY: y,
      bounds: fabricShape.getBoundingRect()
    });

    return fabricShape;
  },

  createGhost(coord, pos, shape) {
    let ghostShape;
    const { x, y } = pos;

    if (shape === 'hex' || !shape) {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        points.push({
          x: HEX_MATH.RADIUS * Math.cos(angle),
          y: HEX_MATH.RADIUS * Math.sin(angle)
        });
      }

      ghostShape = new fabric.Polygon(points, {
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: '#9ca3af',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
      });

    } else if (shape === 'square') {
      ghostShape = new fabric.Rect({
        width: HEX_MATH.RADIUS * 2,
        height: HEX_MATH.RADIUS * 2,
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: '#9ca3af',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
      });

    } else if (shape === 'circle') {
      ghostShape = new fabric.Circle({
        radius: HEX_MATH.RADIUS,
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: '#9ca3af',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
      });
    }

    const group = new fabric.Group([ghostShape], {
      left: x,
      top: y,
      selectable: false,
      evented: false,
      data: { type: 'ghost', q: coord.q, r: coord.r }
    });

    return group;
  }
};
