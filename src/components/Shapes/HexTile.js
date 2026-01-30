import { fabric } from 'fabric';
import { getHexPoints, getHexPathData, HEX_MATH } from '../../utils/hexMath';
import { createClippedImage } from '../../utils/fabricUtils';

export const HexTile = {
  create: (tileData, pixelPos, canvas) => {
    // گرفتن همه داده‌های لازم
    const { id, q, r, content, corner, textConfig } = tileData;
    const { x, y } = pixelPos;
    
    // تشخیص نوع گوشه
    const isRounded = corner === 'rounded';
    const cornerRadius = 10; 

    // ---------------------------------------------------------
    // ۱. شکل پایه (Background Shape)
    // ---------------------------------------------------------
    let shapeObj;
    if (isRounded) {
      // حالت گرد: Path
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
      // حالت تیز: Polygon
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

    // اعمال رنگ پس‌زمینه
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
        // ب) پشتیبانی Legacy
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
                evented: false
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
    // ۴. هندل کردن عکس (اصلاح شده)
    // ---------------------------------------------------------
    if (content?.type === 'image' && content.data) {
      const clipFactory = () => {
        if (isRounded) {
          return new fabric.Path(getHexPathData(cornerRadius), {
            originX: 'center', originY: 'center'
          });
        } else {
          return new fabric.Polygon(getHexPoints(), {
            originX: 'center', originY: 'center'
          });
        }
      };

      createClippedImage(content.data, clipFactory, (img) => {
        if (!group) return;

        // الف) اضافه کردن عکس
        group.add(img);
        
        // ب) شفاف کردن شکل زیرین
        shapeObj.set({ fill: 'transparent', stroke: 'transparent' });

        // ج) بوردر روی عکس
        let border;
        if (isRounded) {
             border = new fabric.Path(getHexPathData(cornerRadius), {
                fill: 'transparent',
                stroke: '#CBD5E1',
                strokeWidth: 2,
                originX: 'center',
                originY: 'center',
                selectable: false, evented: false
            });
        } else {
             border = new fabric.Polygon(getHexPoints(), {
                fill: 'transparent',
                stroke: '#CBD5E1',
                strokeWidth: 2,
                originX: 'center',
                originY: 'center',
                selectable: false, evented: false
            });
        }
        group.add(border);

        // د) ✅ فیکس نهایی: استفاده دقیق از روش SquareTile
        group.getObjects().forEach(obj => {
            if (obj.type === 'text' || obj.type === 'textbox') {
                obj.bringToFront(); // دقیقا مثل SquareTile.js
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