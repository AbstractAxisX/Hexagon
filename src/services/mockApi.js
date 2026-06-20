// ============================================================
// mockApi.js — شبیه‌سازی بکند
// وقتی بکند واقعی آماده شد، فقط این فایل رو عوض کن.
// ============================================================

const FAKE_DELAY_MS = 300;

// POST /api/session/create
export async function createSession(userSelections) {
  await fakeDelay();

  const required = ['shape', 'size', 'material', 'corner'];
  for (const key of required) {
    if (!userSelections[key]) throw new ApiError(400, `فیلد '${key}' الزامی است`);
  }

  // TODO → fetch واقعی:
  // const res = await fetch('/api/session/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(userSelections) });
  // if (!res.ok) throw new ApiError(res.status, await res.text());
  // return res.json();

  return {
    sessionId: crypto.randomUUID(),
    settings: {
      shape:    userSelections.shape,
      size:     userSelections.size,
      material: userSelections.material,
      corner:   userSelections.corner,
      editingTileId: null,
      isModalOpen:   false,
      activeTab:     'upload',
    },
    initialTiles: [],
  };
}

// GET /api/session/:id
export async function getSession(sessionId) {
  await fakeDelay();
  if (!sessionId) throw new ApiError(400, 'sessionId الزامی است');
  // TODO → fetch واقعی
  return null;
}

// POST /api/order/price
export async function fetchPrice(orderPayload, signal) {
  await fakeDelay(350, signal);

  // TODO → fetch واقعی:
  // const res = await fetch('/api/order/price', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(orderPayload),
  //   signal,
  // });
  // if (!res.ok) throw new ApiError(res.status, await res.text());
  // return res.json();

  const tileCount = orderPayload.tiles?.length ?? 0;
  const basePrice = getPricePerTile(orderPayload.config);

  return {
    totalPrice: tileCount * basePrice,
    breakdown: { pricePerTile: basePrice, tileCount, currency: 'IRR' },
  };
}

// ============================================================
// POST /api/cart/add
// ──────────────────────────────────────────────────────────────
// خروجی طرح (عکس باکیفیت) + اطلاعات سفارش رو می‌گیره،
// یه آیتم سبد خرید برمی‌گردونه.
// ورودی: { previewDataUrl, orderPayload }
// خروجی: { cartItemId, previewUrl, summary }
// ============================================================
export async function addToCart({ previewDataUrl, orderPayload }) {
  await fakeDelay(500);

  if (!previewDataUrl) throw new ApiError(400, 'تصویر پیش‌نمایش الزامی است');

  // TODO → fetch واقعی:
  // یادت باشه dataURL سنگینه؛ یا base64 بفرست یا با dataUrlToBlob تبدیلش کن
  // و به‌صورت FormData بفرست تا حجم درخواست کمتر بشه.
  //
  // const blob = dataUrlToBlob(previewDataUrl);
  // const formData = new FormData();
  // formData.append('preview', blob, 'design.png');
  // formData.append('orderData', JSON.stringify(orderPayload));
  // const res = await fetch('/api/cart/add', { method: 'POST', body: formData });
  // if (!res.ok) throw new ApiError(res.status, await res.text());
  // return res.json();

  const tileCount = orderPayload.tiles?.length ?? 0;
  const basePrice = getPricePerTile(orderPayload.config);
  const totalPrice = tileCount * basePrice;

  return {
    cartItemId: crypto.randomUUID(),
    previewUrl: previewDataUrl, // فعلاً همون dataURL محلی، بعداً URL واقعی از سرور میاد
    addedAt: new Date().toISOString(),
    summary: {
      tileCount,
      shape:    orderPayload.config.shape,
      size:     orderPayload.config.size,
      material: orderPayload.config.material,
      corner:   orderPayload.config.corner,
      totalPrice,
    },
  };
}

// POST /api/order/submit
export async function submitOrder(orderPayload) {
  await fakeDelay(800);
  // TODO → fetch واقعی
  return { orderId: `ORD-${Date.now()}`, status: 'pending', message: 'سفارش با موفقیت ثبت شد' };
}

// ── helpers ──────────────────────────────────────────────────

function fakeDelay(ms = FAKE_DELAY_MS, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); });
  });
}

function getPricePerTile({ material, size }) {
  const mat  = { forex: 1, aluminum: 1.8, plexiglass: 1.5 };
  const sz   = { xs: 0.6, s: 0.8, m: 1, l: 1.3, xl: 1.6 };
  return Math.round(150_000 * (mat[material] ?? 1) * (sz[size] ?? 1));
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}