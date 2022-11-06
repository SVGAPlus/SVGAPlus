class SvgaPlayController {
  private _frame = 0
  get frame (): number {
    return this._frame
  }

  private _isInPlay = false
  get isInPlay (): boolean {
    return this._isInPlay
  }

  private _lastDrawFrame = 0
  get lastDrawFrame (): number {
    return this._lastDrawFrame
  }

  private _isReversing = false
  get isReversing (): boolean {
    return this._isReversing
  }

  private _loopStartFrame = -1
  get loopStartFrame (): number {
    return this._loopStartFrame
  }

  private _loopEndFrame = -1
  get loopEndFrame (): number {
    return this._loopEndFrame
  }

  setFrame (frame: number) {
    this._frame = frame
  }

  setPlayStatus (isInPlay: boolean) {
    this._isInPlay = isInPlay
  }

  setLastDrawFrame (frame: number) {
    this._lastDrawFrame = frame
  }

  setReversingStatus (isReverse: boolean) {
    this._isReversing = isReverse
  }

  setLoopStartFrame (frame: number) {
    this._loopStartFrame = frame
  }

  setLoopEndFrame (frame: number) {
    this._loopEndFrame = frame
  }

  stepIntoPrevFrame () {
    let nextFrame = this._lastDrawFrame - 1
    if (nextFrame < this._loopEndFrame) {
      nextFrame = this._loopStartFrame
    }
    this._frame = nextFrame
  }

  stepIntoNextFrame () {
    let nextFrame = this._lastDrawFrame + 1
    if (nextFrame > this._loopEndFrame) {
      nextFrame = this._loopStartFrame
    }
    this._frame = nextFrame
  }
}

export {
  SvgaPlayController
}
