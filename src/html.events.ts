import {
  CanvasElements,
  Coordinate,
  DragEvent,
  Events,
  GridArray,
  MoveEvent,
} from './interaction.types';
import { filter, fromEvent, map, merge, pairwise, tap, partition } from 'rxjs';
import { State } from './state-manager';
import {
  createGridPatternWithLines,
  createPointHint,
  getNearestCoordinateToGrid,
  isCoordinateInNearOfGrid,
  removePointHintFromContext,
} from './helper';

const state = new State();

/**
 *
 * @param canvasElements
 * @param stepLength
 * @param coordinatesForGrid
 */
export function handleCanvasEvents(
  canvasElements: CanvasElements,
  stepLength: number,
  coordinatesForGrid: GridArray,
) {
  const { draw: drawElement, grid: gridElement } = canvasElements;

  // handle event pipeline for state handler (mousemove)
  const mouseMoveStateHandler$ = fromEvent<MouseEvent>(
    drawElement,
    'mousemove',
  ).pipe(tap((event: MouseEvent) => state.eventHandler(event)));

  // event pipe for mouse drag case
  const mouseDrag$ = state.onDrag$.pipe(
    tap((event: DragEvent) => {
      const ctx = drawElement.getContext('2d')!;
      state.currentPointHint &&
        removePointHintFromContext(ctx, state.currentPointHint, stepLength);
      drawElement.style.cursor = 'grabbing';
    }),
    tap((event) => {
      const ctxDraw = drawElement.getContext('2d')!;
      const ctxGrid = gridElement.getContext('2d')!;

      ctxGrid.clearRect(0, 0, gridElement.width, gridElement.height);
      ctxDraw.clearRect(0, 0, drawElement.width, drawElement.height);

      console.log('Event: ', JSON.stringify(event, null, 2));
      ctxDraw.translate(event.translate.x, event.translate.y);
      ctxGrid.translate(event.translate.x, event.translate.y);
      createGridPatternWithLines(
        ctxGrid,
        gridElement.height,
        gridElement.width,
        stepLength,
      );
    }),
  );

  // event pipe for mouse move case
  const mouseMove$ = state.onMove$.pipe(
    filter(
      (event: MoveEvent) =>
        isCoordinateInNearOfGrid(
          { x: event.offsetX, y: event.offsetY },
          coordinatesForGrid,
          stepLength / 2,
        ) && !state.isDragMove,
    ),
    map((event: MoveEvent) =>
      getNearestCoordinateToGrid(
        { x: event.offsetX, y: event.offsetY },
        coordinatesForGrid,
        stepLength / 2,
      ),
    ),
    pairwise(),
    tap((events: Array<undefined | Coordinate>) => {
      const ctx = drawElement.getContext('2d')!;
      events[0] && removePointHintFromContext(ctx, events[0], stepLength);
      ctx.fillStyle = 'blue';

      if (events[1]) {
        const newPointHint = createPointHint(
          events[1].x,
          events[1].y,
          stepLength,
        );
        state.currentPointHint = events[1];
        ctx.fill(newPointHint);
      }
    }),
  );

  // event pipe for mouse down case
  const mouseDown$ = fromEvent<MouseEvent>(drawElement, 'mousedown').pipe(
    tap((event: MouseEvent) => state.eventHandler(event)),
    filter((event: MouseEvent) =>
      isCoordinateInNearOfGrid(
        { x: event.offsetX, y: event.offsetY },
        coordinatesForGrid,
        stepLength / 2,
      ),
    ),
    map((event: MouseEvent) =>
      getNearestCoordinateToGrid(
        { x: event.offsetX, y: event.offsetY },
        coordinatesForGrid,
        stepLength / 2,
      ),
    ),
    tap((event: any) => {
      if (event instanceof PointerEvent) {
        const ctx = drawElement.getContext('2d')!;
        ctx.fillStyle = 'blue';
        ctx.fill(createPointHint(event.offsetX, event.offsetY, stepLength));
      }
    }),
  );

  // event pipe for mouse up case
  const mouseUp$ = fromEvent<MouseEvent>(drawElement, 'mouseup').pipe(
    tap((event: MouseEvent) => state.eventHandler(event)),
    tap(() => {
      drawElement.style.cursor = 'default';
    }),
  );

  // register all events
  merge(
    mouseMoveStateHandler$,
    mouseDown$,
    mouseMove$,
    mouseUp$,
    mouseDrag$,
  ).subscribe();
}
