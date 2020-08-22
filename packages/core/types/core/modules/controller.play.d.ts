declare class SvgaPlayController {
  readonly frame: number
  readonly isInPlay: boolean
  readonly lastDrawFrame: number
  readonly isReversing: boolean
  readonly loopStartFrame: number
  readonly loopEndFrame: number

  setFrame (frame: number): void
  setPlayStatus (isInPlay: boolean): void
  setLastDrawFrame (frame: number): void
  setReversingStatus (isReverse: boolean): void
  setLoopStartFrame (frame: number): void
  setLoopEndFrame (frame: number): void
  stepIntoPrevFrame (): void
  stepIntoNextFrame (): void
}

export {
  SvgaPlayController
}
