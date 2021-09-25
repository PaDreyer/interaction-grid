import { CanvasElements } from './interaction.types';
import { handleCanvasEvents } from './html.events';
import { createGridPatternWithLines } from './helper';

/**
 * Entry function for canvas
 */
function createInteractiveDrawer(
  height: number,
  width: number,
  stepLength: number,
) {
  // create canvas grid layer for layout
  const cElGrid = document.createElement('canvas');
  const ctxGrid = cElGrid.getContext('2d')!;
  cElGrid.style.position = 'absolute';
  cElGrid.width = width;
  cElGrid.height = height;

  // create canvas draw layer to paint
  const cElDraw = document.createElement('canvas');
  const ctxDraw = cElDraw.getContext('2d')!;
  cElDraw.style.position = 'absolute';
  cElDraw.width = width;
  cElDraw.height = height;

  const canvasElements: CanvasElements = {
    grid: cElGrid,
    draw: cElDraw,
  };

  // initialize grid for canvas grid layer
  const coordinatesForGrid = createGridPatternWithLines(
    ctxGrid,
    cElGrid.height,
    cElGrid.width,
    stepLength,
  );

  // register events for both layer
  handleCanvasEvents(canvasElements, stepLength, coordinatesForGrid);

  // append layer to document
  document.getElementsByClassName('container')[0]!.append(cElGrid, cElDraw);
}

createInteractiveDrawer(300, 300, 30);
