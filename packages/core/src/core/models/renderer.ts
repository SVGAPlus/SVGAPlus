import { IProtoMovieEntity } from '@svgaplus/proto/types'
import { SVGAImageController } from '../modules/controller.image'
import { SvgaPlayController } from '../modules/controller.play'
import { EventBus } from '../modules/event-bus'

interface ISVGAPlusRendererParam {
  canvas: HTMLCanvasElement,
  movieEntity: IProtoMovieEntity,
  imageController: SVGAImageController,
  playController: SvgaPlayController,
  eventBus: EventBus,
  fps: number
}

interface ISVGAPlusRendererTickFrameParam {
  forceTick?: boolean
}

class SVGAPlusRenderer {
  startTick: () => void
  stopTick: () => void
  tickFrame: (param?: ISVGAPlusRendererTickFrameParam) => void
  destroy: () => void

  // eslint-disable-next-line no-useless-constructor
  constructor (param: ISVGAPlusRendererParam) {
    // ...
  }
}

export {
  SVGAPlusRenderer,
  ISVGAPlusRendererTickFrameParam,
  ISVGAPlusRendererParam
}
