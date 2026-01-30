import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Check, X } from 'lucide-react'; // RotateCw حذف شد چون استفاده نشده بود
import useAppStore from '../../../../store/useAppStore';

// ایمپورت ثوابت ریاضی برای محاسبه دقیق ابعاد
import { HEX_MATH } from '../../../../utils/hexMath';
import { SQUARE_MATH } from '../../../../utils/squareMath';

// ✅ تغییر: اضافه کردن پراپ externalImageSrc برای دریافت عکس از گالری
const ImageUploadTab = ({ tile, externalImageSrc }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const setTileImage = useAppStore(state => state.setTileImage);

  // ✅ پل ارتباطی: اگر عکس از بیرون (تب گالری) آمد، اینجا ست شود
  useEffect(() => {
    if (externalImageSrc) {
      setImageSrc(externalImageSrc);
    }
  }, [externalImageSrc]);

  // محاسبه نسبت ابعاد (Aspect Ratio) دقیق بر اساس شکل
  const getShapeDimensions = () => {
    if (tile.shape === 'hex') {
      const width = Math.sqrt(3) * HEX_MATH.RADIUS;
      const height = 2 * HEX_MATH.RADIUS;
      return { width, height, aspectRatio: width / height };
    } 
    else {
      return { 
        width: SQUARE_MATH.SIZE, 
        height: SQUARE_MATH.SIZE, 
        aspectRatio: 1 
      };
    }
  };

  const { width: targetWidth, height: targetHeight, aspectRatio } = getShapeDimensions();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
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
      
      // اختیاری: بستن مودال یا ریست کردن را می‌توان اینجا هندل کرد
      // اما طبق معماری فعلی، بستن مودال در سطح بالاتر انجام می‌شود
    }
  };

  // هندل کردن دکمه لغو برای پاک کردن تصویر و برگشت به حالت انتخاب
  const handleCancel = () => {
    setImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!imageSrc) return (
    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors h-full min-h-[300px]">
      <Upload size={32} className="mb-2"/>
      <span className="font-medium">آپلود تصویر اختصاصی</span>
      <span className="text-xs mt-2 opacity-70">یا تصویر را اینجا رها کنید</span>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full h-[350px] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
        <Cropper
          src={imageSrc}
          style={{ height: '100%', width: '100%' }}
          aspectRatio={aspectRatio}
          guides={false}
          viewMode={1}
          dragMode="move"
          ref={cropperRef}
          background={false}
          autoCropArea={0.8}
          cropBoxMovable={false}
          cropBoxResizable={false}
        />
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <button onClick={handleCancel} className="text-slate-500 hover:text-red-500 flex items-center gap-2 text-sm font-medium transition-colors">
          <X size={18}/> 
          انتخاب تصویر دیگر
        </button>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Check size={18}/> 
          اعمال و برش دقیق
        </button>
      </div>
    </div>
  );
};

export default ImageUploadTab;