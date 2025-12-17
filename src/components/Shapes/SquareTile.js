import { fabric } from 'fabric';
import { SQUARE_MATH } from '../../utils/squareMath';

export const SquareTile = {
  create: (tileData, pixelPos) => {
    const { id, x: gridX, y: gridY } = tileData;
    const { x, y } = pixelPos;
    const cornerRadius = tileData.corner === 'rounded' ? 10 : 0;

    const shapeObj = new fabric.Rect({
      width: SQUARE_MATH.SIZE - 6,
      height: SQUARE_MATH.SIZE - 6,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 2,
      rx: cornerRadius,
      ry: cornerRadius,
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
      data: { id, x: gridX, y: gridY, shape: 'square' }
    });

    return group;
  },

  createGhost: (gridPos, pixelPos) => {
    const { x, y } = gridPos;
    
    const shapeObj = new fabric.Rect({
      width: SQUARE_MATH.SIZE - 6,
      height: SQUARE_MATH.SIZE - 6,
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
      data: { type: 'ghost', x, y, shape: 'square' }
    });
  }
};