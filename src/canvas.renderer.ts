import { ObjectManager } from './object.manager';
import { StateManager } from './state.manager';

export class CanvasRenderer {
  private readonly objectManager: ObjectManager;
  private readonly stateManager: StateManager;

  constructor(objectManager: ObjectManager, stateManager: StateManager) {
    this.objectManager = objectManager;
    this.stateManager = stateManager;
  }

  public renderAtCtx() {}
}
