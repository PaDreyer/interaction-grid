import {
  CanvasifyOptions,
  DrawCoordinateSystemOptions,
} from './interaction.types';
import { StateManager } from './manager/state.manager';
import { ObjectManager } from './manager/object.manager';
import { MenuManager } from './manager/menu.manager';
import { DrawCoordinateSystem } from './drawCoordinateSystem';

/**
 * Entry function for canvas
 */
function canvasify(height: number, width: number, options?: CanvasifyOptions) {
  // create canvas grid layer for layout
  const cElGrid = document.createElement('canvas');
  cElGrid.style.position = 'absolute';
  cElGrid.width = width;
  cElGrid.height = height;

  // create canvas draw layer to paint
  const cElDraw = document.createElement('canvas');
  cElDraw.style.position = 'absolute';
  cElDraw.width = width;
  cElDraw.height = height;

  // create canvas hover layer
  const cElHover = document.createElement('canvas');
  cElHover.style.position = 'absolute';
  cElHover.width = width;
  cElHover.height = height;

  // create manager for canvas application
  const stateManager = new StateManager(options?.stateManager ?? {});
  const objectManager = new ObjectManager(options?.objectManager ?? {});
  const menuManager = new MenuManager(options?.menuManager ?? {});

  // create builder
  return canvasBuilder(
    options,
    cElGrid,
    cElDraw,
    cElHover,
    stateManager,
    objectManager,
    menuManager,
  );
}

function canvasBuilder(
  options: CanvasifyOptions | undefined,
  gridElement: HTMLCanvasElement,
  drawElement: HTMLCanvasElement,
  hoverElement: HTMLCanvasElement,
  stateManager: StateManager,
  objectManager: ObjectManager,
  menuManager: MenuManager,
) {
  return {
    CoordinateSystem(drawCoordinateSystemOptions: DrawCoordinateSystemOptions) {
      const system = new DrawCoordinateSystem(
        options,
        drawCoordinateSystemOptions,
        gridElement,
        drawElement,
        hoverElement,
        stateManager,
        objectManager,
        menuManager,
      );
      return system;
    },
  };
}

const CanvasifyOptions: CanvasifyOptions = {
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

canvasify(500, 500, CanvasifyOptions)
  .CoordinateSystem({ stepLength: 50 })
  .draw()
  .$mount('container');
