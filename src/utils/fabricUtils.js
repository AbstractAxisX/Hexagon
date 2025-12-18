import { fabric } from 'fabric';

/**
 * آماده‌سازی عکس با کلیپ‌پث (بدون تغییر سایز، چون عکس ورودی دقیق است)
 */
export const createClippedImage = (imageUrl, clipShapeFactory, callback) => {
  if (!imageUrl) return;

  fabric.Image.fromURL(imageUrl, (img) => {
    if (!img) return;

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