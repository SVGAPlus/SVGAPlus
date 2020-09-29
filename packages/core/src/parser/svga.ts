import { IProtoMovieEntity } from '../proto/models'

abstract class SVGAParser {
  static parse (svgaBuffer: ArrayBuffer): Promise<IProtoMovieEntity> {
    return new Promise(async (resolve, reject) => {
      const bufferArray = new Uint8Array(svgaBuffer)
      if (!!process.env.IS_WORKER_BUILD === true) {
        // tslint:disable-next-line:variable-name
        const Parser = require('worker-loader?inline=true&fallback=false!./svga.worker')
        const parser = new Parser()
        parser.onmessage = (param: {
          data: {
            data: IProtoMovieEntity,
            error?: Error
          }
        }) => {
          const { data, error } = param.data
          if (error) {
            return reject(error)
          }
          resolve(data)
        }
        parser.postMessage(bufferArray)
      }

      if (!!process.env.IS_WORKER_BUILD === false) {
        const { decodeMovieEntity } = require('../proto/svga')
        const { Inflate } = require('../lib/zlib.js')
        try {
          const inflate = new Inflate(bufferArray)
          const buffer = inflate.decompress()
          const movieEntity = decodeMovieEntity(buffer)
          resolve(movieEntity)
        } catch (error) {
          reject(error)
        }
      }
    })
  }
}

export {
  SVGAParser
}
