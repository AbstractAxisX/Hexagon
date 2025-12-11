import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../store/useAppStore';
import { TileFactory } from './TileFactory';
import { hexToPixel, pixelToHex, getNeighbors, HEX_MATH } from '../../utils/hexMath';
import { Logger } from '../../utils/logger';

const COMPONENT = 'FabricCanvas';

const FabricCanvas = () => {
  const canvasEl = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);

  // اتصال اتمیک به استور برای جلوگیری از لوپ
  const tiles = useAppStore(state => state.tiles);
  const wallColor = useAppStore(state => state.wallColor);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);
  const viewMode = useAppStore(state => state.viewMode);
  const focusedTileId = useAppStore(state => state.focusedTileId);
  const setFocus = useAppStore(state => state.setFocus);
  const setOverview = useAppStore(state => state.setOverview);

  const ghostObjects = useRef([]);

  // ==================== 1. SETUP ====================
  useEffect(() => {
    if (!canvasEl.current) return;

    Logger.info(COMPONENT, 'Initializing...');

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
        // به جای updateCamera مستقیم، یک رندر ساده انجام میدیم تا ابعاد ست بشه
        // updateCamera در افکت جداگانه اجرا میشه
        canvas.requestRenderAll();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // ==================== 2. EVENT LISTENERS ====================

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }
      showGhostSlots(obj);
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      clearGhosts();
      obj.set({ opacity: 1 });

      handleDropLogic(obj, canvas);
    });

    canvas.on('mouse:down', (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    });

    canvas.on('mouse:dblclick', (e) => {
      if (!e.target) {
        setOverview();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // ==================== 3. SYNC TILES ====================
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // پاکسازی آبجکت‌های قدیمی (به جز گوست‌ها)
    canvas.getObjects().forEach(o => {
      if (o.type !== 'ghost') canvas.remove(o);
    });
    
    canvas.clear();
    canvas.setBackgroundColor(wallColor, () => {});

    tiles.forEach(tileData => {
      // کاشی‌ها را نسبت به مبدا جهانی (0,0) می‌سازیم
      const tileObj = TileFactory.create(tileData, { centerX: 0, centerY: 0 });
      canvas.add(tileObj);
    });

    // بعد از چیدن کاشی‌ها، دوربین را تنظیم کن
    // تایم‌اوت کوتاه برای اطمینان از اعمال تغییرات گرافیکی
    setTimeout(() => updateCamera(), 50);
    
  }, [tiles, wallColor]);

  // ==================== 4. CAMERA & ZOOM LOGIC ====================
  // این افکت هر وقت مود نمایش عوض شود اجرا می‌شود
  useEffect(() => {
    updateCamera();
  }, [viewMode, focusedTileId]);

  const updateCamera = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    if (tiles.length === 0) {
      // اگر کاشی نیست، زوم پیش‌فرض
      canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
      canvas.requestRenderAll();
      return;
    }

    let targetBounds = null;

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
    
    // اگر حالت Overview است یا کاشی فوکوس پیدا نشد
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

    if (targetBounds) {
      const scaleX = canvas.width / targetBounds.width;
      const scaleY = canvas.height / targetBounds.height;
      const zoom = Math.min(scaleX, scaleY);
      const finalZoom = Math.min(zoom, 2.5);

      const centerX = targetBounds.left + targetBounds.width / 2;
      const centerY = targetBounds.top + targetBounds.height / 2;

      // محاسبه پن نهایی (برای وسط‌چین کردن)
      const finalPanX = (canvas.width / 2) - (centerX * finalZoom);
      const finalPanY = (canvas.height / 2) - (centerY * finalZoom);

      // مقادیر فعلی
      const currentZoom = canvas.getZoom();
      const currentPanX = canvas.viewportTransform[4];
      const currentPanY = canvas.viewportTransform[5];

      // انیمیشن دستی با fabric.util.animate
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
          canvas.setCoords(); // آپدیت مختصات موس بعد از زوم
        },
        easing: fabric.util.ease.easeOutQuad
      });
    }
  };

// ==================== 5. GHOST & DROP LOGIC (FIXED) ====================
  
  const showGhostSlots = (draggedObj) => {
    const canvas = fabricRef.current;
    
    // اگر گوست‌ها قبلاً ساخته شده‌اند، فقط وضعیتشان را آپدیت کن (پرفورمنس)
    // اما برای اطمینان، فعلاً پاک می‌کنیم و دوباره می‌سازیم
    clearGhosts();

    const allTiles = useAppStore.getState().tiles;
    const existingCoords = new Set(allTiles.map(t => `${t.q},${t.r}`));
    const validGhostCoords = new Set();

    // ۱. پیدا کردن تمام جاهای خالی که همسایه شکل‌های موجود هستند
    allTiles.forEach(tile => {
      // کاشی در حال حرکت را نادیده بگیر (چون جایش موقتاً خالی فرض می‌شود)
      if (tile.id === draggedObj.data.id) return;

      const neighbors = getNeighbors(tile.q, tile.r);
      neighbors.forEach(n => {
        const key = `${n.q},${n.r}`;
        // اگر این خانه قبلاً پر نشده است، کاندیدای معتبر است
        if (!existingCoords.has(key)) {
          validGhostCoords.add(key);
        }
      });
    });

    // ۲. رندر کردن گوست‌ها
    validGhostCoords.forEach(key => {
      const [q, r] = key.split(',').map(Number);
      const pos = hexToPixel(q, r, 0, 0); // مختصات جهانی

      const ghost = TileFactory.createGhost({ q, r }, pos);
      
      // محاسبه فاصله موس تا این گوست
      const dist = Math.hypot(draggedObj.left - pos.x, draggedObj.top - pos.y);
      
      // لاجیک نمایش:
      if (dist < HEX_MATH.RADIUS * 0.8) {
        // اگر موس روی این خانه است: پررنگ و سبز
        ghost.set({ opacity: 0.8, scaleX: 1.05, scaleY: 1.05 });
        ghost.item(0).set({ stroke: '#4ade80', strokeWidth: 3, fill: 'rgba(74, 222, 128, 0.2)' });
      } else {
        // در غیر این صورت: کمرنگ و طوسی (تا کاربر بفهمد اینجا جای خالی هست)
        ghost.set({ opacity: 0.4, scaleX: 1, scaleY: 1 });
      }

      canvas.add(ghost);
      canvas.sendToBack(ghost); // حتما زیر همه باشد
      ghostObjects.current.push(ghost);
    });
  };

  const clearGhosts = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    ghostObjects.current.forEach(g => canvas.remove(g));
    ghostObjects.current = [];
  };

  const handleDropLogic = (obj, canvas) => {
    // ۱. مختصات جایی که رها شده
    const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
    const { id, q: oldQ, r: oldR } = obj.data;

    // ۲. دریافت وضعیت فعلی
    const allTiles = useAppStore.getState().tiles;
    
    // ۳. آیا مقصد توسط کاشی دیگری اشغال شده؟ (حالت SWAP)
    const targetTile = allTiles.find(t => t.q === q && t.r === r && t.id !== id);
    
    // ۴. آیا مقصد خالی است ولی به بقیه چسبیده؟ (حالت MOVE)
    // شرط: باید حداقل یکی از همسایه‌های مقصد، یک کاشی ثابت (غیر از خودمان) باشد
    const hasNeighbor = allTiles.some(t => {
      if (t.id === id) return false;
      const neighbors = getNeighbors(t.q, t.r);
      return neighbors.some(n => n.q === q && n.r === r);
    });

    // ۵. تصمیم‌گیری نهایی
    if (targetTile) {
      // روی کاشی دیگر رها شده -> تعویض جای
      moveOrSwapTile(id, q, r);
      Logger.success(COMPONENT, 'Swapped Tiles', { from: `${oldQ},${oldR}`, to: `${q},${r}` });
    } else if (hasNeighbor) {
      // روی جای خالیِ معتبر رها شده -> جابجایی
      moveOrSwapTile(id, q, r);
      Logger.success(COMPONENT, 'Moved Tile', { to: `${q},${r}` });
    } else {
      // جای پرت رها شده -> بازگشت به عقب
      Logger.warn(COMPONENT, 'Invalid Drop -> Reverting');
      const oldPos = hexToPixel(oldQ, oldR, 0, 0);
      obj.animate({
        left: oldPos.x,
        top: oldPos.y,
        opacity: 1
      }, {
        duration: 300,
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBack
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas ref={canvasEl} />
    </div>
  );
};

export default FabricCanvas;