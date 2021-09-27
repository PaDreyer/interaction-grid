import { Coordinate, GridArray } from './interaction.types';

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
    if (
      grid[coordinate].y + range > coord.y - translate.y &&
      grid[coordinate].y - range < coord.y - translate.y &&
      grid[coordinate].x + range > coord.x - translate.x &&
      grid[coordinate].x - range < coord.x - translate.x
    ) {
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
    if (
      grid[coordinate].y + range > coord.y - translate.y &&
      grid[coordinate].y - range < coord.y - translate.y &&
      grid[coordinate].x + range > coord.x - translate.x &&
      grid[coordinate].x - range < coord.x - translate.x
    ) {
      return grid[coordinate];
    }
  }
  return;
}

/**
 * Create point shape for clicked point
 * @param x
 * @param y
 * @param stepLength
 */
export function createPointHint(x: number, y: number, stepLength: number) {
  const PointHint = new Path2D();
  PointHint.arc(x, y, stepLength / 4, 0, 360);
  return PointHint;
}

/**
 * Create base pattern
 * @param ctx
 * @param height
 * @param width
 * @param stepLength
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

export function removePointHintFromContext(
  ctx: CanvasRenderingContext2D,
  coord: Coordinate,
  stepLength: number,
) {
  ctx.beginPath();
  ctx.clearRect(
    coord.x - stepLength / 3 - 1,
    coord.y - stepLength / 3 - 1,
    (stepLength / 3) * 2 + 2,
    (stepLength / 3) * 2 + 2,
  );
  ctx.closePath();
}
