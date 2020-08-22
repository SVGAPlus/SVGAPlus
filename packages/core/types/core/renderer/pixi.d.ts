import * as PIXI from 'pixi.js'

declare class PixiRenderer {
  /**
   * Pixi application object.
   */
  readonly pixiApp: PIXI.Application

  /**
   * Pixi container object.
   */
  readonly pixiContainer: PIXI.Container

  /**
   * Start renderer ticking.
   */
  startTick: () => void

  /**
   * Stop renderer ticking.
   */
  stopTick: () => void

  /**
   * Destroy pixi renderer.
   */
  destroy: () => void
}

export {
  PixiRenderer
}
