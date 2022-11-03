import * as PIXI from 'pixi.js'
import { ISVGAPlusRendererTickFrameParam, SVGAPlusRenderer } from '@svgaplus/core/types/core/models/renderer'

declare module '@svgaplus/core' {
  class SVGAPlus {
    readonly renderer: PixiRenderer
  }
}

declare class PixiRenderer implements SVGAPlusRenderer {
  readonly pixiApp: PIXI.Application
  readonly pixiContainer: PIXI.Container

  startTick: () => void
  stopTick: () => void
  destroy: () => void

  tickFrame: (param?: ISVGAPlusRendererTickFrameParam) => void

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
