import { fabric } from 'fabric';
import { getHexPoints, HEX_MATH } from '../../utils/hexMath';

export const HexTile = {
  create: (tileData, pixelPos) => {
    const { id, q, r } = tileData;
    const { x, y } = pixelPos;
    const hexPoints = getHexPoints();

    const shapeObj = new fabric.Polygon(hexPoints, {
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
      data: { id, q, r, shape: 'hex' }
    });

    return group;
  },

  createGhost: (gridPos, pixelPos) => {
    const { q, r } = gridPos;
    const points = getHexPoints();
    
    const shapeObj = new fabric.Polygon(points, {
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
      data: { type: 'ghost', q, r, shape: 'hex' }
    });
  }
};