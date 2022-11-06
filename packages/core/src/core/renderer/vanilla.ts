import {
  IProtoMovieEntity,
  IProtoShapeEntity,
  IProtoSpriteEntity
} from '@svgaplus/proto/types'
import { IMAGE_LOAD_KEY } from '../config'
import { drawShape } from '../draw'
import { SVGAPlusRenderer } from '../models/renderer'
import { SVGAImageController } from '../modules/controller.image'
import { SvgaPlayController } from '../modules/controller.play'
import { EventBus } from '../modules/event-bus'
import { Ticker } from '../modules/ticker'
import { ISvgCommand } from '../svg/svg-command'
import { TypeUtils } from '../utils/type'

class VanillaRenderer implements SVGAPlusRenderer {
  private _canvas: HTMLCanvasElement = null
  private _context: CanvasRenderingContext2D = null

  private _movieEntity: IProtoMovieEntity = null
  private _imageController: SVGAImageController = null
  private _playController: SvgaPlayController = null

  private _ticker: Ticker = null
  private _eventBus: EventBus = null

  private _isDestroyed = false

  // This object keeps the shape that is used in last frame.
  // Some frames' type are "ShapeType.Keep". We'll get target shape from here when this kinda type of type was caught.
  private _lastShapeEntities: { [imageKey: string]: IProtoShapeEntity[] } = {}

  // SVG Command cache pool.
  // Cache key: `${imageKey}.${shapeIndex}.${frame}`
  private _svgCommandCache: { [commandKey: string]: ISvgCommand[] } = {}

  private _clearCanvas () {
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
  }

  private _initTicker (fps: number) {
    const ticker = new Ticker(fps)
    ticker.onTick(() => {
      const isTickingAllowed = !this._isDestroyed && this._playController.isInPlay
      if (isTickingAllowed) {
        this.tickFrame()
      }
    })
    this._ticker = ticker
  }

  startTick () {
    this._ticker.startTick()
  }

  stopTick () {
    this._ticker.stopTick()
  }

  tickFrame () {
    this._clearCanvas()
    const drawFrame = this._playController.frame
    const sprites = this._movieEntity.sprites
    for (const sprite of sprites) {
      if (!sprite) {
        continue
      }

      const image = this._imageController.getSpriteImage(sprite.imageKey)
      drawSprite(
        this._context,
        image, sprite, drawFrame,
        this._lastShapeEntities,
        this._svgCommandCache
      )
    }

    this._playController.setLastDrawFrame(drawFrame)
    this._eventBus.emit()
    this._playController.isReversing
      ? this._playController.stepIntoPrevFrame()
      : this._playController.stepIntoNextFrame()
  }

  destroy () {
    this._isDestroyed = true

    this._ticker.destroy()
    this._ticker = null
    this._eventBus = null

    this._canvas = null
    this._context = null

    this._movieEntity = null

    this._imageController = null
    this._playController = null

    this._lastShapeEntities = {}
    this._svgCommandCache = {}
  }

  constructor (param: {
    canvas: HTMLCanvasElement,
    movieEntity: IProtoMovieEntity,
    imageController: SVGAImageController,
    playController: SvgaPlayController,
    eventBus: EventBus,
    fps: number
  }) {
    this._canvas = param.canvas
    this._context = param.canvas.getContext('2d')
    this._movieEntity = param.movieEntity
    this._imageController = param.imageController
    this._playController = param.playController
    this._eventBus = param.eventBus

    this._initTicker(param.fps)
  }
}

export {
  VanillaRenderer
}

/**
 * Put sprite into canvas.
 * There would be two kinda sprites, image-based and svg-based.
 *
 * @param context
 * @param image
 * @param sprite
 * @param frameIndex
 * @param lastShapeEntities
 * @param svgCommandCache
 */
function drawSprite (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  sprite: IProtoSpriteEntity,
  frameIndex: number,
  lastShapeEntities: { [imageKey: string]: IProtoShapeEntity[] },
  svgCommandCache: { [commandKey: string]: ISvgCommand[] }
): void {
  const { frames, imageKey } = sprite
  const frame = frames[frameIndex]
  if (!frame) {
    return
  }

  const { alpha, transform, shapes, layout } = frame
  if (!layout) {
    return
  }

  context.save() // Save original transform setup.
  context.globalAlpha = alpha

  if (transform) {
    context.transform(
      transform.a,
      transform.b || 0,
      transform.c || 0,
      transform.d,
      transform.tx,
      transform.ty
    )
  }

  // Draw vector shape.
  if (Array.isArray(shapes)) {
    for (let index = 0, length = shapes.length; index < length; index++) {
      const shapeEntity = shapes[index]
      if (shapeEntity) {
        drawShape(
          context,
          shapeEntity,
          imageKey,
          index,
          lastShapeEntities,
          svgCommandCache,
          frameIndex
        )
      }
    }
  }

  // Draw image.
  const { width, height } = layout
  const x = layout.x || 0
  const y = layout.y || 0

  if (image && image[IMAGE_LOAD_KEY]) {
    TypeUtils.isNumber(width) && TypeUtils.isNumber(height)
      ? context.drawImage(image, x, y, width, height)
      : context.drawImage(image, x, y)
  }

  context.restore() // Restore transform to original.
}
