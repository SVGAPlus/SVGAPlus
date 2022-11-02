import { IProtoMovieEntity } from '../proto/models'
import { decodeMovieEntity } from '../proto/svga'
import { Inflate } from '../lib/zlib.js'

abstract class SVGAParser {
  static async parse (svgaBuffer: ArrayBuffer): Promise<IProtoMovieEntity> {
    const bufferArray = new Uint8Array(svgaBuffer)
    const inflate = new Inflate(bufferArray)
    const buffer = inflate.decompress()
    const movieEntity = decodeMovieEntity(buffer)
    return movieEntity
  }
}

export {
  SVGAParser
}
