/**
 * Hexagonal Grid Mathematics (Pointy-Top)
 * قوانین: مختصات Axial (q, r) و فاصله بین شش‌ضلعی‌ها
 *
 * تغییر: GAP از ۳ به ۱۴ افزایش یافت تا گپ واضحی بین شش‌ضلعی‌ها
 * ایجاد شود و حس بوردر نداشته باشند.
 *
 * نکته مهم: مقدار GAP در اینجا «فاصله مرکز-به-مرکز اضافه» است، نه خود گپ
 * بصری. چون شش‌ضلعی‌ها نقطه‌تماس دارند، گپ بصری نهایی تقریباً برابر
 * (SQRT3 * GAP/2) ≈ 12.1px خواهد بود (برای GAP=14).
 */

export const HEX_MATH = {
  RADIUS: 75,
  GAP: 8, // ✅ افزایش از ۳ به ۱۴ — گپ بصری واضح بین شش‌ضلعی‌ها
  SQRT3: Math.sqrt(3),

  // بردارهای همسایگی برای شش‌ضلعی (۶ جهت)
  DIRECTIONS: [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ],

  getEffectiveRadius() {
    // این مقدار برای محاسبه مرکز-به-مرکز استفاده می‌شه.
    // شکل خود شش‌ضلعی همیشه با RADIUS خالص رسم می‌شه،
    // پس افزایش GAP فقط فاصله بین کاشی‌ها رو بیشتر می‌کنه.
    return this.RADIUS + (this.GAP / 2);
  },

  getDimensions() {
    return {
      width: this.SQRT3 * this.RADIUS,
      height: 2 * this.RADIUS
    };
  }
};

/**
 * تبدیل مختصات شبکه به پیکسل (با لحاظ کردن Gap)
 */
export function hexToPixel(q, r, centerX, centerY) {
  const size = HEX_MATH.getEffectiveRadius();
  const x = size * (HEX_MATH.SQRT3 * q + (HEX_MATH.SQRT3 / 2) * r);
  const y = size * (1.5 * r);
  return { x: x + centerX, y: y + centerY };
}

/**
 * تبدیل پیکسل به مختصات شبکه
 */
export function pixelToHex(x, y, centerX, centerY) {
  const size = HEX_MATH.getEffectiveRadius();
  const relX = x - centerX;
  const relY = y - centerY;

  const q = ((HEX_MATH.SQRT3 / 3) * relX - (1 / 3) * relY) / size;
  const r = ((2 / 3) * relY) / size;

  return axialRound(q, r);
}

/**
 * رند کردن دقیق مختصات
 */
function axialRound(q, r) {
  const x = q;
  const z = r;
  const y = -x - z;

  let rx = Math.round(x);
  let rz = Math.round(z);
  let ry = Math.round(y);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }
  return { q: rx, r: rz };
}

/**
 * دریافت تمام همسایه‌های یک خانه
 */
export function getNeighbors(q, r) {
  return HEX_MATH.DIRECTIONS.map(dir => ({
    q: q + dir.q,
    r: r + dir.r
  }));
}

/**
 * محاسبه نقاط رسم شش‌ضلعی (برای گوشه‌های تیز)
 * نکته: این تابع همیشه از RADIUS خالص استفاده می‌کنه، نه از effectiveRadius.
 * این یعنی شکل کاشی ثابت می‌مونه و فقط فاصله‌ی مرکزها با GAP کنترل می‌شه.
 */
export function getHexPoints() {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push({
      x: HEX_MATH.RADIUS * Math.cos(angle_rad),
      y: HEX_MATH.RADIUS * Math.sin(angle_rad)
    });
  }
  return points;
}

/**
 * تولید مسیر SVG برای شش‌ضلعی با گوشه‌های گرد
 * @param {number} cornerRadius - شعاع گردی (پیش‌فرض ۱۰)
 * @returns {string} - رشته مسیر SVG (d attribute)
 */
export function getHexPathData(cornerRadius = 10) {
  const points = getHexPoints();
  const len = points.length;
  // محدود کردن شعاع گردی که شکل خراب نشود (نصف ضلع)
  // ضلع شش‌ضلعی برابر شعاع آن است
  const maxR = HEX_MATH.RADIUS / 2;
  const r = Math.min(cornerRadius, maxR);

  let d = "";

  for (let i = 0; i < len; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + len) % len];
    const next = points[(i + 1) % len];

    // بردار از رأس فعلی به سمت قبلی
    const vPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    // بردار از رأس فعلی به سمت بعدی
    const vNext = { x: next.x - curr.x, y: next.y - curr.y };

    const lenPrev = Math.sqrt(vPrev.x * vPrev.x + vPrev.y * vPrev.y);
    const lenNext = Math.sqrt(vNext.x * vNext.x + vNext.y * vNext.y);

    // محاسبه نقطه شروع خم (روی ضلع قبلی)
    const startX = curr.x + (vPrev.x / lenPrev) * r;
    const startY = curr.y + (vPrev.y / lenPrev) * r;

    // محاسبه نقطه پایان خم (روی ضلع بعدی)
    const endX = curr.x + (vNext.x / lenNext) * r;
    const endY = curr.y + (vNext.y / lenNext) * r;

    if (i === 0) {
      d += `M ${startX} ${startY}`;
    } else {
      d += ` L ${startX} ${startY}`;
    }

    // رسم منحنی بزیه (Quadratic)
    // Control Point: خود رأس (curr)
    // End Point: endX, endY
    d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  d += " Z";
  return d;
}
