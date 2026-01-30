import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Logger } from '../../../utils/logger';

export const useCanvasSetup = (canvasEl, containerRef, wallColor) => {
  const fabricRef = useRef(null);

  useEffect(() => {
    if (!canvasEl.current) return;

    Logger.info('CanvasSetup', 'Initializing...');

    const canvas = new fabric.Canvas(canvasEl.current, {
      selection: false, // انتخاب گروهی با درگ موس (در موبایل مزاحم است)
      preserveObjectStacking: true,
      backgroundColor: wallColor,
      renderOnAddRemove: false,
      hoverCursor: 'default',
      allowTouchScrolling: false, // 🔒 جلوگیری از اسکرول در موبایل
      fireRightClick: true, // برای منوهای احتمالی آینده
      stopContextMenu: true, // جلوگیری از منوی راست کلیک مرورگر
    });

    fabricRef.current = canvas;

    // 🔒 اعمال هک CSS برای اطمینان ۱۰۰ درصدی در iOS و Android
    // این کار باعث می‌شود مرورگر بفهمد که تاچ‌های روی این المنت برای اسکرول نیستند
    if (canvas.upperCanvasEl) {
      canvas.upperCanvasEl.style.touchAction = 'none';
    }
    if (canvas.lowerCanvasEl) {
      canvas.lowerCanvasEl.style.touchAction = 'none';
    }

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.offsetWidth);
        canvas.setHeight(containerRef.current.offsetHeight);
        canvas.requestRenderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // اجرا فقط یکبار

  // آپدیت رنگ دیوار جداگانه
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setBackgroundColor(wallColor, () => {
        fabricRef.current.requestRenderAll();
      });
    }
  }, [wallColor]);

  return fabricRef;
};