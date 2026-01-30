import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import useAppStore from '../../../store/useAppStore';

const LivePreviewCanvas = ({ layers, activeLayerId, onUpdateLayer, onSelectLayer }) => {
  const canvasRef = useRef(null);
  const previewFabricRef = useRef(null);
  
  const mainCanvas = useAppStore(state => state.fabricCanvas);
  const editingTileId = useAppStore(state => state.editingTileId);

  // ۱. راه‌اندازی اولیه و لود پس‌زمینه
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 300,
      height: 300,
      backgroundColor: '#f8fafc',
      preserveObjectStacking: true,
      selection: true, // اجازه انتخاب برای لایه‌های متنی
    });
    previewFabricRef.current = canvas;

    // لیسنر انتخاب لایه
    const handleSelection = (e) => {
        const obj = e.selected?.[0];
        if (obj && obj.layerId && onSelectLayer) {
            onSelectLayer(obj.layerId);
        }
    };
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    
    // آپدیت لایه هنگام تغییر (درگ/ریسایز)
    canvas.on('object:modified', (e) => {
        const obj = e.target;
        if (obj && obj.layerId && onUpdateLayer) {
            onUpdateLayer(obj.layerId, {
                previewLeft: obj.left, // مختصات پریویو را ذخیره میکنیم
                previewTop: obj.top,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                angle: obj.angle,
                // برای جلوگیری از باگ، left/top اصلی را هم ست میکنیم
                left: obj.left, 
                top: obj.top
            });
        }
    });

    // لود کردن شکل پس‌زمینه از بوم اصلی
    if (mainCanvas && editingTileId) {
        const originalObj = mainCanvas.getObjects().find(o => o.data?.id === editingTileId);
        
        // ✅ اصلاح شد: شرط hex برداشته شد تا برای همه شکل‌ها کار کند
        if (originalObj) {
            // کلون کردن گروه اصلی (شامل شکل، عکس و...)
            originalObj.clone((cloned) => {
                if (cloned.type === 'group') {
                    // حذف متن‌های قبلی از کلون (چون متن‌ها را جداگانه رندر میکنیم)
                    const existingTexts = cloned.getObjects().filter(o => o.type === 'text' || o.type === 'textbox');
                    existingTexts.forEach(t => cloned.remove(t));
                }
                
                cloned.set({
                    left: 150, // وسط پریویو
                    top: 150,
                    scaleX: 1.5, // زوم
                    scaleY: 1.5,
                    originX: 'center',
                    originY: 'center',
                    selectable: false, // بک‌گراند قفل باشد
                    evented: false,
                    opacity: 0.6 // کمی کمرنگ تا متن‌ها بهتر دیده شوند
                });
                
                canvas.add(cloned);
                canvas.sendToBack(cloned); // فرستادن به زیرترین لایه
                canvas.requestRenderAll();
            });
        }
    }

    return () => {
      canvas.dispose();
    };
  }, []); // فقط یکبار اجرا شود

  // ۲. مدیریت رندر لایه‌های متن (Sync Layers)
  useEffect(() => {
    const canvas = previewFabricRef.current;
    if (!canvas) return;

    // الف) حذف لایه‌هایی که پاک شده‌اند
    const canvasObjects = canvas.getObjects();
    canvasObjects.forEach(obj => {
        if (obj.layerId && !layers.find(l => l.id === obj.layerId)) {
            canvas.remove(obj);
        }
    });

    // ب) ایجاد یا آپدیت لایه‌ها
    layers.forEach((layer) => {
        let textObj = canvasObjects.find(o => o.layerId === layer.id);

        if (!textObj) {
            // ساخت لایه جدید
            textObj = new fabric.Text(layer.text, {
                left: layer.previewLeft ?? 150,
                top: layer.previewTop ?? 150,
                fontSize: 24,
                fontFamily: 'Vazirmatn',
                originX: 'center', 
                originY: 'center',
                textAlign: 'center',
                
                // تنظیمات تعامل در پریویو
                selectable: true,
                hasControls: true,
                hasBorders: true,
                layerId: layer.id,
            });
            canvas.add(textObj);
        }

        // سینک ویژگی‌ها (استایل)
        textObj.set({
            text: layer.text,
            fill: layer.fill,
            fontSize: layer.fontSize,
            fontFamily: layer.fontFamily,
            angle: layer.angle || 0, // ساپورت چرخش
            
            stroke: layer.stroke,
            strokeWidth: layer.strokeWidth || 0,
            textBackgroundColor: layer.textBackgroundColor,
            
            shadow: (layer.shadowBlur > 0 || layer.shadowOffsetX !== 0 || layer.shadowOffsetY !== 0) ? new fabric.Shadow({
                color: layer.shadowColor || '#000000',
                blur: layer.shadowBlur || 0,
                offsetX: layer.shadowOffsetX || 0,
                offsetY: layer.shadowOffsetY || 0
            }) : null
        });

        // اکتیو کردن لایه انتخاب شده
        if (layer.id === activeLayerId && canvas.getActiveObject() !== textObj) {
            canvas.setActiveObject(textObj);
        }
    });

    // ج) مدیریت Z-Index (ترتیب لایه‌ها)
    layers.forEach((layer, index) => {
        const obj = canvas.getObjects().find(o => o.layerId === layer.id);
        if (obj) {
            // +1 چون شکل پس‌زمینه در ایندکس 0 است
            obj.moveTo(index + 1);
        }
    });

    canvas.requestRenderAll();

  }, [layers, activeLayerId]);

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden bg-slate-200">
      <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
         <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default LivePreviewCanvas;