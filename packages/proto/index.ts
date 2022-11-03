// @ts-ignore
import Pbf from 'pbf'
import { IProtoMovieEntity } from './types'
// @ts-ignore
import { MovieEntity } from './svga.js'

function decodeMovieEntity (buffer: ArrayBuffer): IProtoMovieEntity {
  const pbf = new Pbf(buffer)
  return MovieEntity.read(pbf) as IProtoMovieEntity
}

export {
  decodeMovieEntity
}
