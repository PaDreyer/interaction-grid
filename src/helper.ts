import { Coordinate, GridArray } from './interaction.types';
import { ObjectManager } from './object.manager';
import { StateManager } from './state.manager';

/**
 * Check which coordinate is the nearest to a grid point
 * @param coord
 * @param grid
 * @param range
 */
export function isCoordinateInNearOfGrid(
  coord: Coordinate,
  grid: GridArray,
  range: number,
  translate: Coordinate,
): boolean {
  for (let coordinate = 0; coordinate < grid.length; coordinate++) {
    if (pointIsInRange(coord, grid[coordinate], range, translate)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the nearest coordinate to grid point
 * @param coord
 * @param grid
 * @param range
 */
export function getNearestCoordinateToGrid(
  coord: Coordinate,
  grid: GridArray,
  range: number,
  translate: Coordinate,
): Coordinate | undefined {
  for (let coordinate = 0; coordinate < grid.length; coordinate++) {
    if (pointIsInRange(coord, grid[coordinate], range, translate)) {
      return grid[coordinate];
    }
  }
  return;
}

/**
 * Check if a point is in a given range from coordinate
 * @param point
 * @param coord
 * @param range
 * @param translate
 */
export function pointIsInRange(
  point: Coordinate,
  coord: Coordinate,
  range: number,
  translate: Coordinate,
) {
  return (
    coord.y + range > point.y - translate.y &&
    coord.y - range < point.y - translate.y &&
    coord.x + range > point.x - translate.x &&
    coord.x - range < point.x - translate.x
  );
}

/**
 * Create point shape for clicked point
 * @param x
 * @param y
 * @param stepLength
 */
export function createPointHint(x: number, y: number, stepLength: number) {
  const PointHint = new Path2D();
  PointHint.arc(x, y, stepLength / 5, 0, 360);
  return PointHint;
}

/**
 * Create base pattern
 * @param ctx
 * @param height
 * @param width
 * @param stepLength
 * @param translate
 */
export function createGridPatternWithLines(
  ctx: CanvasRenderingContext2D,
  height: number,
  width: number,
  stepLength: number,
  translate = { x: 0, y: 0 },
): GridArray {
  const coordinatesForGrid: GridArray = [];
  const absX = Math.abs(translate.x);
  const absY = Math.abs(translate.y);

  // when drag down animate fall for vertical
  const calculatedStartY = translate.y - (translate.y % stepLength);
  const calculatedMaxHeight = height - translate.y;

  // draw vertical lines
  for (
    let currentHeight = -calculatedStartY;
    currentHeight <= calculatedMaxHeight;
    currentHeight += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(-translate.x, currentHeight);
    ctx.lineTo(width + absX, currentHeight);
    ctx.stroke();
  }

  // when drag right animate fall for horizontal
  const calculatedStartX = translate.x - (translate.x % stepLength);
  const calculatedMaxWidth = width - translate.x;

  // draw horizontal lines
  for (
    let currentWidth = -calculatedStartX;
    currentWidth <= calculatedMaxWidth;
    currentWidth += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(currentWidth, -translate.y);
    ctx.lineTo(currentWidth, height + absY);
    ctx.stroke();
  }

  const currentYStart = -translate.y + (translate.y % stepLength);
  const currentYMax = -translate.y + height;
  const currentXStart = -translate.x + (translate.x % stepLength);
  const currentXMax = -translate.x + width;

  // iterate trough Y
  for (
    let currentPoint = currentYStart;
    currentPoint <= currentYMax;
    currentPoint += stepLength
  ) {
    // iterate through X
    for (
      let currentCollectPoint = currentXStart;
      currentCollectPoint <= currentXMax;
      currentCollectPoint += stepLength
    ) {
      coordinatesForGrid.push({
        x: currentCollectPoint,
        y: currentPoint,
      });
    }
  }

  return coordinatesForGrid;
}

/**
 *
 * @param ctx
 * @param objectManager
 * @param stateManager
 * @param coord
 * @param stepLength
 */
export function removePointHintFromContext(
  ctx: CanvasRenderingContext2D,
  objectManager: ObjectManager,
  stateManager: StateManager,
  coord: Coordinate,
  stepLength: number,
) {
  if (
    objectManager.objects.some((object) => {
      return object.coord.x === coord.x && object.coord.y === coord.y;
    })
  )
    return;

  ctx.beginPath();
  ctx.clearRect(
    coord.x - stepLength / 3 - 1,
    coord.y - stepLength / 3 - 1,
    (stepLength / 3) * 2 + 2,
    (stepLength / 3) * 2 + 2,
  );
  ctx.closePath();
}

/**
 * Render objects on HTMLCanvasElement
 * @param el
 * @param objectManager
 * @param stateManager
 */
export function renderObjects(
  el: HTMLCanvasElement,
  objectManager: ObjectManager,
  stateManager: StateManager,
) {
  const ctx = el.getContext('2d');
  if (!ctx)
    throw new Error('Could not get context of canvas element at renderer');

  ctx.beginPath();
  objectManager.objects.forEach((object) => {
    ctx.fillStyle = object.color ?? 'black';
    ctx.fill(object.canvas);
    ctx.stroke();
  });
  ctx.closePath();
}

/**
 * Translate multiple layer to given offset
 * @param multipleLayer
 * @param coord
 */
export function translateMultipleLayer(
  multipleLayer: Array<HTMLCanvasElement>,
  offset: Coordinate,
) {
  for (const layer of multipleLayer) {
    const ctx = getContext<CanvasRenderingContext2D>(layer);

    ctx.resetTransform();
    ctx.clearRect(0, 0, layer.width, layer.height);
    ctx.translate(offset.x, offset.y);
  }
}

/**
 * Try to get context
 * @param el
 * @param type
 */
export function getContext<T extends RenderingContext>(
  el: HTMLCanvasElement,
  type = '2d',
): T {
  const ctx = el.getContext(type);
  if (!ctx) throw new Error(`Canvas context for ${el} not available.`);
  return ctx as unknown as T;
}
