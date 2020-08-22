import * as PIXI from 'pixi.js'

declare module '@svgaplus/core' {
  class SVGAPlus {
    readonly renderer: PixiRenderer
  }
}

declare class PixiRenderer {
  readonly pixiApp: PIXI.Application
  readonly pixiContainer: PIXI.Container

  startTick: () => void
  stopTick: () => void
  destroy: () => void

  tickFrame: (param: {
    forceTick?: boolean
  }) => void

  constructor (param: {
    canvas: HTMLCanvasElement,
    movieEntity: IProtoMovieEntity,
    imageController: SVGAImageController,
    playController: SvgaPlayController,
    eventBus: EventBus,
    fps: number
  })
}

export {
  PixiRenderer
}
