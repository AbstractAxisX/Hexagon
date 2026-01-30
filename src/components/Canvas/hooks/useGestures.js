import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

export const useGestures = (fabricRef) => {
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const lastZoomRef = useRef(1);
  const isGestureActive = useRef(false);

  useEffect(() => {
    
  }, [fabricRef]);
};