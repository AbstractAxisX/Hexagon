import { fabric } from 'fabric';

/**
 * ایجاد یک تکست‌باکس استاندارد و بهینه برای قرارگیری در مرکز کاشی
 * @param {number} maxWidth - حداکثر عرض مجاز متن (بر اساس سایز شکل)
 * @param {string} initialText - متن اولیه (اختیاری)
 */
export const createDefaultTextbox = (maxWidth, initialText = '') => {
  return new fabric.Textbox(initialText, {
    fontSize: 22,
    fontFamily: 'vazir', // یا فونت پیش‌فرض پروژه
    fill: '#333333',
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    width: maxWidth, // محدودیت عرض برای شکستن متن
    splitByGrapheme: true, // شکستن کلمات طولانی
    selectable: false, // در حالت عادی انتخاب نشود (توسط مودال مدیریت می‌شود)
    evented: false,   // ایونت‌ها را به گروه پاس دهد
    name: 'tile-text' // شناسه برای یافتن در گروه
  });
};