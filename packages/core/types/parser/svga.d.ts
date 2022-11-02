import { IProtoMovieEntity } from '../proto/proto'

declare namespace SVGAParser {
  export const parse: (svgaBuffer: ArrayBuffer) => Promise<IProtoMovieEntity>
}

export {
  SVGAParser
}
