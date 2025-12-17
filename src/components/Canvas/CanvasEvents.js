import { Logger } from '../../utils/logger';

const COMPONENT = 'CanvasEvents';

export const attachCanvasEvents = (canvas, callbacks) => {
  const { onDragStart, onDragEnd, onSelect, onDeselect } = callbacks;

  // شروع درگ
  canvas.on('object:moving', (e) => {
    const obj = e.target;
    obj.set({ opacity: 0.5 });

    if (onDragStart) {
      onDragStart(obj);
    }

    Logger.info(COMPONENT, 'Tile Dragging', { id: obj.data?.id });
  });

  // پایان درگ
  canvas.on('object:modified', (e) => {
    const obj = e.target;
    obj.set({ opacity: 1 });

    if (onDragEnd) {
      onDragEnd(obj);
    }

    Logger.info(COMPONENT, 'Tile Dropped', { id: obj.data?.id });
  });

  // کلیک روی کاشی
  canvas.on('mouse:down', (e) => {
    if (e.target && e.target.data?.id) {
      if (onSelect) {
        onSelect(e.target);
      }
      Logger.info(COMPONENT, 'Tile Selected', { id: e.target.data.id });
    }
  });

  // دابل کلیک برای بازگشت به Overview
  canvas.on('mouse:dblclick', (e) => {
    if (!e.target && onDeselect) {
      onDeselect();
      Logger.info(COMPONENT, 'Canvas Deselected -> Overview Mode');
    }
  });

  Logger.success(COMPONENT, 'Events Attached');
};
