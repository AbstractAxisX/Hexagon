import { fabric } from 'fabric';

/**
 * textLayerUtils.js
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  SHARED TEXT LAYER FACTORY                                  │
 * │                                                             │
 * │  هم پریویو (LivePreviewCanvas) و هم همه‌ی Tileها            │
 * │  (Square/Hex/Circle) از این تابع استفاده می‌کنن.            │
 * │  اینطوری متن خروجی دقیقاً با پریویو یکی می‌شه.              │
 * └─────────────────────────────────────────────────────────────┘
 *
 * منطق transform:
 * - پریویو: canvas 300×300، مرکز 150,150، tile کلون‌شده با scale 1.4
 * - Tile اصلی: متن نسبت به مرکز group (0,0) — چون originX/Y = 'center'
 *
 * پس برای تبدیل:
 *   tile_relX = (previewLeft - 150) / SCALE_FACTOR
 *   tile_relY = (previewTop  - 150) / SCALE_FACTOR
 *   tile_fontSize = previewFontSize / SCALE_FACTOR
 *
 * ⚠️ SCALE_FACTOR باید با clone scale پریویو (1.4) یکی باشه، نه 1.5
 */

// ✅ این مقدار باید با scaleX/Y کلون در LivePreviewCanvas یکی باشه
export const TEXT_SCALE_FACTOR = 1.4;

/**
 * نرمال‌سازی لایه‌ی قدیمی → فرمت جدید
 * (برای backward compatibility با طرح‌های ذخیره‌شده‌ی قدیمی)
 */
export function normalizeLayer(layer = {}) {
  return {
    // محتوا
    text:                layer.text ?? '',
    fontFamily:          layer.fontFamily ?? 'Vazirmatn',
    fontSize:            layer.fontSize ?? 32,

    // استایل
    fontWeight:          layer.fontWeight
                         || (layer.bold ? 'bold' : 'normal'),
    fontStyle:           layer.fontStyle
                         || (layer.italic ? 'italic' : 'normal'),
    underline:           layer.underline ?? false,
    linethrough:         layer.linethrough ?? false,
    overline:            layer.overline ?? false,
    textAlign:           layer.textAlign ?? 'center',
    lineHeight:          layer.lineHeight ?? 1.16,
    charSpacing:         layer.charSpacing ?? 0,

    // رنگ و بوردر
    fill:                layer.fill ?? '#000000',
    stroke:              layer.stroke ?? null,
    strokeWidth:         layer.strokeWidth ?? 0,

    // بک‌گراند متن
    textBackgroundColor: layer.textBackgroundColor ?? null,

    // سایه
    shadowColor:         layer.shadowColor ?? '#000000',
    shadowBlur:          layer.shadowBlur ?? 0,
    shadowOffsetX:       layer.shadowOffsetX ?? 0,
    shadowOffsetY:       layer.shadowOffsetY ?? 0,

    // شفافیت
    opacity:             layer.opacity ?? 1,

    // موقعیت (absolute در پریویو، 150 = مرکز)
    previewLeft:         layer.previewLeft ?? layer.left ?? 150,
    previewTop:          layer.previewTop ?? layer.top ?? 150,

    // تبدیل‌ها
    scaleX:              layer.scaleX ?? 1,
    scaleY:              layer.scaleY ?? 1,
    angle:               layer.angle ?? 0,
    flipX:               layer.flipX ?? false,
    flipY:               layer.flipY ?? false,

    // id (برای canvas پریویو)
    id:                  layer.id,
  };
}

/**
 * ساخت شیء fabric.Text از یک layer config
 *
 * @param {Object} rawLayer - دیتای لایه (هم فرمت جدید هم قدیمی)
 * @param {Object} options
 * @param {number}  options.scaleFactor - 1 برای پریویو، TEXT_SCALE_FACTOR برای tile
 * @param {number}  options.centerOffset - 150 برای پریویو، 0 برای tile
 * @param {Function} options.clipPathFactory - تابع ساخت clipPath (برای tile)
 * @param {boolean} options.selectable - آیا قابل انتخاب باشه (پریویو: true, tile: false)
 * @returns {fabric.Text}
 */
export function createTextObject(rawLayer, options = {}) {
  const {
    scaleFactor   = TEXT_SCALE_FACTOR,
    centerOffset  = 0,
    clipPathFactory = null,
    selectable    = false,
  } = options;

  const layer = normalizeLayer(rawLayer);

  // تبدیل مختصات absolute پریویو → relative tile
  const relX = (layer.previewLeft - 150) / scaleFactor;
  const relY = (layer.previewTop  - 150) / scaleFactor;

  // ✅ بوردر فقط اگه stroke و strokeWidth داشته باشیم فعال می‌شه
  const hasStroke = layer.stroke && layer.strokeWidth > 0;

  // ✅ سایه فقط اگه blur یا offset داشته باشیم
  const hasShadow = layer.shadowBlur > 0
    || layer.shadowOffsetX !== 0
    || layer.shadowOffsetY !== 0;

  const textObj = new fabric.Text(layer.text || ' ', {
    // موقعیت
    left:   centerOffset + relX,
    top:    centerOffset + relY,
    originX: 'center',
    originY: 'center',

    // محتوا
    text:       layer.text || ' ',
    fontFamily: layer.fontFamily,
    fontSize:   layer.fontSize / scaleFactor,

    // ✅ استایل کامل (این‌ها قبلاً در tile نبودن!)
    fontWeight:  layer.fontWeight,
    fontStyle:   layer.fontStyle,
    underline:   layer.underline,
    linethrough: layer.linethrough,
    overline:    layer.overline,
    textAlign:   layer.textAlign,
    lineHeight:  layer.lineHeight,
    charSpacing: layer.charSpacing,

    // ✅ رنگ و بوردر — paintFirst: 'stroke' تا بوردر زیر fill رسم شه
    fill:        layer.fill,
    stroke:      hasStroke ? layer.stroke : null,
    strokeWidth: hasStroke ? (layer.strokeWidth / scaleFactor) : 0,
    paintFirst:  'stroke',

    // بک‌گراند متن
    textBackgroundColor: layer.textBackgroundColor,

    // ✅ سایه
    shadow: hasShadow
      ? new fabric.Shadow({
          color:   layer.shadowColor,
          blur:    layer.shadowBlur / scaleFactor,
          offsetX: layer.shadowOffsetX / scaleFactor,
          offsetY: layer.shadowOffsetY / scaleFactor,
        })
      : null,

    // ✅ شفافیت
    opacity: layer.opacity,

    // ✅ تبدیل‌ها
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    angle:  layer.angle,
    flipX:  layer.flipX,
    flipY:  layer.flipY,

    // انتخاب
    selectable:  selectable,
    evented:     selectable,
    hasControls: selectable,
    hasBorders:  selectable,
  });

  // ✅ clipPath — فقط برای tile (تا متن از شکل بیرون نزنه)
  if (clipPathFactory) {
    const clip = clipPathFactory();
    // چون clipPath نسبت به مرکز group محاسبه می‌شه (نه متن)،
    // باید موقعیت متن رو از clip کم کنیم تا هم‌راستا بمونن
    clip.set({
      left: -relX,
      top:  -relY,
    });
    textObj.set({ clipPath: clip });
  }

  return textObj;
}

/**
 * ساخت آرایه‌ای از اشیاء متن از textConfig
 *
 * @param {Object} textConfig - شامل layers یا text (legacy)
 * @param {Object} options - همون options تابع createTextObject
 * @returns {fabric.Text[]}
 */
export function createTextLayers(textConfig, options = {}) {
  const textObjects = [];

  if (textConfig?.layers && Array.isArray(textConfig.layers) && textConfig.layers.length > 0) {
    // الف) سیستم لایه‌ای جدید
    textConfig.layers.forEach(rawLayer => {
      const obj = createTextObject(rawLayer, options);
      // برای پریویو: id لایه رو روی آبجکت بذار تا انتخاب کار کنه
      if (options.selectable && rawLayer.id) {
        obj.layerId = rawLayer.id;
      }
      textObjects.push(obj);
    });
  } else {
    // ب) Legacy: متن ساده
    // در حالت legacy، textConfig.text یا content.text استفاده می‌شه
    // این بخش برای backward compatibility با طرح‌های خیلی قدیمه
    // و معمولاً توسط createDefaultTextbox هندل می‌شه
  }

  return textObjects;
}
