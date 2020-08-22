import { SVGAPlusRenderer } from './models/renderer'

declare class SVGAPlus {
  readonly isInPlay: boolean
  readonly fpsOverride: number
  readonly fps: number
  readonly frame: number
  readonly frameCount: number
  readonly maxFrame: number

  /**
   * SVGA viewport width.
   * Also presents the width of SVGA file.
   *
   * @type {number}
   * @memberof SVGAPlus
   */
  readonly viewportWidth: number

  /**
   * SVGA viewport height.
   * Also presents the height of SVGA file.
   *
   * @type {number}
   * @memberof SVGAPlus
   */
  readonly viewportHeight: number

  /**
   * Load Svga file into ArrayBuffer.
   *
   * @static
   * @param {string} url
   * @returns {Promise<ArrayBuffer>}
   * @memberof SVGAPlus
   */
  static loadSvgaFile: (url: string) => Promise<ArrayBuffer>

  /**
   * Initialize SVGAPlus instance.
   */
  init: () => Promise<void>

  /**
   * Play animation loop.
   *
   * @param {[number = 0]} from Start frame index.
   * @param {[number = this.maxFrame]} to Stop frame index.
   */
  play: (from?: number, to?: number) => void

  /**
   * Pause drawing.
   */
  pause: () => void

  /**
   * Stop playing.
   *
   * @param stopAt The frame index that stops at.
   */
  stop: (stopAt?: number) => void

  /**
   * Seek to target frame.
   *
   * @param {number} frame Target frame index.
   */
  seek: (frame: number) => void

  /**
   * Play animation once.
   *
   * @param {[number=0]} from Start frame index.
   * @param {[number=this.maxFrame]} to Stop frame index.
   * @return {Promise<void>}
   */
  playOnce: (from?: number, to?: number) => Promise<void>

  /**
   * Register an onPlay handler.
   *
   * @param {() => void} handler OnPlay handlers.
   */
  onPlay: (handler: () => void) => void

  /**
   * Unregister an onPlay handler.
   *
   * @param {() => void} handler OnPlay handlers.
   */
  offOnPlay: (handler: () => void) => void

  /**
   * Destroy this instance.
   */
  destroy: () => void

  constructor (option: ISVGAPlus)
}

declare interface ISVGAPlus {
  /**
   * Canvas element.
   */
  element: HTMLCanvasElement

  /**
   * SVGA file buffer.
   */
  buffer: ArrayBuffer

  /**
   * Override FPS.
   */
  fpsOverride?: number

  /**
   * Use specific render.
   */
  renderer?: typeof SVGAPlusRenderer
}

export {
  SVGAPlus
}
