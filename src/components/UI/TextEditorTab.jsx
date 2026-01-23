// src/components/UI/TextEditorTab.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css'; // استایل‌های پیش‌فرض
import { toPng } from 'html-to-image';

const TextEditorTab = ({ initialContent, onSave, onCancel }) => {
  // اگر متنی از قبل بوده (حالت ادیت)، آن را لود کن
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  const editorWrapperRef = useRef(null);

  const handleDone = async () => {
    if (editorWrapperRef.current) {
      // 1. گرفتن خروجی JSON برای ویرایش‌های بعدی
      const jsonBlocks = editor.document;

      // 2. تبدیل ظاهر ادیتور به یک تصویر شفاف برای نمایش روی کانواس
      // ما فقط کانتنت داخل ادیتور را عکس می‌گیریم
      const dataUrl = await toPng(editorWrapperRef.current, {
        quality: 0.95,
        backgroundColor: 'transparent', // پس‌زمینه شفاف
        style: { transform: 'scale(1)' } // جلوگیری از به هم ریختگی اسکیل
      });

      // 3. ارسال داده‌ها به تابع اصلی
      onSave({
        imageSrc: dataUrl,
        jsonContent: jsonBlocks, // این خیلی مهمه برای ادیت مجدد
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 bg-white rounded-lg">
      <div className="text-sm font-bold text-gray-700 mb-2">
        ویرایشگر متن (BlockNote)
      </div>
      
      {/* محدوده ادیتور - اینجا جاییه که کاربر تایپ میکنه */}
      <div 
        ref={editorWrapperRef} 
        className="flex-grow border border-gray-200 rounded-md overflow-hidden bg-transparent relative"
        style={{ minHeight: '300px' }} // ارتفاع مناسب برای ادیتور
      >
        <BlockNoteView editor={editor} theme="light" />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
        >
          لغو
        </button>
        <button 
          onClick={handleDone}
          className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition shadow-lg font-bold"
        >
          افزودن به شکل
        </button>
      </div>
    </div>
  );
};

export default TextEditorTab;