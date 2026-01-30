import { useEffect } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';
import { Logger } from '../../../utils/logger';
import { pixelToHex, getNeighbors, hexToPixel } from '../../../utils/hexMath';
import { pixelToSquare, getSquareNeighbors, squareToPixel } from '../../../utils/squareMath';


export const useCanvasEvents = (fabricRef, ghostManager, trashRef, setTrashHovered) => {
  const { showGhostSlots, clearGhosts } = ghostManager;
  
  const setFocus = useAppStore(state => state.setFocus);
  const openEditModal = useAppStore(state => state.openEditModal);
  const setOverview = useAppStore(state => state.setOverview);
  const moveOrSwapTile = useAppStore(state => state.moveOrSwapTile);
  const removeTile = useAppStore(state => state.removeTile);

  // ✅ تابع کمکی جدید: استخراج مختصات چه از موس، چه از تاچ
  const getClientCoords = (e) => {
    const nativeEvent = e.e; // رویداد اصلی مرورگر

    // 1. اگر تاچ در حال انجام است (Touch Move / Start)
    if (nativeEvent.touches && nativeEvent.touches.length > 0) {
      return {
        x: nativeEvent.touches[0].clientX,
        y: nativeEvent.touches[0].clientY
      };
    }
    // 2. اگر تاچ تمام شده (Touch End / Drop)
    else if (nativeEvent.changedTouches && nativeEvent.changedTouches.length > 0) {
      return {
        x: nativeEvent.changedTouches[0].clientX,
        y: nativeEvent.changedTouches[0].clientY
      };
    }
    // 3. حالت استاندارد موس
    return {
      x: nativeEvent.clientX,
      y: nativeEvent.clientY
    };
  };

  // تابع تشخیص برخورد با سطل زباله (اصلاح شده برای موبایل)
  const isOverTrash = (e) => {
    if (!trashRef.current || !e) return false;
    
    // دریافت مختصات صحیح
    const { x, y } = getClientCoords(e);
    
    // دریافت ابعاد سطل زباله
    const trashRect = trashRef.current.getBoundingClientRect();
    
    // بررسی برخورد (Collision Detection)
    return (
      x >= trashRect.left &&
      x <= trashRect.right &&
      y >= trashRect.top &&
      y <= trashRect.bottom
    );
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // --- 1. Moving ---
    const handleObjectMoving = (e) => {
      const obj = e.target;
      obj.set({ opacity: 0.5 });

      if (useAppStore.getState().viewMode === 'focused') {
        setOverview();
      }

      // چک کردن سطل زباله با مختصات جدید
      const hoveringTrash = isOverTrash(e);
      setTrashHovered(hoveringTrash);

      if (hoveringTrash) {
        clearGhosts();
        obj.set({ opacity: 0.3 }); // کمرنگ‌تر شدن برای القای حذف
      } else {
        showGhostSlots(obj);
      }
    };

    // --- 2. Drop / Modified ---
    const handleObjectModified = (e) => {
      const obj = e.target;
      
      // لاجیک حذف (دراپ روی سطل)
      if (isOverTrash(e)) {
        const { id } = obj.data;
        
        removeTile(id); // حذف از استور
        canvas.remove(obj); // حذف از بوم
        canvas.requestRenderAll();
        
        clearGhosts();
        setTrashHovered(false);
        Logger.info('CanvasEvents', '🗑️ Item Deleted via Drag', { id });
        return; // توقف عملیات، دیگر اسنپ انجام نشود
      }

      // ادامه منطق دراپ معمولی (اسنپ به گرید)
      clearGhosts();
      obj.set({ opacity: 1 });
      setTrashHovered(false);
      handleDropLogic(obj, canvas);
    };

    const handleMouseDown = (e) => {
      if (e.target && e.target.data?.id) {
        setFocus(e.target.data.id);
      }
    };

    // این هندلر برای دسکتاپ است (برای موبایل دکمه مداد را اضافه کردیم)
    const handleDblClick = (e) => {
      if (e.target && e.target.data?.id) {
        const tileId = e.target.data.id;
        console.log('📝 Edit Tile:', tileId);
        openEditModal(tileId);
      } else {
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
  }, [fabricRef.current]);

  // --- Drop Logic (بدون تغییر) ---
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