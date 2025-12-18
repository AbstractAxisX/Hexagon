import { useEffect } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';
import { Logger } from '../../../utils/logger';
import { pixelToHex, getNeighbors, hexToPixel } from '../../../utils/hexMath';
import { pixelToSquare, getSquareNeighbors, squareToPixel } from '../../../utils/squareMath';


export const useCanvasEvents = (fabricRef, ghostManager, trashRef, setTrashHovered) => {
  const { showGhostSlots, clearGhosts } = ghostManager;
  
  const setFocus = useAppStore(state => state.setFocus);
  const openEditModal = useAppStore(state => state.openEditModal); // ✅ جدید
  const setOverview = useAppStore(state => state.setOverview);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);
  const removeTile = useAppStore(state => state.removeTile); // ✅ تابع حذف از استور

  // تابع کمکی برای تشخیص برخورد با سطل زباله
  const isOverTrash = (e) => {
    if (!trashRef.current || !e) return false;
    
    // گرفتن مختصات موس نسبت به کل صفحه (Viewport)
    // نکته: fabric event دارای e.e (native event) است
    const { clientX, clientY } = e.e; 
    
    const trashRect = trashRef.current.getBoundingClientRect();
    
    return (
      clientX >= trashRect.left &&
      clientX <= trashRect.right &&
      clientY >= trashRect.top &&
      clientY <= trashRect.bottom
    );
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // --- 1. Moving ---
    const handleObjectMoving = (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      // اگر زوم بود، برگرد به نمای کلی
      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }

      // 🗑️ چک کردن اینکه روی سطل زباله هستیم یا نه
      const hoveringTrash = isOverTrash(e);
      setTrashHovered(hoveringTrash);

      if (hoveringTrash) {
        // اگر روی سطل زباله است، گوست‌ها را مخفی کن تا گیج نشود
        clearGhosts();
        obj.set({ opacity: 0.3 }); // کمرنگ‌تر شدن شکل برای القای حذف
      } else {
        // اگر روی سطل نیست، گوست‌ها را نشان بده
        showGhostSlots(obj);
      }
    };

    // --- 2. Drop / Modified ---
    const handleObjectModified = (e) => {
      const obj = e.target;
      
      // 🗑️ اول چک کن آیا باید حذف شود؟
      if (isOverTrash(e)) {
        const { id } = obj.data;
        
        // ۱. حذف از استور
        removeTile(id);
        
        // ۲. حذف گرافیکی از بوم
        canvas.remove(obj);
        canvas.requestRenderAll();
        
        // ۳. ریست کردن وضعیت‌ها
        clearGhosts();
        setTrashHovered(false);
        Logger.info('CanvasEvents', '🗑️ Item Deleted via Drag', { id });
        return; // پایان تابع، دیگه دراپ لاجیک اجرا نشه
      }

      // اگر حذف نشد، ادامه منطق دراپ معمولی...
      clearGhosts();
      obj.set({ opacity: 1 });
      setTrashHovered(false); // محض اطمینان
      handleDropLogic(obj, canvas);
    };

    const handleMouseDown = (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    };

    const handleDblClick = (e) => {
if (e.target && e.target.data?.id) {
        // اگر روی شکل دبل کلیک شد
        const tileId = e.target.data.id;
        console.log('📝 Edit Tile:', tileId);
        openEditModal(tileId);
      } else {
        // اگر روی فضای خالی دبل کلیک شد
        setOverview();
      }
    };

    

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:dblclick', handleDblClick);
    

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:dblclick', handleDblClick);
    };
  }, [fabricRef.current]); // وابسته به رفرنس بوم

  // --- Drop Logic (بدون تغییر، فقط برای تکمیل کد) ---
  const handleDropLogic = (obj, canvas) => {
    const allTiles = useAppStore.getState().tiles;
    const { id, shape } = obj.data;
    let targetCoord, oldCoord, targetTile, hasNeighbor;

    if (shape === 'hex') {
      const { q, r } = pixelToHex(obj.left, obj.top, 0, 0);
      targetCoord = { q, r };
      oldCoord = { q: obj.data.q, r: obj.data.r };
      targetTile = allTiles.find(t => t.shape === 'hex' && t.q === q && t.r === r && t.id !== id);
      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape !== 'hex') return false;
        return getNeighbors(t.q, t.r).some(n => n.q === q && n.r === r);
      });
    } else {
      const { x, y } = pixelToSquare(obj.left, obj.top, 0, 0);
      targetCoord = { x, y };
      oldCoord = { x: obj.data.x, y: obj.data.y };
      targetTile = allTiles.find(t => t.shape !== 'hex' && t.x === x && t.y === y && t.id !== id);
      hasNeighbor = allTiles.some(t => {
        if (t.id === id || t.shape === 'hex') return false;
        return getSquareNeighbors(t.x, t.y).some(n => n.x === x && n.y === y);
      });
    }

    if (targetTile) {
      moveOrSwapTile(id, targetCoord);
    } else if (hasNeighbor) {
      moveOrSwapTile(id, targetCoord);
    } else {
      let oldPos;
      if (shape === 'hex') oldPos = hexToPixel(oldCoord.q, oldCoord.r, 0, 0);
      else oldPos = squareToPixel(oldCoord.x, oldCoord.y, 0, 0);

      obj.animate({ left: oldPos.x, top: oldPos.y, opacity: 1 }, {
        duration: 300,
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBack
      });
    }
  };
};