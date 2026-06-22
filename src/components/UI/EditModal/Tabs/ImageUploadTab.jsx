import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Check, X, Loader2, RotateCcw } from 'lucide-react';
import useAppStore from '../../../../store/useAppStore';
import { HEX_MATH, getHexPathData } from '../../../../utils/hexMath';
import { SQUARE_MATH } from '../../../../utils/squareMath';

/**
 * ImageUploadTab — نسخه‌ی اصلی با react-cropper (که کار می‌کرد)
 * فقط رنگ‌ها به تم نارنجی پروژه تغییر کرده.
 *
 * نحوه کار:
 * - عکس رو آپلود/انتخاب می‌کنی
 * - cropper با aspect ratio شکل کاشی crop box ثابت می‌سازه
 * - کاربر عکس رو drag/move/zoom می‌کنه (نه crop box رو)
 * - ماسک SVG شکل کاشی روی crop box نشون داده می‌شه
 * - خروجی: canvas با ابعاد دقیق شکل → setTileImage
 */
const ImageUploadTab = ({ tile, externalImageSrc }) => {
  const [imageSrc, setImageSrc]   = useState(null);
  const [cropBox, setCropBox]     = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const cropperRef   = useRef(null);
  const fileInputRef = useRef(null);
  const setTileImage = useAppStore(s => s.setTileImage);

  // اگه از تب گالری/تکسچر عکس اومد، بارگذاری کن
  useEffect(() => {
    if (externalImageSrc) {
      setIsLoading(true);
      setImageSrc(externalImageSrc);
    }
  }, [externalImageSrc]);

  // ابعاد هدف بر اساس شکل کاشی
  // ✅ FIX: برای square و circle از (SIZE - GAP) استفاده می‌کنیم چون خود شکل
  //    با این سایز رسم می‌شه. قبلاً SIZE بود و عکس 14px بزرگ‌تر از clipPath
  //    می‌شد → حس زوم‌داشتن ایجاد می‌کرد.
  //    برای hex ابعاد با getHexPoints برابرند (RADIUS خالص).
  const getShapeDimensions = () => {
    const GAP = SQUARE_MATH.GAP ?? 6;

    if (tile.shape === 'hex') {
      const width  = Math.sqrt(3) * HEX_MATH.RADIUS;
      const height = 2 * HEX_MATH.RADIUS;
      return { width, height, aspectRatio: width / height };
    }
    // square و circle: سایز واقعی شکل
    const size = SQUARE_MATH.SIZE - GAP;
    return { width: size, height: size, aspectRatio: 1 };
  };
  const { width: targetWidth, height: targetHeight, aspectRatio } = getShapeDimensions();

  // ── آپلود فایل ──
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  // ── ذخیره: crop با ابعاد دقیق شکل ──
  const handleSave = () => {
    if (!cropperRef.current?.cropper) return;
    const canvas = cropperRef.current.cropper.getCroppedCanvas({
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    setTileImage(tile.id, canvas.toDataURL('image/png'));
  };

  // ── ریست ──
  const handleReset = () => {
    setImageSrc(null);
    setCropBox(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── سنک cropBox برای overlay ──
  const syncCropBox = () => {
    if (cropperRef.current?.cropper) {
      setCropBox(cropperRef.current.cropper.getCropBoxData());
    }
  };

  const handleReady = () => { setIsLoading(false); syncCropBox(); };

  // ── مسیر SVG شکل کاشی ──
  const renderShapePath = (width, height) => {
    const isRounded = tile.corner === 'rounded';

    if (tile.shape === 'hex') {
      const nativeW = Math.sqrt(3) * HEX_MATH.RADIUS;
      const nativeH = 2 * HEX_MATH.RADIUS;
      const scaleX  = width / nativeW;
      const scaleY  = height / nativeH;
      return (
        <path d={getHexPathData(isRounded ? 10 : 0)}
          transform={`translate(${width/2}, ${height/2}) scale(${scaleX}, ${scaleY})`} />
      );
    }
    if (tile.shape === 'circle') {
      return <ellipse cx={width/2} cy={height/2} rx={width/2} ry={height/2} />;
    }
    return <rect x="0" y="0" width={width} height={height} rx={isRounded ? 10 : 0} ry={isRounded ? 10 : 0} />;
  };

  // ═══════════════════════════════════════════════
  // Empty state — درخواست انتخاب عکس
  // ═══════════════════════════════════════════════
  if (!imageSrc) return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        className="cursor-pointer h-[340px] border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center text-[#888] hover:bg-[#FFF1EB] hover:border-[#FF6B35] transition-colors bg-[#FAFAFA]"
      >
        <div className="bg-[#FFF1EB] p-4 mb-3">
          <Upload size={28} className="text-[#FF6B35]" />
        </div>
        <span className="font-semibold text-[#1a1a1a] text-sm">انتخاب تصویر</span>
        <span className="text-xs text-[#888] mt-1">کلیک کن یا فایل را اینجا رها کن</span>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
    </div>
  );

  // ═══════════════════════════════════════════════
  // حالت کراپر
  // ═══════════════════════════════════════════════
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <div className="relative w-full h-[340px] bg-slate-900 overflow-hidden flex items-center justify-center">

        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-sm text-white">
            <Loader2 size={36} className="animate-spin text-[#FF6B35] mb-3" />
            <span className="text-sm text-slate-300">در حال بارگذاری...</span>
          </div>
        )}

        <Cropper
          src={imageSrc}
          style={{ height: '100%', width: '100%' }}
          aspectRatio={aspectRatio}
          guides={false}
          viewMode={1}
          dragMode="move"
          ref={cropperRef}
          background={false}
          modal={false}
          autoCropArea={0.8}
          cropBoxMovable={false}
          cropBoxResizable={false}
          toggleDragModeOnDblclick={false}
          ready={handleReady}
          cropstart={syncCropBox}
          cropmove={syncCropBox}
          crop={syncCropBox}
        />

        {/* overlay ماسک شکل کاشی */}
        {!isLoading && cropBox && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <svg width="100%" height="100%">
              <defs>
                <mask id="shape-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <g transform={`translate(${cropBox.left}, ${cropBox.top})`}>
                    {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), { fill: 'black' })}
                  </g>
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#shape-mask)" />
              <g transform={`translate(${cropBox.left}, ${cropBox.top})`}>
                {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), {
                  fill: 'transparent', stroke: '#FF6B35', strokeWidth: 2, vectorEffect: 'non-scaling-stroke',
                })}
                {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), {
                  fill: 'transparent', stroke: 'black', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5,
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* فوتر */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E0E0E0]">
        <button
          onClick={handleReset}
          className="text-[#666] hover:text-red-500 px-3 py-2 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <RotateCcw size={15} /> تصویر دیگر
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`px-5 py-2.5 flex items-center gap-2 text-sm font-semibold transition-all active:scale-95
            ${isLoading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#FF6B35] hover:bg-[#E55A2B] text-white'}`}
        >
          <Check size={16} /> برش و ذخیره
        </button>
      </div>
    </div>
  );
};

export default ImageUploadTab;
