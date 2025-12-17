/**
 * Mock API Service
 * 🎯 Production: فقط BASE_URL رو عوض کن
 */

const IS_DEV = import.meta.env.DEV;
const BASE_URL = IS_DEV 
  ? 'http://localhost:3000/mock' 
  : 'https://api.modulari.com';

// ============================
// MOCK DATA (Development Only)
// ============================
const MOCK_PROJECT = {
  projectId: 'mock_project_001',
  wall: {
    shape: 'hex',      // یکی از: hex, square, circle
    size: 'm',
    material: 'forex',
    corner: 'sharp'
  },
  tiles: []
};

// ============================
// API FUNCTIONS
// ============================

/**
 * دریافت اطلاعات پروژه
 */
export async function fetchProject(projectId) {
  if (IS_DEV) {
    // 🧪 Mock: شبیه‌سازی تاخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('📦 [MOCK] Fetching Project:', projectId);
    return MOCK_PROJECT;
  }

  // 🌐 Production: درخواست واقعی
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return response.json();
}

/**
 * ذخیره وضعیت پروژه
 */
export async function saveProject(projectId, data) {
  if (IS_DEV) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('💾 [MOCK] Saving Project:', data);
    return { success: true };
  }

  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * محاسبه قیمت
 */
export async function calculatePrice(payload) {
  if (IS_DEV) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 🧮 Mock: محاسبه قیمت ساده
    const basePrice = 50_000;
    const tileCount = payload.tiles.length;
    const sizeMultiplier = { xs: 0.8, s: 0.9, m: 1.0, l: 1.2, xl: 1.5 };
    const materialMultiplier = { forex: 1.0, aluminum: 1.8, plexiglass: 2.2 };
    
    const total = basePrice * tileCount 
                * (sizeMultiplier[payload.config.size] || 1)
                * (materialMultiplier[payload.config.material] || 1);
    
    console.log('💰 [MOCK] Calculated Price:', total);
    return { price: Math.round(total) };
  }

  const response = await fetch(`${BASE_URL}/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

/**
 * آپلود تصویر
 */
export async function uploadImage(file) {
  if (IS_DEV) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 🖼️ Mock: تبدیل فایل به Base64
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const mockUrl = reader.result;
        console.log('📸 [MOCK] Image Uploaded');
        resolve({ url: mockUrl, id: `img_${Date.now()}` });
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/images/upload`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

// ============================
// HELPERS
// ============================
function getToken() {
  return localStorage.getItem('auth_token') || '';
}
