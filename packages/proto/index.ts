// @ts-ignore
import Pbf from 'pbf'
import { IProtoMovieEntity } from './types'
import { MovieEntity } from './svga'

function decodeMovieEntity (buffer: ArrayBuffer): IProtoMovieEntity {
  const pbf = new Pbf(buffer)
  return MovieEntity.read(pbf, undefined) as IProtoMovieEntity
}

export {
  decodeMovieEntity
}
