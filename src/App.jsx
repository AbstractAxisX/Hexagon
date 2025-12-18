import React from 'react';
import FabricCanvas from './components/Canvas/FabricCanvas';
import Header from './components/UI/Header'; // ✅ کامپوننت جدید
import TileEditModal from './components/UI/EditModal/TileEditModal';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden">
      
      {/* 1. هدر ابزارها */}
      <Header />

      {/* 2. محیط بوم (Canvas) */}
      <div className="flex-1 relative isolate">
        <FabricCanvas />
      </div>

      {/* 3. مودال‌ها (خارج از جریان صفحه) */}
      <TileEditModal />
      
    </div>
  );
}

export default App;