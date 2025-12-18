import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Check, X, RotateCw } from 'lucide-react';
import useAppStore from '../../../../store/useAppStore';

// ایمپورت ثوابت ریاضی برای محاسبه دقیق ابعاد
import { HEX_MATH } from '../../../../utils/hexMath';
import { SQUARE_MATH } from '../../../../utils/squareMath';

const ImageUploadTab = ({ tile }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const setTileImage = useAppStore(state => state.setTileImage);

  // محاسبه نسبت ابعاد (Aspect Ratio) دقیق بر اساس شکل
  const getShapeDimensions = () => {
    if (tile.shape === 'hex') {
      // طبق فرمول ریاضی: عرض = رادیکال ۳ * شعاع | ارتفاع = ۲ * شعاع
      // این ابعاد دقیق bounding box شش‌ضلعی است
      const width = Math.sqrt(3) * HEX_MATH.RADIUS;
      const height = 2 * HEX_MATH.RADIUS;
      return { width, height, aspectRatio: width / height };
    } 
    else {
      // مربع و دایره (۱:۱)
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
      // 🔥 نکته کلیدی اینجاست!
      // خروجی را دقیقاً به اندازه ابعاد پیکسلی شکل می‌گیریم.
      // این باعث می‌شود عکس در فابریک دقیقاً فیت شود بدون هیچ زوم یا دفرمه شدن.
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: Math.round(targetWidth),   // مثلا 121 پیکسل
        height: Math.round(targetHeight), // مثلا 140 پیکسل
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      const croppedDataUrl = canvas.toDataURL('image/png');
      setTileImage(tile.id, croppedDataUrl);
    }
  };

  // ... (بقیه کدهای UI مثل دکمه آپلود که قبلاً داشتیم، بدون تغییر)
  // فقط قسمت Cropper را با aspectRatio داینامیک آپدیت کنید:

  if (!imageSrc) return (/* کد دکمه آپلود قبلی */ 
    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50">
      <Upload size={32} className="mb-2"/>
      <span>آپلود تصویر</span>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full h-[350px] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
        <Cropper
          src={imageSrc}
          style={{ height: '100%', width: '100%' }}
          // ✅ نسبت ابعاد قفل شده روی ابعاد شکل
          aspectRatio={aspectRatio} 
          guides={false}
          viewMode={1}
          dragMode="move"
          ref={cropperRef}
          background={false}
          autoCropArea={0.8}
          cropBoxMovable={false} // مثل فایل html شما، باکس ثابت باشه بهتره
          cropBoxResizable={false}
        />
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setImageSrc(null)} className="text-red-500 flex gap-2"><X/> لغو</button>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex gap-2"><Check/> اعمال دقیق</button>
      </div>
    </div>
  );
};

export default ImageUploadTab;