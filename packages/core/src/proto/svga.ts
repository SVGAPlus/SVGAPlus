import Pbf from 'pbf'
import { IProtoMovieEntity } from './models'
import * as Protos from './svga.proto.js'

function decodeMovieEntity (buffer: ArrayBuffer): IProtoMovieEntity {
  const pbf = new Pbf(buffer)
  return Protos.MovieEntity.read(pbf) as IProtoMovieEntity
}

export {
  decodeMovieEntity
}
