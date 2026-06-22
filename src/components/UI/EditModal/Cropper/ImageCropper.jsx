import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  Upload, X, Check,
  RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sun, Contrast, Droplet, Maximize, Minimize,
  ZoomIn, ZoomOut, Sliders, Crop, Move,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// ثابت‌ها
// ═══════════════════════════════════════════════
const ACCENT = '#FF6B35';

// ابعاد canvas کراپر
const CANVAS_SIZE = 300;           // کل canvas
const CROP_SIZE   = 240;           // ناحیه crop
const CROP_OFFSET = (CANVAS_SIZE - CROP_SIZE) / 2;  // = 30
const OUTPUT_SIZE = 480;           // رزولوشن خروجی (2x)

// ═══════════════════════════════════════════════
//Atoms
// ═══════════════════════════════════════════════
const ToolButton = ({ active, onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium border-2 transition-colors
      ${active
        ? 'border-[#FF6B35] bg-[#FFF1EB] text-[#FF6B35]'
        : 'border-[#E0E0E0] bg-white text-[#666] hover:border-[#999] hover:text-[#1a1a1a]'}`}
  >
    {children}
  </button>
);

const FilterKnob = ({ label, icon: Icon, value, min, max, onChange, defaultValue }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px]">
      <span className="flex items-center gap-1.5 text-[#666]">
        <Icon size={12} /> {label}
      </span>
      <button
        onClick={() => onChange(defaultValue)}
        className="font-mono tabular-nums text-[#1a1a1a] hover:text-[#FF6B35] transition-colors"
        title="ریست"
      >
        {value > 0 ? '+' : ''}{value}
      </button>
    </div>
    <input
      type="range" min={min} max={max} step={1} value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-1.5"
      style={{ accentColor: ACCENT }}
    />
  </div>
);

// ═══════════════════════════════════════════════
// کامپوننت اصلی
// ═══════════════════════════════════════════════
const ImageCropper = ({ imageSrc, onSave, onCancel, shape = 'square', cornerRadius = 0 }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const imgRef    = useRef(null);

  // flag برای جلوگیری از loop بین UI و canvas
  const isSyncingFromCanvas = useRef(false);

  // وضعیت‌ها
  const [fitMode,    setFitMode]    = useState('cover');
  const [zoom,       setZoom]       = useState(1);
  const [rotation,   setRotation]   = useState(0);
  const [flipX,      setFlipX]      = useState(false);
  const [flipY,      setFlipY]      = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast,   setContrast]   = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── ۱. ساخت canvas (یک‌بار) ─────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: '#1a1a1a',
      selection: false,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    // رسم overlay crop
    drawCropOverlay(canvas);

    // ✅ سنک از canvas به UI وقتی کاربر دستی دستکاری کرد
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj !== imgRef.current || !obj) return;

      isSyncingFromCanvas.current = true;
      const baseScale = obj._baseScale || 1;
      const currentZoom = Math.abs(obj.scaleX / baseScale);
      setZoom(parseFloat(currentZoom.toFixed(2)));
      setRotation(((Math.round(obj.angle) % 360) + 360) % 360);
      setFlipX(obj.scaleX < 0);
      setFlipY(obj.scaleY < 0);
      // ریست فلگ در فریم بعدی
      requestAnimationFrame(() => { isSyncingFromCanvas.current = false; });
    });

    return () => canvas.dispose();
  }, []);

  // ── ۲. لود عکس روی canvas ───────────────────────────────
  useEffect(() => {
    if (!imageSrc || !fabricRef.current) return;

    fabric.Image.fromURL(imageSrc, (img) => {
      if (!img) return;

      // حذف عکس قبلی
      fabricRef.current.getObjects()
        .filter(o => o.name === 'crop-image')
        .forEach(o => fabricRef.current.remove(o));

      img.name = 'crop-image';
      imgRef.current = img;

      // محاسبه baseScale بر اساس fit mode
      const baseScale = fitMode === 'cover'
        ? Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height)
        : Math.min(CROP_SIZE / img.width, CROP_SIZE / img.height);
      img._baseScale = baseScale;

      img.set({
        originX: 'center',
        originY: 'center',
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
        scaleX: baseScale,
        scaleY: baseScale,
        angle: 0,

        // ✅ کنترل‌های دستی — بزرگ و واضح
        hasControls:       true,
        hasBorders:        true,
        cornerColor:       ACCENT,
        cornerStrokeColor: '#FFFFFF',
        cornerStyle:       'circle',
        cornerSize:        14,
        transparentCorners: false,
        borderColor:       ACCENT,
        borderScaleFactor: 2,
        centeredScaling:   true,
        lockRotation:      false,
        lockScalingFlip:   false,
        rotatingPointOffset: 35,
        padding: 2,

        // cursor ها
        hoverCursor:    'move',
        moveCursor:     'move',
        scaleCursor:    'nwse-resize',
        rotateCursor:   'crosshair',
      });

      fabricRef.current.add(img);
      fabricRef.current.sendToBack(img); // overlay رو بیار رو
      fabricRef.current.setActiveObject(img);
      fabricRef.current.requestRenderAll();

      // ریست state
      setZoom(1);
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
    });
  }, [imageSrc]);

  // ── ۳. اعمال فیلترها ────────────────────────────────────
  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const filters = [];
    if (brightness !== 0) {
      filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
    }
    if (contrast !== 0) {
      filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
    }
    if (saturation !== 0) {
      filters.push(new fabric.Image.filters.Saturation({ saturation: saturation / 100 }));
    }
    img.filters = filters;
    img.applyFilters();
    fabricRef.current?.requestRenderAll();
  }, [brightness, contrast, saturation]);

  // ── ۴. اعمال zoom/rotation/flip از UI ───────────────────
  // ✅ فقط اگه از UI اومده باشه (نه از canvas) — جلوگیری از loop
  useEffect(() => {
    if (!imgRef.current || !fabricRef.current) return;
    if (isSyncingFromCanvas.current) return;

    const img = imgRef.current;
    const baseScale = img._baseScale || 1;
    const targetScaleX = baseScale * zoom * (flipX ? -1 : 1);
    const targetScaleY = baseScale * zoom * (flipY ? -1 : 1);

    // فقط اگه تفاوت معنی‌دار داره آپدیت کن
    if (Math.abs(img.scaleX - targetScaleX) > 0.01 ||
        Math.abs(img.scaleY - targetScaleY) > 0.01) {
      img.set({ scaleX: targetScaleX, scaleY: targetScaleY });
    }
    if (Math.abs(img.angle - rotation) > 0.5) {
      img.set({ angle: rotation });
    }
    fabricRef.current.requestRenderAll();
  }, [zoom, rotation, flipX, flipY]);

  // ── ۵. تغییر fit mode ────────────────────────────────────
  const handleFitModeChange = (mode) => {
    setFitMode(mode);
    if (imgRef.current) {
      const img = imgRef.current;
      const baseScale = mode === 'cover'
        ? Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height)
        : Math.min(CROP_SIZE / img.width, CROP_SIZE / img.height);
      img._baseScale = baseScale;
      img.set({
        scaleX: baseScale * zoom * (flipX ? -1 : 1),
        scaleY: baseScale * zoom * (flipY ? -1 : 1),
      });
      fabricRef.current.requestRenderAll();
    }
  };

  // ── ۶. رسم overlay crop ──────────────────────────────────
  function drawCropOverlay(canvas) {
    const overlayColor = 'rgba(0,0,0,0.55)';
    const overlayProps = {
      selectable: false,
      evented: false,
      name: 'overlay',
      hoverCursor: 'default',
    };

    // چهار مستطیل تیره اطراف ناحیه crop
    const top    = new fabric.Rect({ left: 0, top: 0, width: CANVAS_SIZE, height: CROP_OFFSET, fill: overlayColor, ...overlayProps });
    const bottom = new fabric.Rect({ left: 0, top: CROP_OFFSET + CROP_SIZE, width: CANVAS_SIZE, height: CROP_OFFSET, fill: overlayColor, ...overlayProps });
    const left   = new fabric.Rect({ left: 0, top: CROP_OFFSET, width: CROP_OFFSET, height: CROP_SIZE, fill: overlayColor, ...overlayProps });
    const right  = new fabric.Rect({ left: CROP_OFFSET + CROP_SIZE, top: CROP_OFFSET, width: CROP_OFFSET, height: CROP_SIZE, fill: overlayColor, ...overlayProps });

    // بوردر ناحیه crop
    const border = new fabric.Rect({
      left: CROP_OFFSET, top: CROP_OFFSET,
      width: CROP_SIZE, height: CROP_SIZE,
      fill: 'transparent',
      stroke: ACCENT,
      strokeWidth: 2,
      ...overlayProps,
    });

    // خطوط راهنما (rule of thirds)
    const lineColor = 'rgba(255,255,255,0.25)';
    const third = CROP_SIZE / 3;
    const lines = [
      new fabric.Line([CROP_OFFSET + third,     CROP_OFFSET, CROP_OFFSET + third,     CROP_OFFSET + CROP_SIZE], { stroke: lineColor, strokeWidth: 1, ...overlayProps }),
      new fabric.Line([CROP_OFFSET + 2*third,   CROP_OFFSET, CROP_OFFSET + 2*third,   CROP_OFFSET + CROP_SIZE], { stroke: lineColor, strokeWidth: 1, ...overlayProps }),
      new fabric.Line([CROP_OFFSET, CROP_OFFSET + third,     CROP_OFFSET + CROP_SIZE, CROP_OFFSET + third],     { stroke: lineColor, strokeWidth: 1, ...overlayProps }),
      new fabric.Line([CROP_OFFSET, CROP_OFFSET + 2*third,   CROP_OFFSET + CROP_SIZE, CROP_OFFSET + 2*third],   { stroke: lineColor, strokeWidth: 1, ...overlayProps }),
    ];

    canvas.add(top, bottom, left, right, border, ...lines);
    canvas.requestRenderAll();
  }

  // ── ۷. capture crop ─────────────────────────────────────
  const captureCrop = useCallback(async () => {
    if (!fabricRef.current || !imgRef.current) return null;

    // مخفی کردن overlay برای capture تمیز
    fabricRef.current.getObjects()
      .filter(o => o.name === 'overlay')
      .forEach(o => o.set({ visible: false }));
    fabricRef.current.discardActiveObject();
    fabricRef.current.requestRenderAll();

    // render کامل canvas به dataURL با رزولوشن بالا
    const multiplier = OUTPUT_SIZE / CANVAS_SIZE;
    const fullDataUrl = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });

    // overlay رو برگردون
    fabricRef.current.getObjects()
      .filter(o => o.name === 'overlay')
      .forEach(o => o.set({ visible: true }));
    fabricRef.current.requestRenderAll();

    // crop ناحیه مورد نظر با canvas API
    return new Promise((resolve) => {
      const tempImg = new Image();
      tempImg.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width  = OUTPUT_SIZE;
        tempCanvas.height = OUTPUT_SIZE;
        const ctx = tempCanvas.getContext('2d');

        // محاسبه مختصات crop در تصویر full-res
        const srcOffset = CROP_OFFSET * multiplier;
        const srcSize   = CROP_SIZE   * multiplier;

        ctx.drawImage(
          tempImg,
          srcOffset, srcOffset,        // source x, y
          srcSize,   srcSize,          // source w, h
          0, 0,                        // dest x, y
          OUTPUT_SIZE, OUTPUT_SIZE     // dest w, h
        );
        resolve(tempCanvas.toDataURL('image/png', 1));
      };
      tempImg.onerror = () => resolve(null);
      tempImg.src = fullDataUrl;
    });
  }, []);

  // ── ۸. آپدیت preview زنده ───────────────────────────────
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const url = await captureCrop();
      if (active && url) setPreviewUrl(url);
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [zoom, rotation, flipX, flipY, brightness, contrast, saturation, fitMode]);

  // ── ۹. ذخیره ────────────────────────────────────────────
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const url = await captureCrop();
      if (url) onSave(url);
    } catch (e) {
      console.error('Save error:', e);
    }
    setIsProcessing(false);
  };

  // ── ۱۰. ریست همه ────────────────────────────────────────
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    if (imgRef.current) {
      const img = imgRef.current;
      const baseScale = fitMode === 'cover'
        ? Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height)
        : Math.min(CROP_SIZE / img.width, CROP_SIZE / img.height);
      img._baseScale = baseScale;
      img.set({
        scaleX: baseScale,
        scaleY: baseScale,
        angle: 0,
        left: CANVAS_SIZE / 2,
        top:  CANVAS_SIZE / 2,
      });
      fabricRef.current.requestRenderAll();
    }
  };

  const rotate90 = (dir) => {
    setRotation(r => (((r + dir * 90) % 360) + 360) % 360);
  };

  // ═══════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col">

      {/* هدر */}
      <div className="w-full max-w-2xl mx-auto mb-3">
        <h3 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
          <Crop size={16} className="text-[#FF6B35]" />
          تنظیم و برش تصویر
        </h3>
        <p className="text-xs text-[#888] mt-1 flex items-center gap-1">
          <Move size={11} />
          عکس رو با دست بکش، گوشه‌ها رو بگیر تا زوم کنی، بچرخون تا زاویه بدی. فقط ناحیه نارنجی برش می‌خوره.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">

          {/* ══ ردیف اصلی: canvas + preview ══ */}
          <div className="grid grid-cols-[300px_1fr] gap-4 mb-4">

            {/* canvas کراپر — اینجا دستکاری دستی */}
            <div>
              <div className="border border-[#E0E0E0] bg-[#1a1a1a]" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                <canvas ref={canvasRef} />
              </div>
              <p className="text-[11px] text-[#888] mt-1.5 text-center flex items-center justify-center gap-1">
                <Move size={10} /> برای جابجایی،<span className="text-[#FF6B35]"> گوشه‌ها</span> برای زوم
              </p>
            </div>

            {/* preview زنده */}
            <div className="flex flex-col">
              <p className="text-xs font-medium text-[#1a1a1a] mb-2">پیش‌نمایش نهایی</p>
              <div className="border-2 border-dashed border-[#E0E0E0] bg-[#F5F5F5] flex-1 flex items-center justify-center min-h-[220px] overflow-hidden">
                {previewUrl ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-[#888]">در حال آماده‌سازی...</span>
                )}
              </div>
              <p className="text-[10px] text-[#888] mt-1.5">
                خروجی: {OUTPUT_SIZE}×{OUTPUT_SIZE}px PNG — اعمال‌شده روی شکل{' '}
                {shape === 'hex' ? 'شش‌ضلعی' : shape === 'circle' ? 'دایره' : 'مربع'}
              </p>
            </div>
          </div>

          {/* ══ نحوه قرارگیری ══ */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">نحوه قرارگیری</p>
            <div className="flex gap-2">
              <ToolButton active={fitMode === 'cover'} onClick={() => handleFitModeChange('cover')}>
                <Maximize size={14} /> پر کردن (Cover)
              </ToolButton>
              <ToolButton active={fitMode === 'contain'} onClick={() => handleFitModeChange('contain')}>
                <Minimize size={14} /> جا شدن (Contain)
              </ToolButton>
            </div>
          </div>

          {/* ══ زوم و چرخش (اسلایدرهای کمکی) ══ */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">کنترل دقیق</p>

            <div className="space-y-3">
              {/* زوم */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#666]">
                    <ZoomIn size={12} /> زوم
                  </span>
                  <button onClick={() => setZoom(1)} className="font-mono text-[#1a1a1a] hover:text-[#FF6B35]" title="ریست">
                    {Math.round(zoom * 100)}%
                  </button>
                </div>
                <input
                  type="range" min={0.3} max={4} step={0.05} value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5"
                  style={{ accentColor: ACCENT }}
                />
              </div>

              {/* چرخش */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#666]">
                    <RotateCw size={12} /> چرخش
                  </span>
                  <button onClick={() => setRotation(0)} className="font-mono text-[#1a1a1a] hover:text-[#FF6B35]" title="ریست">
                    {rotation}°
                  </button>
                </div>
                <input
                  type="range" min={-180} max={180} step={1} value={rotation}
                  onChange={e => setRotation(parseInt(e.target.value))}
                  className="w-full h-1.5"
                  style={{ accentColor: ACCENT }}
                />
              </div>
            </div>

            {/* دکمه‌های سریع */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button
                onClick={() => rotate90(-1)}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-2 border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
              >
                <RotateCcw size={14} /> ۹۰°
              </button>
              <button
                onClick={() => rotate90(1)}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-2 border-[#E0E0E0] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
              >
                <RotateCw size={14} /> ۹۰°
              </button>
              <ToolButton active={flipX} onClick={() => setFlipX(!flipX)}>
                <FlipHorizontal size={14} /> افقی
              </ToolButton>
              <ToolButton active={flipY} onClick={() => setFlipY(!flipY)}>
                <FlipVertical size={14} /> عمودی
              </ToolButton>
            </div>
          </div>

          {/* ══ فیلترها ══ */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">فیلترها</p>
            <div className="space-y-3">
              <FilterKnob label="روشنایی" icon={Sun}      value={brightness} min={-100} max={100} defaultValue={0} onChange={setBrightness} />
              <FilterKnob label="کنتراست" icon={Contrast} value={contrast}   min={-100} max={100} defaultValue={0} onChange={setContrast} />
              <FilterKnob label="اشباع"    icon={Droplet}   value={saturation} min={-100} max={100} defaultValue={0} onChange={setSaturation} />
            </div>
          </div>

          {/* ══ فوتر ══ */}
          <div className="flex gap-2 pb-2">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#666] border border-[#E0E0E0] hover:border-[#999] hover:text-[#1a1a1a] transition-colors"
            >
              <Sliders size={14} /> ریست
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold text-[#666] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-[2] py-2.5 bg-[#FF6B35] hover:bg-[#E55A2B] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Check size={16} /> {isProcessing ? 'در حال ذخیره...' : 'اعمال روی کاشی'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
