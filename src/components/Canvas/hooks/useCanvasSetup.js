import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Logger } from '../../../utils/logger';

export const useCanvasSetup = (canvasEl, containerRef, wallColor) => {
  const fabricRef = useRef(null);

  useEffect(() => {
    if (!canvasEl.current) return;

    Logger.info('CanvasSetup', 'Initializing...');

    const canvas = new fabric.Canvas(canvasEl.current, {
      selection: false,
      preserveObjectStacking: true,
      backgroundColor: wallColor,
      renderOnAddRemove: false,
      hoverCursor: 'default',
    });

    fabricRef.current = canvas;

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