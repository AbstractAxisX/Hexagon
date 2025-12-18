import React, { forwardRef } from 'react';
import { Trash2 } from 'lucide-react'; // آیکون سطل زباله (اگر lucide ندارید، یک svg ساده بگذارید)

const TrashZone = forwardRef(({ isHovered }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        absolute bottom-4 left-1/2 -translate-x-1/2 
        flex items-center justify-center gap-2
        p-2 rounded-xl border transition-all duration-200 z-50
        rounded-full
        ${isHovered 
          ? 'bg-red-200/50 border-red-500 text-red-600 scale-110 shadow-lg shadow-red-200' 
          : 'bg-white/30 border-slate-100/50 text-slate-500 shadow-sm backdrop-blur-sm'
        }
      `}
    >
      <Trash2 size={24} className={`
        ${isHovered 
          ? 'text-red-600' 
          : 'text-white'
        }
        `} />

    </div>
  );
});

export default TrashZone;