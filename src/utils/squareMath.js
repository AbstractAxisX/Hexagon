export const SQUARE_MATH = {
  SIZE: 120, // سایز هر خانه
};

/**
 * تبدیل مختصات Grid مربعی به پیکسل
 */
export function squareToPixel(x, y, centerX = 0, centerY = 0) {
  return {
    x: centerX + (x * SQUARE_MATH.SIZE),
    y: centerY + (y * SQUARE_MATH.SIZE)
  };
}

/**
 * تبدیل پیکسل به مختصات Grid مربعی
 */
export function pixelToSquare(pixelX, pixelY, centerX = 0, centerY = 0) {
  const x = Math.round((pixelX - centerX) / SQUARE_MATH.SIZE);
  const y = Math.round((pixelY - centerY) / SQUARE_MATH.SIZE);
  return { x, y };
}

/**
 * گرفتن ۴ همسایه (بالا، پایین، چپ، راست)
 */
export function getSquareNeighbors(x, y) {
  return [
    { x: x,     y: y - 1 }, // بالا
    { x: x,     y: y + 1 }, // پایین
    { x: x - 1, y: y     }, // چپ
    { x: x + 1, y: y     }, // راست
  ];
}

/**
 * محاسبه فاصله Manhattan (برای الگوریتم جای خالی)
 */
export function squareDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}