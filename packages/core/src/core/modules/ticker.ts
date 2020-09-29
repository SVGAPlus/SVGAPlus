import { caf, raf } from '../utils/raf'

/*
  *1: The float would make some browsers dropping some frames in random,
      the result of this is the playing speed is slower than the expected.
      Convert float to int would fix this, but there are still many different behaviors across the different
      browsers, so for now there is no solution which can fix this problem.
      Reference:
      * https://github.com/pixijs/pixi.js/issues/5741
      * https://github.com/pixijs/pixi.js/pull/5833/files
 */

const IS_PERFORMANCE_AVAILABLE = typeof window.performance?.now === 'function'

class Ticker {
  private static createTs (): number {
    return IS_PERFORMANCE_AVAILABLE
      ? Math.round(window.performance.now())  // See *1.
      : Date.now()
  }

  private readonly _fps: number = 0
  private readonly _msPerFrame: number = 0
  private _isStart: boolean = false
  private _onTick: () => void = null
  private _rafId: number = null
  private _lastFrameTs: number = 0

  private _tick () {
    if (!this._isStart) {
      return
    }

    if (typeof this._onTick === 'function') {
      const ts = Ticker.createTs()
      if (ts - this._lastFrameTs >= this._msPerFrame) {
        this._onTick()
        this._lastFrameTs = ts
      }
    }

    this._rafId = raf(() => this._tick())
  }

  onTick (callback: () => void) {
    this._onTick = callback
  }

  startTick () {
    if (this._isStart) {
      return
    }

    this._isStart = true
    this._tick()
  }

  stopTick () {
    this._isStart = false
    caf(this._rafId)
  }

  destroy () {
    this.stopTick()
    this._onTick = null
  }

  constructor (fps: number = 60) {
    this._fps = fps
    this._msPerFrame = Math.round(1000 / fps)  // See *1.
  }
}

export {
  Ticker
}
