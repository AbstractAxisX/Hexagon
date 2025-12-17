import { fabric } from 'fabric';
import { Logger } from '../../utils/logger';

const COMPONENT = 'CameraController';

// ✅ متغیر global برای جلوگیری از انیمیشن‌های همزمان
let activeAnimation = null;

export const updateCamera = (canvas, tiles, viewMode, focusedTileId) => {
  if (!canvas) return;

  // ✅ اگر انیمیشنی در حال اجراست، کنسلش کن
  if (activeAnimation) {
    try {
      fabric.util.cancelAnimFrame(activeAnimation);
    } catch (e) {
      // ignore
    }
    activeAnimation = null;
  }

  // اگر کاشی نداریم، زوم پیش‌فرض
  if (tiles.length === 0) {
    canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
    canvas.requestRenderAll();
    Logger.info(COMPONENT, 'Default Camera (No Tiles)');
    return;
  }

  let targetBounds = null;

  // حالت Focus
  if (viewMode === 'focused' && focusedTileId) {
    const targetObj = canvas.getObjects().find(o => o.data?.id === focusedTileId);
    
    if (targetObj) {
      const bounds = targetObj.getBoundingRect();
      const padding = 80;
      targetBounds = {
        left: bounds.left - padding,
        top: bounds.top - padding,
        width: bounds.width + (padding * 2),
        height: bounds.height + (padding * 2)
      };
      Logger.info(COMPONENT, 'Focusing on Tile', { id: focusedTileId });
    }
  }

  // حالت Overview
  if (!targetBounds) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasTiles = false;

    canvas.getObjects().forEach(obj => {
      if (obj.data?.id) {
        hasTiles = true;
        const bounds = obj.getBoundingRect();
        if (bounds.left < minX) minX = bounds.left;
        if (bounds.top < minY) minY = bounds.top;
        if (bounds.left + bounds.width > maxX) maxX = bounds.left + bounds.width;
        if (bounds.top + bounds.height > maxY) maxY = bounds.top + bounds.height;
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
      Logger.info(COMPONENT, 'Overview Mode', { tiles: tiles.length });
    }
  }

  // انیمیشن دوربین
  if (targetBounds) {
    animateCamera(canvas, targetBounds);
  }
};

const animateCamera = (canvas, targetBounds) => {
  const scaleX = canvas.width / targetBounds.width;
  const scaleY = canvas.height / targetBounds.height;
  const zoom = Math.min(scaleX, scaleY);
  const finalZoom = Math.min(Math.max(zoom, 0.5), 2.5); // محدودیت زوم بین 0.5 تا 2.5

  const centerX = targetBounds.left + targetBounds.width / 2;
  const centerY = targetBounds.top + targetBounds.height / 2;

  const finalPanX = (canvas.width / 2) - (centerX * finalZoom);
  const finalPanY = (canvas.height / 2) - (centerY * finalZoom);

  const currentZoom = canvas.getZoom();
  const currentPanX = canvas.viewportTransform[4];
  const currentPanY = canvas.viewportTransform[5];

  // ✅ چک کن که آیا تغییر معناداری هست؟
  const zoomDiff = Math.abs(finalZoom - currentZoom);
  const panDiffX = Math.abs(finalPanX - currentPanX);
  const panDiffY = Math.abs(finalPanY - currentPanY);

  // اگر تفاوت خیلی کم است، بدون انیمیشن تنظیم کن
  if (zoomDiff < 0.01 && panDiffX < 5 && panDiffY < 5) {
    canvas.setZoom(finalZoom);
    canvas.viewportTransform[4] = finalPanX;
    canvas.viewportTransform[5] = finalPanY;
    canvas.requestRenderAll();
    Logger.info(COMPONENT, 'Camera Adjusted (No Animation)');
    return;
  }

  activeAnimation = fabric.util.animate({
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
      activeAnimation = null;
      Logger.success(COMPONENT, 'Camera Animation Complete', { zoom: finalZoom });
    },
    easing: fabric.util.ease.easeOutCubic
  });
};
