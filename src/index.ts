import { CanvasElements, InteractiveDrawerOptions } from './interaction.types';
import { handleCanvasEvents } from './html.events';
import { createGridPatternWithLines } from './helper';
import { State } from './state-manager';

/**
 * Entry function for canvas
 */
function createInteractiveDrawer(
  height: number,
  width: number,
  stepLength: number,
  options?: InteractiveDrawerOptions,
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


  const state = new State(options?.state ?? {});

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
  handleCanvasEvents(canvasElements, stepLength, coordinatesForGrid, state);

  // append layer to document
  document.getElementsByClassName('container')[0]!.append(cElGrid, cElDraw);
}


const interactiveDrawerOptions: InteractiveDrawerOptions = {
  state: {
    debug: true
  }
};
createInteractiveDrawer(600, 600, 30, interactiveDrawerOptions);
