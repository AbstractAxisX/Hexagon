import { fabric } from 'fabric';
import { Logger } from '../../utils/logger';

const COMPONENT = 'CanvasSetup';

export const setupCanvas = (canvasElement, backgroundColor, container) => {
  Logger.info(COMPONENT, 'Initializing Canvas...');

  const canvas = new fabric.Canvas(canvasElement, {
    selection: false,
    preserveObjectStacking: true,
    backgroundColor: backgroundColor,
    renderOnAddRemove: false,
    hoverCursor: 'default',
  });

  // مدیریت Resize
  const handleResize = () => {
    if (container) {
      canvas.setWidth(container.offsetWidth);
      canvas.setHeight(container.offsetHeight);
      canvas.requestRenderAll();
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  Logger.success(COMPONENT, 'Canvas Ready', {
    width: canvas.width,
    height: canvas.height
  });

  return canvas;
};
