import { fabric } from 'fabric';
import { hexToPixel, getHexPoints } from '../../utils/hexMath';

/**
 * کارخانه تولید کاشی (Tile Factory)
 * وظیفه: ساختن آبجکت‌های گرافیکی Fabric.js بر اساس دیتای استور
 */
export const TileFactory = {
  /**
   * @param {object} tileData - دیتای کاشی {id, q, r, ...}
   * @param {object} canvasConfig - تنظیمات مرکز بوم {centerX, centerY}
   */
  create: (tileData, canvasConfig) => {
    const { q, r, id } = tileData;
    const { centerX, centerY } = canvasConfig;

    // ۱. محاسبه مختصات دقیق پیکسلی روی صفحه
    const { x, y } = hexToPixel(q, r, centerX, centerY);

    // ۲. گرفتن نقاط ۶ ضلعی از فایل ریاضی
    const points = getHexPoints();

    // ۳. ساخت لایه زیرین (قاب ۶ ضلعی)
    const hexPoly = new fabric.Polygon(points, {
      fill: '#FFFFFF',       // رنگ زمینه سفید
      stroke: '#CBD5E1',     // حاشیه طوسی کمرنگ (Tailwind slate-300)
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      objectCaching: false   // برای کیفیت بالا موقع زوم
    });

    // ۴. ساخت گروه (Container)
    // این گروه بعداً شامل عکس، متن و افکت‌ها میشه
    const group = new fabric.Group([hexPoly], {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      
      // قفل کردن تغییر سایز دستی (کاربر نباید بتونه شکل رو دفرمه کنه)
      hasControls: false,
      hasBorders: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      
      // سایه نرم (Drop Shadow)
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.05)',
        blur: 10,
        offsetX: 4,
        offsetY: 4
      }),

      // ذخیره دیتای اصلی داخل آبجکت (برای شناسایی موقع کلیک)
      data: { 
        id: id,
        q: q, 
        r: r 
      }
    });

    return group;
  },

  
  /**
   * ساخت کاشی روح (نشانگر جای خالی)
   */
  createGhost: (gridPos, pixelPos) => {
    const points = getHexPoints();
    
    const hexPoly = new fabric.Polygon(points, {
      fill: 'rgba(0,0,0,0.05)', // کمی طوسی تا دیده شود
      stroke: '#cbd5e1',       // حاشیه طوسی (Tailwind slate-300)
      strokeWidth: 2,
      strokeDashArray: [10, 5], // خط‌چین
      originX: 'center',
      originY: 'center',
      selectable: false,        // غیرقابل انتخاب
      evented: false,           // عبور موس از روی آن
      objectCaching: false
    });

    const group = new fabric.Group([hexPoly], {
      left: pixelPos.x,
      top: pixelPos.y,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      opacity: 0, // پیش‌فرض مخفی (توسط کد بوم مدیریت می‌شود)
      data: { 
        type: 'ghost',
        q: gridPos.q, 
        r: gridPos.r 
      }
    });

    return group;
  }
};
