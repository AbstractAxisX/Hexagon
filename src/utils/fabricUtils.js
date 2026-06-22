import { fabric } from 'fabric';

/**
 * آماده‌سازی عکس با کلیپ‌پث
 *
 * ✅ NEW: اگه targetSize بگیره، عکس رو cover-mode به اون سایز scale می‌کنه.
 *    اینطوری چیزی که توی کراپر دیدی، دقیقاً همون روی کاشی می‌افته.
 *
 * @param {string}   imageUrl
 * @param {Function} clipShapeFactory  - تابع ساخت clipPath
 * @param {Function} callback          - (img) => void
 * @param {Object}   options
 *   @param {number} options.targetSize - سایز هدف (پیکسل) برای scale
 *   @param {string} options.fitMode    - 'cover' | 'contain'
 */
export const createClippedImage = (imageUrl, clipShapeFactory, callback, options = {}) => {
  if (!imageUrl) return;

  const { targetSize = null, fitMode = 'cover' } = options;

  fabric.Image.fromURL(imageUrl, (img) => {
    if (!img) return;

    // ✅ scale عکس به سایز هدف — این کلید حل مشکل size mismatch است
    if (targetSize && img.width && img.height) {
      const scale = fitMode === 'cover'
        ? Math.max(targetSize / img.width, targetSize / img.height)
        : Math.min(targetSize / img.width, targetSize / img.height);
      img.set({ scaleX: scale, scaleY: scale });
    }

    // ۱. ساخت ماسک
    const clipPath = clipShapeFactory();
    clipPath.set({
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      absolutePositioned: false
    });

    // ۲. تنظیمات عکس
    img.set({
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      clipPath: clipPath,
    });

    callback(img);
  });
};
