/**
 * Advanced Logger for Debugging
 * این ماژول فقط در حالت Development اجرا می‌شود.
 * در حالت Production، تمام توابع خالی می‌شوند تا پرفورمنس بالا بماند.
 */

const IS_DEV = import.meta.env.DEV;

export const Logger = {
  /**
   * لاگ معمولی برای اطلاع‌رسانی جریان برنامه
   * @param {string} scope - نام کامپوننت یا ماژول (مثلاً 'FabricCanvas')
   * @param {string} message - پیام توضیحی
   * @param {any} [data] - دیتای اختیاری برای نمایش
   */
  info: (scope, message, data) => {
    if (!IS_DEV) return;
    console.log(
      `%c[${scope}] 🔷 ${message}`, 
      'color: #3b82f6; font-weight: bold;', 
      data || ''
    );
  },

  /**
   * لاگ موفقیت عملیات
   */
  success: (scope, message, data) => {
    if (!IS_DEV) return;
    console.log(
      `%c[${scope}] ✅ ${message}`, 
      'color: #10b981; font-weight: bold;', 
      data || ''
    );
  },

  /**
   * هشدار برای موارد غیرمنتظره اما غیر بحرانی
   */
  warn: (scope, message, data) => {
    if (!IS_DEV) return;
    console.warn(
      `%c[${scope}] ⚠️ ${message}`, 
      'color: #f59e0b; font-weight: bold;', 
      data || ''
    );
  },

  /**
   * خطاهای بحرانی (این‌ها حتی در پروداکشن هم ممکن است نیاز به مانیتورینگ داشته باشند، 
   * اما فعلاً طبق درخواست شما شرط DEV را نگه می‌داریم)
   */
  error: (scope, message, error) => {
    if (!IS_DEV) return;
    console.error(
      `%c[${scope}] 🚨 ${message}`, 
      'color: #ef4444; font-weight: bold; font-size: 1.1em;', 
      error || ''
    );
  },

  /**
   * رسم کادر دور المنت‌ها برای دیباگ بصری (Visual Debugging)
   * @param {fabric.Object} obj - آبجکت فابریک
   */
  debugObjectBorders: (obj) => {
    if (!IS_DEV) return;
    obj.set({
      stroke: 'red',
      strokeWidth: 2,
      strokeDashArray: [5, 5]
    });
  }
};