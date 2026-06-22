// ============================================================
// persistDesign.js — ذخیره و بازیابی طرح از localStorage
// فقط globalSettings + tiles ذخیره میشه (دیتای طرح)
// ============================================================

const STORAGE_KEY = 'modulari_saved_design';

/**
 * ذخیره طرح فعلی در localStorage
 */
export function saveDesignToLocalStorage({ globalSettings, tiles }) {
  try {
    const payload = {
      globalSettings,
      tiles,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    // مثلاً localStorage پره یا غیرفعاله — بی‌خیال میشیم، چیزی رو خراب نمی‌کنه
    console.warn('ذخیره طرح ناموفق بود:', err);
  }
}

/**
 * خوندن طرح ذخیره‌شده. اگه چیزی نباشه یا خراب باشه، null برمی‌گردونه.
 */
export function loadDesignFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.globalSettings || !Array.isArray(parsed.tiles)) return null;
    return parsed;
  } catch (err) {
    console.warn('خواندن طرح ذخیره‌شده ناموفق بود:', err);
    return null;
  }
}

/**
 * چک سریع: آیا طرح ذخیره‌شده‌ای وجود داره؟
 * (برای تصمیم نشون دادن دکمه «ادامه طراحی»)
 */
export function hasSavedDesign() {
  const saved = loadDesignFromLocalStorage();
  return !!(saved && saved.tiles.length > 0);
}

/**
 * پاک کردن طرح ذخیره‌شده (مثلاً بعد از ثبت سفارش نهایی)
 */
export function clearSavedDesign() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('پاک کردن طرح ذخیره‌شده ناموفق بود:', err);
  }
}