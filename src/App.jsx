import React from 'react';
import FabricCanvas from './components/Canvas/FabricCanvas';
import Header from './components/UI/Header';
import MobileToolbar from './components/UI/MobileToolbar'; // ✅ ایمپورت جدید
import TileEditModal from './components/UI/EditModal/TileEditModal';
import SettingsModal from './components/UI/SettingsModal';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden select-none touch-none"> 
    {/* touch-none و select-none اضافه شد برای جلوگیری از رفتارهای ناخواسته مرورگر در ریشه برنامه */}

      {/* 1. هدر دسکتاپ (فقط در صفحات مدیوم به بالا دیده می‌شود) */}
      <div className="hidden md:block shrink-0">
        <Header />
      </div>

      {/* 2. محیط بوم (Canvas) */}
      <div className="flex-1 relative isolate overflow-hidden">
        <FabricCanvas />
      </div>

      {/* 3. نوار ابزار موبایل (فقط در صفحات کوچک دیده می‌شود) */}
      <div className="block md:hidden shrink-0 relative">
        <MobileToolbar />
      </div>

      {/* 4. مودال‌ها (خارج از جریان صفحه) */}
      <TileEditModal />
      <SettingsModal />
      
    </div>
  );
}

export default App;