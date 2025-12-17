import { useEffect, useState } from 'react';

const TrashZone = ({ isDragging, draggedTileId }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setIsHovered(false);
    }
  }, [isDragging]);

  // ✅ اگر در حال Drag نیستیم، TrashZone رو نشون نده
  if (!isDragging || !draggedTileId) return null;

  return (
    <div
      data-trash-zone
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]
        pointer-events-auto
        transition-all duration-300 
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // ✅ اطمینان از اینکه element واقعاً قابل کلیک است
        minWidth: '280px',
        minHeight: '80px',
      }}
    >
      <div
        className={`
          flex items-center justify-center gap-3 px-8 py-5 
          rounded-2xl shadow-2xl
          backdrop-blur-md border-2 transition-all duration-300
          ${isHovered 
            ? 'bg-red-500 border-red-600 text-white scale-105' 
            : 'bg-white/90 border-gray-300 text-gray-700'}
        `}
      >
        <svg
          className={`w-8 h-8 transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="font-bold text-lg whitespace-nowrap">
          {isHovered ? '🔥 رها کن تا حذف شود!' : 'بکش اینجا برای حذف'}
        </span>
      </div>

      {/* ✅ یک Layer نامرئی بزرگتر برای راحتی Drop */}
      <div 
        className="absolute inset-0 -m-4"
        style={{
          // این باعث میشه Drop Area بزرگتر باشه
          width: 'calc(100% + 32px)',
          height: 'calc(100% + 32px)',
          left: '-16px',
          top: '-16px'
        }}
      />
    </div>
  );
};

export default TrashZone;
