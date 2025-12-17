import { fabric } from 'fabric';
import { getHexPoints } from '../../utils/hexMath';

export const createHexTile = (tileData, pixelPos) => {
  const { id } = tileData;
  const { x, y } = pixelPos;

  const points = getHexPoints();

  const hexPoly = new fabric.Polygon(points, {
    fill: '#FFFFFF',
    stroke: '#CBD5E1',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
    objectCaching: false
  });

  const group = new fabric.Group([hexPoly], {
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
    data: {
      id: id,
      q: tileData.q,
      r: tileData.r,
      shape: 'hex'
    }
  });

  return group;
};

export const createHexGhost = (gridPos, pixelPos) => {
  const points = getHexPoints();

  const hexPoly = new fabric.Polygon(points, {
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

  const group = new fabric.Group([hexPoly], {
    left: pixelPos.x,
    top: pixelPos.y,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
    opacity: 0,
    data: {
      type: 'ghost',
      q: gridPos.q,
      r: gridPos.r,
      shape: 'hex'
    }
  });

  return group;
};
