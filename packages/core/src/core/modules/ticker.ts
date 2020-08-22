import { caf, raf } from '../utils/raf'

class Ticker {
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
      const ts = Date.now()
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
    this._msPerFrame = 1000 / fps
  }
}

export {
  Ticker
}
