// ============================================================
// exportCanvas.js — گرفتن خروجی باکیفیت از کل طرح کاربر
// خروجی: یه فایل PNG از تمام کاشی‌ها، فریم‌بندی‌شده و تمیز
// ============================================================
import { fabric } from 'fabric';

/**
 * از روی fabricCanvas یه عکس باکیفیت از کل کاشی‌ها می‌گیره.
 * دوربین رو موقتاً جابه‌جا نمی‌کنه (روی همون canvas اصلی کار نمی‌کنه)،
 * بلکه یه canvas موقت و نامرئی می‌سازه، تایل‌ها رو توش کلون می‌کنه،
 * و از همون export می‌گیره. این یعنی صفحه کاربر هیچ تکونی نمی‌خوره.
 *
 * @param {fabric.Canvas} mainCanvas - رفرنس بوم اصلی (از useAppStore.fabricCanvas)
 * @param {string} wallColor - رنگ پس‌زمینه فعلی
 * @param {object} options - { padding, multiplier, format }
 * @returns {Promise<string>} dataURL آماده دانلود
 */
export function exportDesignAsImage(mainCanvas, wallColor = '#1a1a1a', options = {}) {
  return new Promise((resolve, reject) => {
    if (!mainCanvas) {
      reject(new Error('بومی برای خروجی گرفتن وجود ندارد'));
      return;
    }

    const {
      padding    = 80,    // فاصله اطراف کاشی‌ها از لبه عکس (px در مقیاس واقعی)
      multiplier = 2,      // ضریب کیفیت (2 = دو برابر رزولوشن صفحه، خروجی شارپ)
      format     = 'png',  // png برای کیفیت بی‌نقص، jpeg برای حجم کمتر
    } = options;

    // فقط آبجکت‌های واقعی کاشی (data.id دارن)، نه ghost ها یا چیز دیگه
    const tileObjects = mainCanvas.getObjects().filter(o => o.data?.id);

    if (tileObjects.length === 0) {
      reject(new Error('هیچ کاشی‌ای برای خروجی گرفتن وجود ندارد'));
      return;
    }

    // محاسبه‌ی کادر دربرگیرنده‌ی همه‌ی کاشی‌ها
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    tileObjects.forEach(obj => {
      const bound = obj.getBoundingRect(true, true);
      minX = Math.min(minX, bound.left);
      minY = Math.min(minY, bound.top);
      maxX = Math.max(maxX, bound.left + bound.width);
      maxY = Math.max(maxY, bound.top + bound.height);
    });

    const contentWidth  = maxX - minX;
    const contentHeight = maxY - minY;
    const exportWidth   = contentWidth  + padding * 2;
    const exportHeight  = contentHeight + padding * 2;

    // ── یه canvas موقت و نامرئی فقط برای export ──
    const tempEl = document.createElement('canvas');
    const tempCanvas = new fabric.Canvas(tempEl, {
      width: exportWidth,
      height: exportHeight,
      backgroundColor: wallColor,
    });

    // کلون کردن هر کاشی و قرارش دادن با آفست درست نسبت به کادر جدید
    const clonePromises = tileObjects.map(obj => {
      return new Promise(res => {
        obj.clone(cloned => {
          cloned.set({
            left: obj.left - minX + padding,
            top:  obj.top  - minY + padding,
            selectable: false,
            evented: false,
          });
          tempCanvas.add(cloned);
          res();
        });
      });
    });

    Promise.all(clonePromises).then(() => {
      tempCanvas.renderAll();

      const dataUrl = tempCanvas.toDataURL({
        format,
        quality: 1,
        multiplier,
      });

      tempCanvas.dispose();
      resolve(dataUrl);
    }).catch(reject);
  });
}

/**
 * دانلود مستقیم عکس برای کاربر (یا می‌تونی dataUrl رو به‌جاش به بکند بفرستی)
 */
export function downloadImage(dataUrl, filename = 'my-tile-design.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * تبدیل dataURL به Blob — برای آپلود مستقیم به بکند (FormData)
 */
export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}