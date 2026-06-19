import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';

/**
 * LivePreviewCanvas
 * - یه canvas جداست از بوم اصلی
 * - شکل کاشی رو از بوم اصلی کلون میکنه (پس‌زمینه)
 * - لایه‌های متن رو sync میکنه
 * - drag/resize/rotate رو به state برمیگردونه
 * - حذف لایه رو مدیریت میکنه
 */
const LivePreviewCanvas = ({ layers, activeLayerId, onUpdateLayer, onSelectLayer }) => {
  const canvasRef    = useRef(null);
  const fabricRef    = useRef(null);
  const isSyncingRef = useRef(false); // جلوگیری از loop

  const mainCanvas    = useAppStore(s => s.fabricCanvas);
  const editingTileId = useAppStore(s => s.editingTileId);

  // ── ۱. ساخت canvas یه بار ──────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 300,
      height: 300,
      backgroundColor: '#f1f5f9',
      preserveObjectStacking: true,
      selection: false,
    });
    fabricRef.current = canvas;

    // انتخاب لایه با کلیک
    canvas.on('selection:created', e => {
      const obj = e.selected?.[0];
      if (obj?.layerId) onSelectLayer?.(obj.layerId);
    });
    canvas.on('selection:updated', e => {
      const obj = e.selected?.[0];
      if (obj?.layerId) onSelectLayer?.(obj.layerId);
    });

    // بعد از drag/resize/rotate: state رو آپدیت کن
    canvas.on('object:modified', e => {
      const obj = e.target;
      if (!obj?.layerId || isSyncingRef.current) return;
      onUpdateLayer?.(obj.layerId, {
        previewLeft: obj.left,
        previewTop:  obj.top,
        scaleX:      obj.scaleX,
        scaleY:      obj.scaleY,
        angle:       obj.angle,
      });
    });

    // لود شکل پس‌زمینه از بوم اصلی
    if (mainCanvas && editingTileId) {
      const original = mainCanvas.getObjects().find(o => o.data?.id === editingTileId);
      if (original) {
        original.clone(cloned => {
          // حذف متن‌های قبلی از کلون
          if (cloned.type === 'group') {
            cloned.getObjects()
              .filter(o => o.type === 'text' || o.type === 'textbox')
              .forEach(t => cloned.remove(t));
          }
          cloned.set({
            left: 150, top: 150,
            scaleX: 1.4, scaleY: 1.4,
            originX: 'center', originY: 'center',
            selectable: false, evented: false,
            opacity: 0.7,
          });
          canvas.add(cloned);
          canvas.sendToBack(cloned);
          canvas.requestRenderAll();
        });
      }
    }

    return () => canvas.dispose();
  }, []); // فقط یه بار

  // ── ۲. Sync لایه‌ها هر بار که layers یا activeLayerId عوض شد ──
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isSyncingRef.current = true;

    // الف: حذف اشیایی که لایه‌شون پاک شده
    canvas.getObjects()
      .filter(o => o.layerId && !layers.find(l => l.id === o.layerId))
      .forEach(o => canvas.remove(o));

    // ب: ساخت یا آپدیت هر لایه
    layers.forEach((layer, index) => {
      let obj = canvas.getObjects().find(o => o.layerId === layer.id);

      if (!obj) {
        // ساخت جدید
        obj = new fabric.Text(layer.text || ' ', {
          left:       layer.previewLeft ?? 150,
          top:        layer.previewTop  ?? 150,
          originX:    'center',
          originY:    'center',
          textAlign:  'center',
          selectable: true,
          hasControls: true,
          hasBorders:  true,
          layerId:    layer.id,
        });
        canvas.add(obj);
      }

      // آپدیت همه ویژگی‌ها
      obj.set({
        text:                layer.text || ' ',
        fill:                layer.fill       || '#000000',
        fontSize:            layer.fontSize   || 24,
        fontFamily:          layer.fontFamily || 'Vazirmatn',
        scaleX:              layer.scaleX     ?? 1,
        scaleY:              layer.scaleY     ?? 1,
        angle:               layer.angle      ?? 0,
        stroke:              layer.stroke     || null,
        strokeWidth:         layer.strokeWidth || 0,
        textBackgroundColor: layer.textBackgroundColor || null,
        shadow: (layer.shadowBlur > 0 || layer.shadowOffsetX || layer.shadowOffsetY)
          ? new fabric.Shadow({
              color:   layer.shadowColor  || '#000000',
              blur:    layer.shadowBlur   || 0,
              offsetX: layer.shadowOffsetX || 0,
              offsetY: layer.shadowOffsetY || 0,
            })
          : null,
      });

      // z-index
      obj.moveTo(index + 1);
    });

    // ج: اکتیو کردن لایه انتخاب‌شده
    const activeObj = canvas.getObjects().find(o => o.layerId === activeLayerId);
    if (activeObj && canvas.getActiveObject() !== activeObj) {
      canvas.setActiveObject(activeObj);
    } else if (!activeLayerId) {
      canvas.discardActiveObject();
    }

    canvas.requestRenderAll();
    isSyncingRef.current = false;

  }, [layers, activeLayerId]);

  return (
    <div className="w-full h-full flex justify-center items-center bg-slate-200 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="rounded-lg shadow-inner" />
    </div>
  );
};

export default LivePreviewCanvas;