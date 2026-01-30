import { fabric } from 'fabric';
import { getHexPoints, HEX_MATH } from '../../utils/hexMath';
import { createClippedImage } from '../../utils/fabricUtils';
import { createDefaultTextbox } from '../../utils/textUtils';

export const HexTile = {
  create: (tileData, pixelPos, canvas) => {
    const { id, q, r, content, textConfig } = tileData;
    const { x, y } = pixelPos;
    const hexPoints = getHexPoints();

    // ---------------------------------------------------------
    // ۱. شکل پایه (Background Shape)
    // ---------------------------------------------------------
    const shapeObj = new fabric.Polygon(hexPoints, {
      fill: '#FFFFFF', // پیش‌فرض سفید
      stroke: '#CBD5E1',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      name: 'tile-bg',
      // تنظیمات حیاتی برای درگ شدن گروه
      selectable: false,
      evented: false
    });

    if (content?.type === 'color' && content.data) {
      shapeObj.set({ fill: content.data });
    }

    // ---------------------------------------------------------
    // ۲. مدیریت لایه‌های متن (Multi-Layer & Legacy Support)
    // ---------------------------------------------------------
    const textObjects = [];
    // ضریب اسکیل: چون در پریویو ۳۰۰x۳۰۰ ادیت کردیم اما اینجا کاشی حدود ۱۰۰px است
    const scaleFactor = 1.5; 

    if (textConfig?.layers && Array.isArray(textConfig.layers)) {
        // الف) رندر کردن لایه‌های جدید (از ادیتور پیشرفته)
        textConfig.layers.forEach(layer => {
            // 🛠️ فیکس مشکل غیب شدن: 
            // اگر left/top ذخیره نشده بود (لایه جدید)، از previewLeft استفاده کن، اگر آن هم نبود ۱۵۰ (وسط) بگذار
            const safeLeft = layer.left ?? layer.previewLeft ?? 150;
            const safeTop = layer.top ?? layer.previewTop ?? 150;

            // تبدیل مختصات پریویو به مختصات گروه
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
                
                // استایل‌ها
                stroke: layer.stroke || null,
                strokeWidth: (layer.strokeWidth || 0) / scaleFactor,
                textBackgroundColor: layer.textBackgroundColor || null,
                
                // سایه (با رعایت اسکیل)
                shadow: (layer.shadowBlur > 0 || layer.shadowOffsetX !== 0 || layer.shadowOffsetY !== 0) ? new fabric.Shadow({
                    color: layer.shadowColor || '#000000',
                    blur: (layer.shadowBlur || 0) / scaleFactor,
                    offsetX: (layer.shadowOffsetX || 0) / scaleFactor,
                    offsetY: (layer.shadowOffsetY || 0) / scaleFactor
                }) : null,

                // 🛑 حیاتی: این متن‌ها نباید جداگانه قابل انتخاب باشند تا گروه درگ شود
                selectable: false,
                evented: false
            });
            textObjects.push(textObj);
        });
    } else {
        // ب) پشتیبانی از تایل‌های قدیمی (Legacy)
        // اگر سیستم لایه ای نبود، چک میکنیم متن ساده قدیمی هست یا نه
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
    // ۳. ساخت گروه (Group Assembly)
    // ---------------------------------------------------------
    const group = new fabric.Group([shapeObj, ...textObjects], {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      
      // تنظیمات گروه
      hasControls: false, 
      hasBorders: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      
      // ✅ درگ و دراپ فعال (گروه ایونت می‌گیرد)
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
    // ۴. هندل کردن عکس (Image Handling)
    // ---------------------------------------------------------
    if (content?.type === 'image' && content.data) {
      const clipFactory = () => new fabric.Polygon(hexPoints, {
        originX: 'center', originY: 'center'
      });

      createClippedImage(content.data, clipFactory, (img) => {
        if (!group || (group.canvas === undefined && !canvas)) return;

        group.add(img);
        
        const border = new fabric.Polygon(hexPoints, {
          fill: 'transparent',
          stroke: '#CBD5E1',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });
        group.add(border);

        shapeObj.set({ fill: 'transparent', stroke: 'transparent' });

        // ✅ آوردن تمام لایه‌های متن به روی عکس
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

  // متد گوست بدون تغییر
  createGhost: (gridPos, pixelPos) => {
    const { q, r } = gridPos;
    const points = getHexPoints();
    const shapeObj = new fabric.Polygon(points, {
      fill: 'rgba(0,0,0,0.05)', stroke: '#cbd5e1', strokeWidth: 2, strokeDashArray: [10, 5],
      originX: 'center', originY: 'center', selectable: false, evented: false, objectCaching: false
    });
    return new fabric.Group([shapeObj], {
      left: pixelPos.x, top: pixelPos.y, originX: 'center', originY: 'center',
      selectable: false, evented: false, opacity: 0,
      data: { type: 'ghost', q, r, shape: 'hex' }
    });
  }
};