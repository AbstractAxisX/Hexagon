// ============================================================
// App.jsx — نسخه آپدیت‌شده با صفحه انتخاب اولیه
// ============================================================
import React, { useState } from 'react';
import OnboardingPage from './Onboardingpage';
import FabricCanvas from './components/Canvas/FabricCanvas';
import Header from './components/UI/Header';
import MobileToolbar from './components/UI/MobileToolbar';
import TileEditModal from './components/UI/EditModal/TileEditModal';
import SettingsModal from './components/UI/SettingsModal';

function App() {
  // false = صفحه انتخاب اولیه | true = ادیتور
  const [editorReady, setEditorReady] = useState(false);

  if (!editorReady) {
    return <OnboardingPage onDone={() => setEditorReady(true)} />;
  }

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