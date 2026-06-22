import { fabric } from 'fabric';
import { getHexPoints, getHexPathData, HEX_MATH } from '../../utils/hexMath';
import { createClippedImage } from '../../utils/fabricUtils';
import { createDefaultTextbox } from '../../utils/textUtils';
import { createTextLayers } from '../../utils/textLayerUtils';

export const HexTile = {
  create: (tileData, pixelPos, canvas) => {
    const { id, q, r, content, corner, textConfig } = tileData;
    const { x, y } = pixelPos;

    const isRounded = corner === 'rounded';
    const cornerRadius = 10;

    // ---------------------------------------------------------
    // ۱. شکل پایه
    // ---------------------------------------------------------
    let shapeObj;
    if (isRounded) {
      shapeObj = new fabric.Path(getHexPathData(cornerRadius), {
        fill: '#FFFFFF',
        stroke: '#CBD5E1',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        objectCaching: false,
        name: 'tile-bg',
        selectable: false,
        evented: false
      });
    } else {
      shapeObj = new fabric.Polygon(getHexPoints(), {
        fill: '#FFFFFF',
        stroke: '#CBD5E1',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        objectCaching: false,
        name: 'tile-bg',
        selectable: false,
        evented: false
      });
    }

    if (content?.type === 'color' && content.data) {
      shapeObj.set({ fill: content.data });
    }

    // ---------------------------------------------------------
    // clipPath factory
    // ---------------------------------------------------------
    const makeShapeClip = () => {
      if (isRounded) {
        return new fabric.Path(getHexPathData(cornerRadius), {
          originX: 'center', originY: 'center',
        });
      }
      return new fabric.Polygon(getHexPoints(), {
        originX: 'center', originY: 'center',
      });
    };

    // ---------------------------------------------------------
    // ۲. لایه‌های متن — shared utility
    // ---------------------------------------------------------
    const textObjects = createTextLayers(textConfig, {
      clipPathFactory: makeShapeClip,
      selectable:      false,
    });

    // Legacy fallback
    if (textObjects.length === 0) {
      const initialText = textConfig?.text || content?.text || '';
      if (initialText) {
        const safeWidth = (HEX_MATH.SQRT3 * HEX_MATH.RADIUS) * 0.85;
        const legacyText = new fabric.Textbox(initialText, {
          width: safeWidth,
          fontSize: textConfig?.fontSize || 22,
          fontFamily: textConfig?.fontFamily || 'Vazirmatn',
          fill: textConfig?.fill || '#000000',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          splitByGrapheme: true,
          selectable: false,
          evented: false,
          clipPath: makeShapeClip(),
        });
        textObjects.push(legacyText);
      }
    }

    // ---------------------------------------------------------
    // ۳. ساخت گروه
    // ---------------------------------------------------------
    const group = new fabric.Group([shapeObj, ...textObjects], {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      selectable: true,
      evented: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.05)',
        blur: 10,
        offsetX: 4,
        offsetY: 4
      }),
      data: { id, q, r, shape: 'hex' }
    });

    // ---------------------------------------------------------
    // ۴. هندل کردن عکس — reverted: بدون targetSize
    // ---------------------------------------------------------
    if (content?.type === 'image' && content.data) {
      const clipFactory = makeShapeClip;

      createClippedImage(content.data, clipFactory, (img) => {
        if (!group) return;

        group.add(img);
        shapeObj.set({ fill: 'transparent', stroke: 'transparent' });

        const border = makeShapeClip();
        border.set({
          fill: 'transparent',
          stroke: '#CBD5E1',
          strokeWidth: 2,
          selectable: false,
          evented: false
        });
        group.add(border);

        group.getObjects().forEach(obj => {
          if (obj.type === 'text' || obj.type === 'textbox') {
            obj.bringToFront();
          }
        });

        if (canvas) canvas.requestRenderAll();
      });
    }

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
