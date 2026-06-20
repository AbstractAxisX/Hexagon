// ============================================================
// CartPage.jsx — صفحه سبد خرید
// بعد از addDesignToCart نمایش داده میشه (currentView === 'cart')
// عکس طرح + خلاصه سفارش + دکمه ثبت نهایی
// ============================================================
import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { submitOrder, ApiError } from '../services/mockApi';
import { ArrowRight, Loader2, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { APP_CONFIG } from '../data/appConfig';

export default function CartPage() {
  const cartItem        = useAppStore(s => s.cartItem);
  const setCurrentView  = useAppStore(s => s.setCurrentView);
  const clearCart       = useAppStore(s => s.clearCart);
  const generateOrderPayload = useAppStore(s => s.generateOrderPayload);

  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);

  const backToEditor = () => setCurrentView('editor');

  const handleRemove = () => {
    clearCart();
    backToEditor();
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = generateOrderPayload();
      const result = await submitOrder(payload);
      setOrderResult(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطا در ثبت سفارش. دوباره تلاش کن.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── حالت موفقیت نهایی ──
  if (orderResult) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center font-[Vazirmatn]">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">سفارش ثبت شد</h1>
        <p className="text-sm text-slate-500 mb-1">شماره سفارش: <span className="font-mono font-semibold text-slate-700">{orderResult.orderId}</span></p>
        <p className="text-sm text-slate-400">{orderResult.message}</p>
      </div>
    );
  }

  // ── سبد خالی (بی‌دلیل سر زده اینجا) ──
  if (!cartItem) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center font-[Vazirmatn]">
        <p className="text-slate-400 mb-4">سبد خرید خالی است</p>
        <button
          onClick={backToEditor}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          بازگشت به ادیتور
        </button>
      </div>
    );
  }

  const { summary, previewUrl } = cartItem;
  const shapeLabel    = APP_CONFIG.shapes.find(s => s.id === summary.shape)?.name ?? summary.shape;
  const materialLabel = APP_CONFIG.materials.find(m => m.id === summary.material)?.name ?? summary.material;
  const sizeLabel     = APP_CONFIG.sizes.find(s => s.id === summary.size)?.label ?? summary.size;
  const cornerLabel   = APP_CONFIG.corners.find(c => c.id === summary.corner)?.name ?? summary.corner;

  const formatted = new Intl.NumberFormat('fa-IR').format(summary.totalPrice);

  return (
    <div dir="rtl" className="min-h-screen bg-white font-[Vazirmatn]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">

        {/* بازگشت */}
        <button
          onClick={backToEditor}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowRight size={16} className="rotate-180" />
          بازگشت به ادیتور
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8">سبد خرید</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">

          {/* ── کارت آیتم سبد ── */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 aspect-[4/3] flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt="پیش‌نمایش طرح"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-5 flex items-start justify-between gap-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <p className="font-bold text-slate-800">طرح اختصاصی کاشی دیواری</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>شکل: <b className="text-slate-700">{shapeLabel}</b></span>
                  <span>سایز: <b className="text-slate-700">{sizeLabel}</b></span>
                  <span>متریال: <b className="text-slate-700">{materialLabel}</b></span>
                  <span>گوشه: <b className="text-slate-700">{cornerLabel}</b></span>
                  <span>تعداد کاشی: <b className="text-slate-700">{summary.tileCount}</b></span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={backToEditor}
                  title="ویرایش طرح"
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={handleRemove}
                  title="حذف از سبد"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* ── خلاصه پرداخت ── */}
          <div className="border border-slate-200 rounded-2xl p-6 h-fit space-y-5">
            <h2 className="font-bold text-slate-800">خلاصه سفارش</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>جمع کاشی‌ها ({summary.tileCount} عدد)</span>
                <span className="tabular-nums">{formatted} تومان</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>هزینه ارسال</span>
                <span>پس از تأیید</span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">مبلغ قابل پرداخت</span>
              <span className="font-bold text-lg text-blue-600 tabular-nums">{formatted} <span className="text-xs text-slate-400 font-normal">تومان</span></span>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm shadow-md disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={17} className="animate-spin" /> در حال ثبت...</>
                : 'ثبت نهایی سفارش'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}