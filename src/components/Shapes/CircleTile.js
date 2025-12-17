import { fabric } from 'fabric';
import { SQUARE_MATH } from '../../utils/squareMath';

export const CircleTile = {
  create: (tileData, pixelPos) => {
    const { id, x: gridX, y: gridY } = tileData;
    const { x, y } = pixelPos;

    const shapeObj = new fabric.Circle({
      radius: (SQUARE_MATH.SIZE - 6) / 2,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false
    });

    const group = new fabric.Group([shapeObj], {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.05)',
        blur: 10,
        offsetX: 4,
        offsetY: 4
      }),
      data: { id, x: gridX, y: gridY, shape: 'circle' }
    });

    return group;
  },

  createGhost: (gridPos, pixelPos) => {
    const { x, y } = gridPos;

    const shapeObj = new fabric.Circle({
      radius: (SQUARE_MATH.SIZE - 6) / 2,
      fill: 'rgba(0,0,0,0.05)',
      stroke: '#cbd5e1',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      objectCaching: false
    });

    return new fabric.Group([shapeObj], {
      left: pixelPos.x,
      top: pixelPos.y,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      opacity: 0,
      data: { type: 'ghost', x, y, shape: 'circle' }
    });
  }
};