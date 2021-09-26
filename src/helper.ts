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
): boolean {
  for (let coordinate = 0; coordinate < grid.length; coordinate++) {
    if (
      grid[coordinate].y + range > coord.y &&
      grid[coordinate].y - range < coord.y &&
      grid[coordinate].x + range > coord.x &&
      grid[coordinate].x - range < coord.x
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
): Coordinate | undefined {
  for (let coordinate = 0; coordinate < grid.length; coordinate++) {
    if (
      grid[coordinate].y + range > coord.y &&
      grid[coordinate].y - range < coord.y &&
      grid[coordinate].x + range > coord.x &&
      grid[coordinate].x - range < coord.x
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
  translate = { x: 0, y: 0}
): GridArray {
  const coordinatesForGrid: GridArray = [];

  // draw vertical lines
  for (
    let currentHeight = 0;
    currentHeight <= height;
    currentHeight += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(0, currentHeight);
    ctx.lineTo(width, currentHeight);
    ctx.stroke();
  }

  // draw horizontal lines
  for (
    let currentWidth = 0;
    currentWidth <= width;
    currentWidth += stepLength
  ) {
    ctx.beginPath();
    ctx.moveTo(currentWidth, 0);
    ctx.lineTo(currentWidth, height);
    ctx.stroke();
  }

  const longestSide = width > height ? width : height;
  const shortestSide = width > height ? height : width;
  // iterate trough longest side
  for (
    let currentPoint = 0;
    currentPoint <= longestSide;
    currentPoint += stepLength
  ) {
    // iterate through vertical line and collect all points
    for (
      let currentCollectPoint = 0;
      currentCollectPoint <= shortestSide;
      currentCollectPoint += stepLength
    ) {
      coordinatesForGrid.push(
        width > height
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
