import { fabric } from 'fabric';
import { SQUARE_MATH } from '../../utils/squareMath';
import { createClippedImage } from '../../utils/fabricUtils';
import { createDefaultTextbox } from '../../utils/textUtils';

export const CircleTile = {
  create: (tileData, pixelPos, canvas) => {
    const { id, x: gridX, y: gridY, content, textConfig } = tileData;
    const { x, y } = pixelPos;
    const radius = (SQUARE_MATH.SIZE - 6) / 2;

    // ---------------------------------------------------------
    // ۱. شکل پایه (Background Shape)
    // ---------------------------------------------------------
    const shapeObj = new fabric.Circle({
      radius: radius,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      name: 'tile-bg',
      // حیاتی برای درگ شدن گروه
      selectable: false,
      evented: false
    });

    if (content?.type === 'color' && content.data) {
      shapeObj.set({ fill: content.data });
    }

    // ---------------------------------------------------------
    // ۲. مدیریت لایه‌های متن
    // ---------------------------------------------------------
    const textObjects = [];
    const scaleFactor = 1.5;

    if (textConfig?.layers && Array.isArray(textConfig.layers)) {
        // الف) لایه‌های جدید
        textConfig.layers.forEach(layer => {
            const safeLeft = layer.left ?? layer.previewLeft ?? 150;
            const safeTop = layer.top ?? layer.previewTop ?? 150;

            const relX = (safeLeft - 150) / scaleFactor;
            const relY = (safeTop - 150) / scaleFactor;

            const textObj = new fabric.Text(layer.text || '', {
                left: relX,
                top: relY,
                fontSize: (layer.fontSize || 24) / scaleFactor,
                fontFamily: layer.fontFamily || 'Vazirmatn',
                fill: layer.fill || '#000000',
                originX: 'center',
                originY: 'center',
                textAlign: 'center',
                angle: layer.angle || 0,
                
                stroke: layer.stroke || null,
                strokeWidth: (layer.strokeWidth || 0) / scaleFactor,
                textBackgroundColor: layer.textBackgroundColor || null,
                
                shadow: (layer.shadowBlur > 0 || layer.shadowOffsetX !== 0 || layer.shadowOffsetY !== 0) ? new fabric.Shadow({
                    color: layer.shadowColor || '#000000',
                    blur: (layer.shadowBlur || 0) / scaleFactor,
                    offsetX: (layer.shadowOffsetX || 0) / scaleFactor,
                    offsetY: (layer.shadowOffsetY || 0) / scaleFactor
                }) : null,

                selectable: false,
                evented: false
            });
            textObjects.push(textObj);
        });
    } else {
        // ب) نسخه قدیمی
        const initialText = textConfig?.text || content?.text || '';
        if (initialText) {
            const textBox = createDefaultTextbox((radius * 2) * 0.85, initialText);
            if (textConfig) {
                if (textConfig.fill) textBox.set('fill', textConfig.fill);
                if (textConfig.fontFamily) textBox.set('fontFamily', textConfig.fontFamily);
                if (textConfig.fontSize) textBox.set('fontSize', textConfig.fontSize);
            }
            textBox.set({ selectable: false, evented: false });
            textObjects.push(textBox);
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
      data: { id, x: gridX, y: gridY, shape: 'circle' }
    });

    // ---------------------------------------------------------
    // ۴. هندل کردن عکس
    // ---------------------------------------------------------
    if (content?.type === 'image' && content.data) {
      const clipFactory = () => new fabric.Circle({
        radius: radius,
        originX: 'center', originY: 'center'
      });

      createClippedImage(content.data, clipFactory, (img) => {
        if (!group || (group.canvas === undefined && !canvas)) return;

        group.add(img);
        
        const border = new fabric.Circle({
          radius: radius,
          fill: 'transparent', stroke: '#CBD5E1', strokeWidth: 2,
          originX: 'center', originY: 'center',
          selectable: false, evented: false
        });
        group.add(border);

        shapeObj.set({ fill: 'transparent', stroke: 'transparent' });
        
        group.getObjects().forEach(obj => {
            if (obj.type === 'text' || obj.type === 'textbox') {
                obj.bringToFront();
            }
        });

        if (canvas) canvas.requestRenderAll();
        else if (group.canvas) group.canvas.requestRenderAll();
      });
    }

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