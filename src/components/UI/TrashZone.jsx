import React, { forwardRef } from 'react';
import { Trash2 } from 'lucide-react'; // آیکون سطل زباله (اگر lucide ندارید، یک svg ساده بگذارید)

const TrashZone = forwardRef(({ isHovered }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        absolute bottom-4 left-10 -translate-x-1/2 
        flex items-center justify-center gap-2
        p-2 rounded-full border transition-all duration-200 z-50

        ${isHovered 
          ? 'border-red-500 text-red-600 scale-110  ' 
          : ' border-slate-100/30 text-red-600  backdrop-blur-sm'
        }
      `}
    >
      <Trash2 size={24} className={`
        ${isHovered 
          ? 'text-red-600' 
          : 'text-red-600'
        }
        `} />

    </div>
  );
});

export default TrashZone;