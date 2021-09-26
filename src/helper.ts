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

  // when drag down animate fall for vertical
  const calculatedStartY =
    Math.abs(translate.y) - (Math.abs(translate.y) % stepLength);

  // draw vertical lines
  for (
    let currentHeight = -calculatedStartY;
    currentHeight <= height + Math.abs(translate.y);
    currentHeight += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(-translate.x, currentHeight);
    ctx.lineTo(width + Math.abs(translate.x), currentHeight);
    ctx.stroke();
  }

  // when drag right animate fall for horizontal
  const calculatedStartX =
    Math.abs(translate.x) - (Math.abs(translate.x) % stepLength);

  // draw horizontal lines
  for (
    let currentWidth = -calculatedStartX;
    currentWidth <= width + Math.abs(translate.x);
    currentWidth += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(currentWidth, 0 - translate.y);
    ctx.lineTo(currentWidth, height + Math.abs(translate.y));
    ctx.stroke();
  }

  const absX = Math.abs(translate.x);
  const absY = Math.abs(translate.y);
  const longestSide =
    width + absX > height + absY ? width + absX : height + absY;
  const shortestSide =
    width + absX > height + absY ? height + absY : width + absX;

  const longestCurrentPoint = width + absX > height + absY ? absX : absY;
  const shortestCurrentPoint = width + absX > height + absY ? absY : absX;

  // iterate trough longest side
  for (
    let currentPoint = -(
      longestCurrentPoint -
      (longestCurrentPoint % stepLength)
    );
    currentPoint <= longestSide;
    currentPoint += stepLength
  ) {
    // iterate through vertical line and collect all points
    for (
      let currentCollectPoint = -(
        shortestCurrentPoint -
        (shortestCurrentPoint % stepLength)
      );
      currentCollectPoint <= shortestSide;
      currentCollectPoint += stepLength
    ) {
      coordinatesForGrid.push(
        width + (absX - (absX % 2)) > height + (absY - (absY % 2))
          ? {
              x: currentPoint,
              y: currentCollectPoint,
            }
          : {
              x: currentCollectPoint,
              y: currentPoint,
            },
      );
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
