import pako from 'pako'
import { IProtoMovieEntity } from '../proto/models'
import { decodeMovieEntity } from '../proto/svga'

abstract class SVGAParser {
  static async parse (svgaBuffer: ArrayBuffer): Promise<IProtoMovieEntity> {
    const bufferArray = new Uint8Array(svgaBuffer)
    const buffer = pako.inflate(bufferArray)
    const movieEntity = decodeMovieEntity(buffer)
    return movieEntity
  }
}

export {
  SVGAParser
}
