import { IMAGE_LOAD_KEY } from '../config'
import { IProtoMovieEntity } from '../models/proto'
import { SVGAUtils } from '../utils'

class SVGAImageController {
  private _movieEntity: IProtoMovieEntity = null
  private _imageCache: { [imageKey: string]: HTMLImageElement } = {}

  /**
   * Get SVGA sprite image.
   *
   * @param imageKey
   */
  getSpriteImage (imageKey: string): HTMLImageElement {
    if (!this._movieEntity) {
      return null
    }

    const imageFromCache = this._imageCache[imageKey]
    if (imageFromCache) {
      return imageFromCache
    }

    const imageBuffer = (this._movieEntity.images || {})[imageKey]
    if (imageBuffer) {
      const imageRawData = SVGAUtils.uint8ToString(imageBuffer)
      const image = new Image()

      // Define a property to indicate whether is image has been loaded.
      Object.defineProperty(image, IMAGE_LOAD_KEY, {
        enumerable: true,
        configurable: true,
        value: false,
        writable: true
      })

      image.onload = () => {
        // tslint:disable-next-line:no-string-literal
        image[IMAGE_LOAD_KEY] = true
      }

      image.src = 'data:image/png;base64,' + btoa(imageRawData)
      this._imageCache[imageKey] = image
      return image
    }

    return null
  }

  destroy () {
    this._movieEntity = null
    this._imageCache = null
  }

  constructor (param: {
    movieEntity: IProtoMovieEntity
  }) {
    this._movieEntity = param.movieEntity
  }
}

export {
  SVGAImageController
}
