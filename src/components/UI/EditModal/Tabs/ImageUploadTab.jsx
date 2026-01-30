import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Check, X, Loader2 } from 'lucide-react'; // آیکون لودر اضافه شد
import useAppStore from '../../../../store/useAppStore';

import { HEX_MATH, getHexPathData } from '../../../../utils/hexMath';
import { SQUARE_MATH } from '../../../../utils/squareMath';

const ImageUploadTab = ({ tile, externalImageSrc }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [cropBox, setCropBox] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); // ✅ استیت لودینگ

  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const setTileImage = useAppStore(state => state.setTileImage);

  // دریافت عکس از بیرون (گالری/تکسچر)
  useEffect(() => {
    if (externalImageSrc) {
      setIsLoading(true); // ✅ شروع لودینگ
      setImageSrc(externalImageSrc);
    }
  }, [externalImageSrc]);

  // محاسبه نسبت ابعاد
  const getShapeDimensions = () => {
    if (tile.shape === 'hex') {
      const width = Math.sqrt(3) * HEX_MATH.RADIUS;
      const height = 2 * HEX_MATH.RADIUS;
      return { width, height, aspectRatio: width / height };
    } 
    return { width: SQUARE_MATH.SIZE, height: SQUARE_MATH.SIZE, aspectRatio: 1 };
  };

  const { width: targetWidth, height: targetHeight, aspectRatio } = getShapeDimensions();

  // هندل کردن آپلود دستی فایل
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true); // ✅ شروع لودینگ
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        // لودینگ اینجا فالس نمیشه، چون هنوز باید توی کراپ رندر بشه
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: Math.round(targetWidth),
        height: Math.round(targetHeight),
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      const croppedDataUrl = canvas.toDataURL('image/png');
      setTileImage(tile.id, croppedDataUrl);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCrop = () => {
    if (cropperRef.current?.cropper) {
      setCropBox(cropperRef.current.cropper.getCropBoxData());
    }
  };

  // ✅ متد مخصوص برای وقتی که کراپ آماده شد
  const handleReady = () => {
    setIsLoading(false); // پایان لودینگ
    handleCrop();
  };

  // رندر کردن ماسک شکل (Overlay)
  const renderShapePath = (width, height) => {
    const isRounded = tile.corner === 'rounded';
    const radius = isRounded ? 10 : 0;

    if (tile.shape === 'hex') {
      const nativeW = Math.sqrt(3) * HEX_MATH.RADIUS; 
      const nativeH = 2 * HEX_MATH.RADIUS; 
      
      const scaleX = width / nativeW;
      const scaleY = height / nativeH;
      
      const pathData = getHexPathData(isRounded ? 10 : 0);
      
      return (
        <path 
          d={pathData} 
          transform={`translate(${width/2}, ${height/2}) scale(${scaleX}, ${scaleY})`}
        />
      );
    } 
    
    if (tile.shape === 'circle') {
      return (
        <ellipse 
          cx={width / 2} cy={height / 2} 
          rx={width / 2} ry={height / 2} 
        />
      );
    }

    return (
      <rect 
        x="0" y="0" 
        width={width} height={height} 
        rx={radius} ry={radius} 
      />
    );
  };

  if (!imageSrc) return (
    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer h-[350px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-colors bg-slate-50/50">
      <div className="bg-white p-4 rounded-full shadow-sm mb-3">
        <Upload size={32} className="text-blue-500"/>
      </div>
      <span className="font-medium text-slate-600">انتخاب تصویر</span>
      <span className="text-xs text-slate-400 mt-1">یا تصویر را اینجا رها کنید</span>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full h-[350px] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group">
        
        {/* ✅ لودینگ اورلی */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white transition-opacity duration-300">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-3" />
            <span className="text-sm font-medium text-slate-300">در حال بارگذاری تصویر...</span>
          </div>
        )}

        {/* Cropper */}
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
          
          ready={handleReady} // ✅ اتصال به متد ردی
          cropstart={handleCrop}
          cropmove={handleCrop}
          crop={handleCrop}
        />

        {/* Custom Shape Overlay */}
        {!isLoading && cropBox && (
          <div className="absolute inset-0 pointer-events-none z-10 animate-in fade-in duration-500">
            <svg width="100%" height="100%" className="w-full h-full">
              <defs>
                <mask id="shape-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <g transform={`translate(${cropBox.left}, ${cropBox.top})`}>
                    {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), { fill: 'black' })}
                  </g>
                </mask>
              </defs>

              <rect 
                x="0" y="0" width="100%" height="100%" 
                fill="rgba(0, 0, 0, 0.6)" 
                mask="url(#shape-mask)" 
              />

              <g transform={`translate(${cropBox.left}, ${cropBox.top})`}>
                {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), { 
                  fill: 'transparent', 
                  stroke: 'white', 
                  strokeWidth: 2,
                  vectorEffect: 'non-scaling-stroke' 
                })}
                {React.cloneElement(renderShapePath(cropBox.width, cropBox.height), { 
                  fill: 'transparent', 
                  stroke: 'black', 
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                  opacity: 0.5
                })}
              </g>
            </svg>
          </div>
        )}

      </div>
      
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <button 
          onClick={handleCancel} 
          className="text-slate-500 hover:text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex gap-2 text-sm font-medium"
        >
          <X size={18}/> 
          انتخاب تصویر دیگر
        </button>
        <button 
          onClick={handleSave} 
          disabled={isLoading} // جلوگیری از ذخیره موقع لود
          className={`
            px-6 py-2.5 rounded-xl flex gap-2 shadow-lg transition-all active:scale-95
            ${isLoading 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }
          `}
        >
          <Check size={18}/> 
          برش و استفاده
        </button>
      </div>
    </div>
  );
};

export default ImageUploadTab;