import { fabric } from 'fabric';
import { SQUARE_MATH } from '../../utils/squareMath';
import { createClippedImage } from '../../utils/fabricUtils';

export const CircleTile = {
  create: (tileData, pixelPos, canvas) => {
    const { id, x: gridX, y: gridY, content } = tileData;
    const { x, y } = pixelPos;
    const radius = (SQUARE_MATH.SIZE - 6) / 2;

    // ۱. شکل پایه
    const shapeObj = new fabric.Circle({
      radius: radius,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false
    });

    // ۲. گروه
    const group = new fabric.Group([shapeObj], {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.05)',
        blur: 10,
        offsetX: 4,
        offsetY: 4
      }),
      data: { id, x: gridX, y: gridY, shape: 'circle' }
    });

    // ۳. تزریق عکس
    if (content?.type === 'image' && content.data) {
      const clipFactory = () => new fabric.Circle({
        radius: radius,
        originX: 'center', originY: 'center'
      });

      createClippedImage(content.data, clipFactory, (img) => {
        group.add(img);
        shapeObj.set({ fill: 'transparent', stroke: 'transparent' });

        const border = new fabric.Circle({
          radius: radius,
          fill: 'transparent', stroke: '#CBD5E1', strokeWidth: 2,
          originX: 'center', originY: 'center'
        });
        group.add(border);

        if (canvas) canvas.requestRenderAll();
      });
    }

        if (content?.type === 'image' && content.data) {
       // ... (کد قبلی مربوط به عکس و ماسک) ...
    } 
    else if (content?.type === 'color' && content.data) {
      // ✅ حالت رنگ: فقط رنگ پس‌زمینه شکل را عوض کن
      shapeObj.set({ fill: content.data });
      // اگر قبلا عکسی در گروه بود (مثلا در ادیت مجدد)، باید مطمئن بشیم پاک شده
      // اما چون در FabricCanvas هر بار کل بوم را از روی استور می‌سازیم،
      // خودبه‌خود وقتی استور عوض شه، اینجا از اول ساخته میشه و تمیزه.
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