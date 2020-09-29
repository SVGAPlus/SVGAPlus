import { IProtoMovieEntity } from '../../proto/models'
import { SVGAImageController } from '../modules/controller.image'
import { SvgaPlayController } from '../modules/controller.play'
import { EventBus } from '../modules/event-bus'

class SVGAPlusRenderer {
  startTick: () => void
  stopTick: () => void
  tickFrame: (param?: ISVGAPlusRendererTickFrameParam) => void
  destroy: () => void

  constructor (param: ISVGAPlusRendererParam) {
    // ...
  }
}

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

export {
  SVGAPlusRenderer,
  ISVGAPlusRendererTickFrameParam,
  ISVGAPlusRendererParam
}
