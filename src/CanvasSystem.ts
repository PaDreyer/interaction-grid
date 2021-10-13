import { CanvasifyOptions } from './interaction.types';
import { MenuManager } from './manager/menu.manager';
import { ObjectManager } from './manager/object.manager';
import { StateManager } from './manager/state.manager';

export abstract class CanvasSystem<T> {
  protected readonly canvasOptions: CanvasifyOptions | undefined;
  protected options: T;
  protected gridElement: HTMLCanvasElement;
  protected drawElement: HTMLCanvasElement;
  protected hoverElement: HTMLCanvasElement;
  protected stateManager: StateManager;
  protected objectManager: ObjectManager;
  protected menuManager: MenuManager;

  constructor(
    canvasOptions: CanvasifyOptions | undefined,
    options: T,
    gridElement: HTMLCanvasElement,
    drawElement: HTMLCanvasElement,
    hoverElement: HTMLCanvasElement,
    stateManager: StateManager,
    objectManager: ObjectManager,
    menuManager: MenuManager,
  ) {
    this.canvasOptions = canvasOptions;
    this.options = options;
    this.gridElement = gridElement;
    this.drawElement = drawElement;
    this.hoverElement = hoverElement;
    this.stateManager = stateManager;
    this.objectManager = objectManager;
    this.menuManager = menuManager;
  }

  abstract draw(): void;

  $mount(elId: string) {
    const el = document.getElementById(elId);
    el?.append(this.gridElement, this.drawElement, this.hoverElement);
  }
}
