import { IProtoMovieEntity } from '../../proto/proto'

declare class SVGAImageController {
  getSpriteImage: (imageKey: string) => HTMLImageElement
  destroy: () => void
  constructor (params: {
    movieEntity: IProtoMovieEntity
  })
}

export {
  SVGAImageController
}
