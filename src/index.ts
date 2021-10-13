import { CanvasElements, InteractiveDrawerOptions } from './interaction.types';
import { handleCanvasEvents } from './html.events';
import { createGridPatternWithLines } from './helper';
import { StateManager } from './state.manager';
import { ObjectManager } from './object.manager';
import { MenuManager } from './menu.manager';

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

  // create canvas hover layer 
  const cElHover = document.createElement('canvas');
  const ctxHover = cElHover.getContext("2d")!;
  cElHover.style.position = 'absolute';
  cElHover.width = width;
  cElHover.height = height;

  const stateManager = new StateManager(options?.stateManager ?? {});
  const objectManager = new ObjectManager(options?.objectManager ?? {});
  const menuManager = new MenuManager(options?.menuManager ?? {});

  const canvasElements: CanvasElements = {
    grid: cElGrid,
    draw: cElDraw,
    hover: cElHover,
  };

  const coordinatesForGrid = createGridPatternWithLines(
    ctxGrid,
    cElGrid.height,
    cElGrid.width,
    stepLength,
  );

  handleCanvasEvents(
    canvasElements,
    stepLength,
    coordinatesForGrid,
    stateManager,
    objectManager,
  );

  return {
    $mount(id: string) {
      document.getElementById(id)?.append(cElGrid, cElDraw, cElHover);
    },
  };
}

const interactiveDrawerOptions: InteractiveDrawerOptions = {
  stateManager: {
    debug: true,
  },
  objectManager: {
    debug: true,
  },
  menuManager: {
    debug: true,
  },
};

createInteractiveDrawer(500, 500, 50, interactiveDrawerOptions).$mount(
  'container',
);
