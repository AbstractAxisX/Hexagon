import { fabric } from 'fabric';
import { getHexPoints } from '../../utils/hexMath';
import { createClippedImage } from '../../utils/fabricUtils';

export const HexTile = {
  create: (tileData, pixelPos, canvas) => {
    const { id, q, r, content } = tileData;
    const { x, y } = pixelPos;
    const hexPoints = getHexPoints();

    // ۱. ساخت شکل پایه (همیشه ساخته می‌شود تا جایگاه حفظ شود)
    const shapeObj = new fabric.Polygon(hexPoints, {
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false
    });

    // ۲. ساخت گروه با شکل پایه (این باعث می‌شود مختصات x,y دقیق باشد)
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

    // ۳. اگر عکس داریم، آن را لود و به گروه تزریق کن
    if (content?.type === 'image' && content.data) {
      // فکتوری برای ماسک (دقیقاً همان شکل پایه)
      const clipFactory = () => new fabric.Polygon(hexPoints, {
        originX: 'center', originY: 'center'
      });

      createClippedImage(content.data, clipFactory, (img) => {
        // چک می‌کنیم اگر گروه هنوز روی بوم هست (حذف نشده)
        // الف) عکس را اضافه کن (روی شکل سفید)
        group.add(img);
        
        // ب) شکل سفید زیرین را شفاف کن (یا حذف کن)
        // شفاف کردن بهتر است چون سایز گروه را حفظ می‌کند
        shapeObj.set({ fill: 'transparent', stroke: 'transparent' }); 

        // ج) اضافه کردن یک بوردر تمیز روی عکس (چون شکل سفید شفاف شد)
        const border = new fabric.Polygon(hexPoints, {
          fill: 'transparent',
          stroke: '#CBD5E1',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center'
        });
        group.add(border);

        // د) رندر مجدد
        if (canvas) canvas.requestRenderAll();
      });
    }

    // قسمتی از فایل HexTile.js (مشابه برای Square و Circle)

    // ... (ساخت shapeObj و group)

    // ۳. لاجیک محتوا (Content Logic)
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