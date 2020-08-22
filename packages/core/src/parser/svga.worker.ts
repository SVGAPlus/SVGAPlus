import { IProtoMovieEntity } from '../core/models/proto'

const ctx: Worker = self as any

ctx.addEventListener('message', event => {
  const { MovieEntity } = require('../proto/svga')
  const { Inflate } = require('../lib/zlib.js')
  const bufferArray = event.data as Uint8Array

  let movieEntity: IProtoMovieEntity = null
  let error: Error = null
  try {
    const inflate = new Inflate(bufferArray)
    const plainBuffer = inflate.decompress() as Uint8Array
    movieEntity = MovieEntity.decode(plainBuffer) as IProtoMovieEntity

    // All these props were assigned to prototype.
    // And these props gonna be lost after being sent to main thread.
    // So re-assign those props to itself to make them own-props.
    for (const sprite of movieEntity.sprites) {
      for (const frame of sprite.frames) {
        for (const shape of frame.shapes) {
          shape.type = shape.type
          shape.ellipse = shape.ellipse
          shape.rect = shape.rect
          shape.shape = shape.shape
          shape.styles = shape.styles

          if (shape.styles) {
            shape.styles.fill = shape.styles.fill
            shape.styles.stroke = shape.styles.stroke
            shape.styles.strokeWidth = shape.styles.strokeWidth
          }

          shape.transform = shape.transform
        }
      }
    }
  } catch (e) {
    error = e
  }

  ctx.postMessage({
    data: movieEntity,
    error
  })
})
