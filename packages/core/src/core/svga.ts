import { SVGAParser } from '../parser/svga'
import { IProtoMovieEntity } from './models/proto'
import { SVGAPlusRenderer } from './models/renderer'
import { SVGAImageController } from './modules/controller.image'
import { SvgaPlayController } from './modules/controller.play'
import { EventBus } from './modules/event-bus'
import { VanillaRenderer } from './renderer/vanilla'

import { Logger } from './utils/logger'
import { raf } from './utils/raf'
import { TypeUtils } from './utils/type'

class SVGAPlus {
  static loadSvgaFile (url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'arraybuffer'
      xhr.onload = () => {
        resolve(xhr.response as ArrayBuffer)
      }
      xhr.onerror = reject
      xhr.send(null)
    })
  }

  private readonly _onPlayEvents: EventBus = new EventBus()
  private readonly _rawBuffer: ArrayBuffer = null

  private _imageController: SVGAImageController = null
  private _playController: SvgaPlayController = new SvgaPlayController()

  private _renderConstructor: typeof SVGAPlusRenderer = (VanillaRenderer as any)

  private _renderer: SVGAPlusRenderer = null
  get renderer (): SVGAPlusRenderer {
    return this._renderer
  }

  private readonly _canvas: HTMLCanvasElement = null
  private _isDestroyed: boolean = false

  get isInPlay () {
    return this._playController.isInPlay
  }

  private _movieEntity: IProtoMovieEntity = null

  private get _isMovieEntityReady (): boolean {
    return !!this._movieEntity
  }

  // FPS that defined by user.
  private readonly _fpsOverride: number = 0
  get fpsOverride (): number {
    return this._fpsOverride
  }

  // Current using fps.
  get fps (): number {
    return TypeUtils.isNumber(this._fpsOverride) && this._fpsOverride > 0
      ? this._fpsOverride
      : this._movieEntity?.params?.fps ?? 24
  }

  get frame () {
    return this._playController.frame
  }

  get frameCount (): number {
    return this._movieEntity?.params?.frames ?? 0
  }

  get maxFrame (): number {
    return this.frameCount < 1 ? 0 : this.frameCount - 1
  }

  get viewportWidth (): number {
    return this._movieEntity?.params?.viewBoxWidth ?? 0
  }

  get viewportHeight (): number {
    return this._movieEntity?.params?.viewBoxHeight ?? 0
  }

  private _initCanvasSize () {
    const width = this._movieEntity.params.viewBoxWidth
    const height = this._movieEntity.params.viewBoxHeight
    this._canvas.width = width
    this._canvas.height = height
  }

  private _startTick () {
    this._renderer?.startTick()
  }

  private _stopTick () {
    this._renderer?.stopTick()
  }

  // Reset loop start frame and end frame to default.
  private _setDefaultLoopFrames () {
    this._playController.setLoopStartFrame(0)
    this._playController.setLoopEndFrame(this.maxFrame)
  }

  // Init renderer.
  private _initRenderer () {
    const renderer = new this._renderConstructor({
      canvas: this._canvas,
      movieEntity: this._movieEntity,
      imageController: this._imageController,
      playController: this._playController,
      eventBus: this._onPlayEvents,
      fps: this.fps
    })

    renderer.tickFrame()  // Draw first frame.
    this._renderer = renderer
  }

  private _init () {
    if (!this._isMovieEntityReady) {
      throw new Error('MovieEntity should be initialized before canvas initialization.')
    }

    this._imageController = new SVGAImageController({
      movieEntity: this._movieEntity
    })

    this._setDefaultLoopFrames()
    this._initCanvasSize()
    this._initRenderer()
  }

  /**
   * Initialize SVGA Binary.
   */
  async init () {
    try {
      this._movieEntity = await SVGAParser.parse(this._rawBuffer)
      this._init()
    } catch (error) {
      Logger.error('Parse svga failed:', error)
    }
  }

  /**
   * Play animation loop.
   *
   * @param from Start frame index.
   * @param to Stop frame index.
   */
  play (from?: number, to?: number) {
    from = TypeUtils.isNumber(from) ? from : this._playController.loopStartFrame
    to = TypeUtils.isNumber(to) ? to : this._playController.loopEndFrame

    if (this.isInPlay) {
      return
    }

    if (from > to) {
      this._playController.setReversingStatus(true)
      if (from > this.maxFrame) { from = this.maxFrame }
      if (to < 0) { to = 0 }
    } else {
      this._playController.setReversingStatus(false)
      if (from < 0) { from = 0 }
      if (to > this.maxFrame) { to = this.maxFrame }
    }

    this._playController.setLoopStartFrame(from)
    this._playController.setLoopEndFrame(to)

    this._playController.setFrame(from)

    this._playController.setPlayStatus(true)
    this._startTick()
  }

  /**
   * Pause drawing.
   */
  pause () {
    if (!this.isInPlay) {
      return
    }

    this._stopTick()
    this._playController.setPlayStatus(false)
  }

  /**
   * Stop playing.
   *
   * @param {number} [stopAt] The frame index that stops at.
   */
  stop (stopAt?: number) {
    this._stopTick()
    this._playController.setPlayStatus(false)
    this._setDefaultLoopFrames()

    if (TypeUtils.isNumber(stopAt)) {
      this.seek(stopAt)
    }
  }

  /**
   * Seek to target frame.
   *
   * @param {number} frame Target frame index.
   */
  seek (frame: number) {
    if (frame < 0) { frame = 0 }
    if (frame > this.maxFrame) { frame = this.maxFrame }

    this._playController.setFrame(frame)

    // Tick to target frame manually when paused.
    const isNotPlaying = !this._isDestroyed && !this.isInPlay
    if (isNotPlaying) {
      // Render in next tick to make the currentFrame is current.
      // If this were run in sync, "this.frame" would be incorrect.
      // For example:
      // ```ts
      // svga.seek(5)
      // console.log(svga.frame)  // 6, no raf.
      // console.log(svga.frame)  // 5, exec using raf.
      // ```
      raf(() => {
        this._renderer.tickFrame({
          forceTick: true
        })
      })
    }
  }

  private _playOnceOnPlayHandler: () => void

  /**
   * Play animation once.
   *
   * @param {number} [from=0] Start frame index.
   * @param {number} [to=this.maxFrame] Stop frame index.
   * @return {Promise<void>}
   */
  playOnce (from: number = 0, to: number = this.maxFrame): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const isReverse = from > to
      if (isReverse) {
        if (from > this.maxFrame) { from = this.maxFrame }
        if (to < 0) { to = 0 }
      } else {
        if (from < 0) { from = 0 }
        if (to > this.maxFrame) { to = this.maxFrame }
      }

      this._playController.setReversingStatus(isReverse)
      this._playController.setLoopStartFrame(from)
      this._playController.setLoopEndFrame(to)
      this._playController.setFrame(from)

      // Unregister prev handler.
      this._onPlayEvents.off(this._playOnceOnPlayHandler)

      this._playOnceOnPlayHandler = () => {
        const isReversing = this._playController.isReversing
        const shouldStop = (isReversing && this.frame <= to) ||
          (!isReversing && this.frame >= to)

        if (shouldStop) {
          this.stop()
          this._onPlayEvents.off(this._playOnceOnPlayHandler)
          resolve()
        }
      }

      this.onPlay(this._playOnceOnPlayHandler)
      this.play()
    })
  }

  /**
   * Register an onPlay handler.
   *
   * @param {() => void} handler OnPlay handlers.
   */
  onPlay (handler: () => void) {
    this._onPlayEvents.on(handler)
  }

  /**
   * Unregister an onPlay handler.
   *
   * @param {() => void} handler OnPlay handlers.
   */
  offOnPlay (handler: () => void) {
    this._onPlayEvents.off(handler)
  }

  /**
   * Destroy this instance.
   */
  async destroy () {
    this._isDestroyed = true
    this.stop()

    this._renderer?.destroy()
    this._renderer = null

    this._imageController?.destroy()
    this._imageController = null

    this._onPlayEvents.destroy()

    this._movieEntity = null
  }

  constructor (option: ISVGAPlus) {
    const { element, buffer, fpsOverride, renderer } = option
    if (!element) {
      throw new TypeError('option.element should be provide.')
    }

    if (!buffer) {
      throw new TypeError('option.buffer should be provide.')
    }

    this._rawBuffer = buffer
    this._canvas = element
    this._fpsOverride = fpsOverride

    if (renderer) {
      this._renderConstructor = renderer
    }
  }
}

interface ISVGAPlus {
  element: HTMLCanvasElement
  buffer: ArrayBuffer
  fpsOverride?: number
  renderer?: typeof SVGAPlusRenderer
}

export {
  SVGAPlus
}
