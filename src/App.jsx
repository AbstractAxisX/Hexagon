// ============================================================
// App.jsx — مسیریابی بین onboarding، ادیتور و سبد خرید
// ============================================================
import React, { useState } from 'react';
import OnboardingPage from './Onboardingpage';
import CartPage from './components/CartPage';
import FabricCanvas from './components/Canvas/FabricCanvas';
import Header from './components/UI/Header';
import MobileToolbar from './components/UI/MobileToolbar';
import TileEditModal from './components/UI/EditModal/TileEditModal';
import SettingsModal from './components/UI/SettingsModal';
import useAppStore from './store/useAppStore';

function App() {
  // false = صفحه انتخاب اولیه | true = وارد محیط اصلی شده
  const [editorReady, setEditorReady] = useState(false);
  const currentView = useAppStore(state => state.currentView); // 'editor' | 'cart'

  if (!editorReady) {
    return <OnboardingPage onDone={() => setEditorReady(true)} />;
  }

  // ── صفحه سبد خرید (بعد از addDesignToCart خودکار فعال میشه) ──
  if (currentView === 'cart') {
    return <CartPage />;
  }

  // ── محیط اصلی ادیتور ──
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden select-none touch-none">

      {/* هدر دسکتاپ */}
      <div className="hidden md:block shrink-0">
        <Header />
      </div>

      {/* بوم */}
      <div className="flex-1 relative isolate overflow-hidden">
        <FabricCanvas />
      </div>

      {/* نوار موبایل */}
      <div className="block md:hidden shrink-0 relative">
        <MobileToolbar />
      </div>

      {/* مودال‌ها */}
      <TileEditModal />
      <SettingsModal />

    </div>
  );
}

export default App;