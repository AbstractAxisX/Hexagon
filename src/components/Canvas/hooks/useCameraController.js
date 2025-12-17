import { useEffect } from 'react';
import { fabric } from 'fabric';

export const useCameraController = (fabricRef, tiles, viewMode, focusedTileId) => {
  
  const updateCamera = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // ۱. اگر کاشی نیست، ریست کن
    if (tiles.length === 0) {
      canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
      canvas.requestRenderAll();
      return;
    }

    let targetBounds = null;

    // ۲. پیدا کردن هدف (تک کاشی یا کل گروه)
    if (viewMode === 'focused' && focusedTileId) {
      const targetObj = canvas.getObjects().find(o => o.data?.id === focusedTileId);
      if (targetObj) {
        const padding = 50;
        targetBounds = {
          left: targetObj.left - padding,
          top: targetObj.top - padding,
          width: targetObj.width + (padding * 2),
          height: targetObj.height + (padding * 2)
        };
      }
    }

    if (!targetBounds) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let hasTiles = false;

      canvas.getObjects().forEach(obj => {
        if (obj.data?.id) {
          hasTiles = true;
          if (obj.left < minX) minX = obj.left;
          if (obj.top < minY) minY = obj.top;
          if (obj.left + obj.width > maxX) maxX = obj.left + obj.width;
          if (obj.top + obj.height > maxY) maxY = obj.top + obj.height;
        }
      });

      if (hasTiles) {
        const padding = 150;
        targetBounds = {
          left: minX - padding,
          top: minY - padding,
          width: (maxX - minX) + (padding * 2),
          height: (maxY - minY) + (padding * 2)
        };
      }
    }

    // ۳. انیمیشن حرکت
    if (targetBounds) {
      const scaleX = canvas.width / targetBounds.width;
      const scaleY = canvas.height / targetBounds.height;
      const zoom = Math.min(scaleX, scaleY);
      const finalZoom = Math.min(zoom, 2.5);

      const centerX = targetBounds.left + targetBounds.width / 2;
      const centerY = targetBounds.top + targetBounds.height / 2;

      const finalPanX = (canvas.width / 2) - (centerX * finalZoom);
      const finalPanY = (canvas.height / 2) - (centerY * finalZoom);

      const currentZoom = canvas.getZoom();
      const currentPanX = canvas.viewportTransform[4];
      const currentPanY = canvas.viewportTransform[5];

      fabric.util.animate({
        startValue: 0,
        endValue: 1,
        duration: 400,
        onChange: function(value) {
          const newZoom = currentZoom + (finalZoom - currentZoom) * value;
          const newPanX = currentPanX + (finalPanX - currentPanX) * value;
          const newPanY = currentPanY + (finalPanY - currentPanY) * value;

          canvas.setZoom(newZoom);
          canvas.viewportTransform[4] = newPanX;
          canvas.viewportTransform[5] = newPanY;
          canvas.requestRenderAll();
        },
        onComplete: function() {
          canvas.setCoords();
        },
        easing: fabric.util.ease.easeOutQuad
      });
    }
  };

  // هر وقت وابستگی‌ها تغییر کرد، دوربین آپدیت شود
  useEffect(() => {
    // یک تاخیر کوچک برای اطمینان از رندر شدن آبجکت‌ها
    const timer = setTimeout(() => updateCamera(), 50);
    return () => clearTimeout(timer);
  }, [tiles, viewMode, focusedTileId]);

  return { updateCamera };
};