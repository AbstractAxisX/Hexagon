export const APP_CONFIG = {
  // ۱. شکل‌های هندسی
  shapes: [
    { id: 'hex', name: 'شش‌ضلعی', aspectRatio: 0.866 }, // برای کراپ عکس مهمه
    { id: 'square', name: 'مربع', aspectRatio: 1 },
    { id: 'circle', name: 'دایره', aspectRatio: 1 },
  ],

  // ۲. سایزها (فقط لیبل‌ها برای نمایش در دراپ‌داون)
  sizes: [
    { id: 'xs', label: 'XS (15x15 cm)' },
    { id: 's',  label: 'S (20x20 cm)' },
    { id: 'm',  label: 'M (28x24 cm)' },
    { id: 'l',  label: 'L (33x29 cm)' },
    { id: 'xl', label: 'XL (38x33 cm)' },
  ],

  // ۳. متریال‌های اصلی 
  materials: [
    { id: 'forex', name: 'فوم (Forex)' },
    { id: 'aluminum', name: 'آلومینیوم' },
    { id: 'plexiglass', name: 'پلکسی' },
  ],

  // ۴. گوشه‌ها
  corners: [
    { id: 'sharp', name: 'تیز' },
    { id: 'rounded', name: 'گرد' },
  ],
  
  // ۵. روکش‌های خاص (آیتم‌هایی که روی کاشی تکی اعمال میشن)
  coatings: [
    { id: 'mirror', name: 'آینه', type: 'special' }, 
    { id: 'cork', name: 'چوب پنبه', type: 'special' },
  ],
// ۶. گالری تصاویر آماده (از سمت سرور)
  stockImages: [
    { 
      id: 'img_nature_1', 
      title: 'جنگل مه‌آلود', 
      url: 'https://picsum.photos/id/10/800/800', 
      category: 'nature' 
    },
    { 
      id: 'img_arch_1', 
      title: 'معماری مدرن', 
      url: 'https://picsum.photos/id/24/800/800', 
      category: 'architecture' 
    },
    { 
      id: 'img_abs_1', 
      title: 'انتزاعی آبی', 
      url: 'https://picsum.photos/id/33/800/800', 
      category: 'abstract' 
    },
    { 
      id: 'img_city_1', 
      title: 'نمای شهر', 
      url: 'https://picsum.photos/id/44/800/800', 
      category: 'city' 
    },
    // ... هر تعداد عکسی که سرور بفرستد
  ]
};