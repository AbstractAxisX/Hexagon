import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';
import {
  createTextObject,
  normalizeLayer,
} from '../../../utils/textLayerUtils';

/**
 * LivePreviewCanvas
 *
 * یه canvas جدا برای پیش‌نمایش زنده‌ی متن روی کاشی.
 * شکل کاشی رو از بوم اصلی کلون می‌کنه و لایه‌های متن رو sync نگه می‌داره.
 *
 * ✅ حالا از textLayerUtils استفاده می‌کنه — کاملاً هماهنگ با Tileهای اصلی
 * ✅ scaleFactor = 1 (پریویو با مختصات absolute کار می‌کنه)
 * ✅ centerOffset = 150 (مرکز canvas 300×300)
 */
const LivePreviewCanvas = ({ layers, activeLayerId, onUpdateLayer, onSelectLayer }) => {
  const canvasRef    = useRef(null);
  const fabricRef    = useRef(null);
  const isSyncingRef = useRef(false);

  const mainCanvas    = useAppStore(s => s.fabricCanvas);
  const editingTileId = useAppStore(s => s.editingTileId);

  // ── ۱. ساخت canvas یک‌بار ───────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 300,
      height: 300,
      backgroundColor: '#F5F5F5',
      preserveObjectStacking: true,
      selection: false,
    });
    fabricRef.current = canvas;

    canvas.on('selection:created', e => {
      const obj = e.selected?.[0];
      if (obj?.layerId) onSelectLayer?.(obj.layerId);
    });
    canvas.on('selection:updated', e => {
      const obj = e.selected?.[0];
      if (obj?.layerId) onSelectLayer?.(obj.layerId);
    });

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
            opacity: 0.45,
          });
          canvas.add(cloned);
          canvas.sendToBack(cloned);
          canvas.requestRenderAll();
        });
      }
    }

    return () => canvas.dispose();
  }, []);

  // ── ۲. Sync لایه‌ها ─────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isSyncingRef.current = true;

    // حذف اشیایی که لایه‌شون پاک شده
    canvas.getObjects()
      .filter(o => o.layerId && !layers.find(l => l.id === o.layerId))
      .forEach(o => canvas.remove(o));

    // ساخت یا آپدیت هر لایه
    layers.forEach((rawLayer, index) => {
      const layer = normalizeLayer(rawLayer);
      let obj = canvas.getObjects().find(o => o.layerId === layer.id);

      if (!obj) {
        // ساخت جدید با shared utility
        // پریویو: scaleFactor=1 (مختصات absolute)، centerOffset=150
        obj = createTextObject(layer, {
          scaleFactor: 1,
          centerOffset: 150,
          clipPathFactory: null, // پریویو clipPath نمی‌خواد
          selectable: true,
        });
        obj.layerId = layer.id;
        canvas.add(obj);
      } else {
        // آپدیت: چون createTextObject یه شیء جدید می‌سازه،
        // باید پراپرتی‌ها رو روی شیء موجود set کنیم
        const relX = (layer.previewLeft - 150);
        const relY = (layer.previewTop - 150);
        const hasStroke = layer.stroke && layer.strokeWidth > 0;
        const hasShadow = layer.shadowBlur > 0
          || layer.shadowOffsetX !== 0
          || layer.shadowOffsetY !== 0;

        obj.set({
          left: 150 + relX,
          top:  150 + relY,
          text:                layer.text || ' ',
          fontFamily:          layer.fontFamily,
          fontSize:            layer.fontSize, // scaleFactor=1
          fontWeight:          layer.fontWeight,
          fontStyle:           layer.fontStyle,
          underline:           layer.underline,
          linethrough:         layer.linethrough,
          overline:            layer.overline,
          textAlign:           layer.textAlign,
          lineHeight:          layer.lineHeight,
          charSpacing:         layer.charSpacing,
          fill:                layer.fill,
          stroke:              hasStroke ? layer.stroke : null,
          strokeWidth:         hasStroke ? layer.strokeWidth : 0,
          paintFirst:          'stroke',
          textBackgroundColor: layer.textBackgroundColor,
          shadow: hasShadow
            ? new fabric.Shadow({
                color:   layer.shadowColor,
                blur:    layer.shadowBlur,
                offsetX: layer.shadowOffsetX,
                offsetY: layer.shadowOffsetY,
              })
            : null,
          opacity:  layer.opacity,
          scaleX:   layer.scaleX,
          scaleY:   layer.scaleY,
          angle:    layer.angle,
          flipX:    layer.flipX,
          flipY:    layer.flipY,
        });
      }

      obj.moveTo(index + 1);
    });

    // اکتیو کردن لایه‌ی انتخاب‌شده
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
    <div className="w-full h-full flex justify-center items-center bg-[#F5F5F5] overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LivePreviewCanvas;
