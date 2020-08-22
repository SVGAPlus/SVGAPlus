import { IProtoMovieEntity } from '../proto/proto'

// tslint:disable-next-line:no-namespace
declare namespace SVGAParser {
  export const parse: (svgaBuffer: ArrayBuffer) => Promise<IProtoMovieEntity>
}

export {
  SVGAParser
}
