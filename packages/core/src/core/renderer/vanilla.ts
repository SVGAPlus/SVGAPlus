import { IMAGE_LOAD_KEY } from '../config'
import {
  IProtoMovieEntity,
  IProtoShapeEntity,
  IProtoShapeType,
  IProtoSpriteEntity
} from '../models/proto'
import { SVGAPlusRenderer } from '../models/renderer'
import { ISvgCommand } from '../models/svg'
import { setFillStyle, setStrokeStyle } from '../modules/canvas'
import { SVGAImageController } from '../modules/controller.image'
import { SvgaPlayController } from '../modules/controller.play'
import { EventBus } from '../modules/event-bus'
import { svgPathToCommands } from '../modules/svg'
import { Ticker } from '../modules/ticker'
import { SVGAUtils } from '../utils'
import { TypeUtils } from '../utils/type'

const IS_SUPPORT_PATH_2D = SVGAUtils.isSupportPath2d()

class VanillaRenderer implements SVGAPlusRenderer {
  private _canvas: HTMLCanvasElement = null
  private _context: CanvasRenderingContext2D = null

  private _movieEntity: IProtoMovieEntity = null
  private _imageController: SVGAImageController = null
  private _playController: SvgaPlayController = null

  private _ticker: Ticker = null
  private _eventBus: EventBus = null

  private _isDestroyed: boolean = false

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
  image: HTMLImageElement,
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

  context.save()  // Save original transform setup.
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

  // tslint:disable-next-line:no-string-literal
  if (image && image[IMAGE_LOAD_KEY]) {
    TypeUtils.isNumber(width) && TypeUtils.isNumber(height)
      ? context.drawImage(image, x, y, width, height)
      : context.drawImage(image, x, y)
  }

  context.restore()  // Restore transform to original.
}

function drawShape (
  context: CanvasRenderingContext2D,
  shapeEntity: IProtoShapeEntity,
  imageKey: string,
  index: number,
  lastShapeEntities: { [imageKey: string]: IProtoShapeEntity[] },
  svgCommandCache: { [commandKey: string]: ISvgCommand[] },
  frameIndex: number
) {
  if (!lastShapeEntities[imageKey]) {
    lastShapeEntities[imageKey] = []
  }

  context.save()

  let drawingType: IProtoShapeType = shapeEntity.type
  let drawingShape: IProtoShapeEntity = shapeEntity

  const isUseLastShape = drawingType === IProtoShapeType.Keep
  const lastShape = lastShapeEntities[imageKey][index]

  if (isUseLastShape && lastShape) {
    drawingShape = lastShapeEntities[imageKey][index]
    drawingType = lastShape.type
  }

  // Apply shape transform.
  const shapeTransform = drawingShape.transform
  if (shapeTransform) {
    context.transform(
      shapeTransform.a, shapeTransform.b, shapeTransform.c, shapeTransform.d,
      shapeTransform.tx, shapeTransform.ty
    )
  }

  switch (drawingType) {
    case IProtoShapeType.Ellipse: {
      if (typeof context.ellipse === 'function') {
        setStrokeStyle(context, drawingShape)
        setFillStyle(context, drawingShape)

        const { ellipse } = drawingShape
        context.ellipse(ellipse.x, ellipse.y, ellipse.radiusX, ellipse.y, 0, 0, 0)
      }
      break
    }

    case IProtoShapeType.Rect: {
      const { rect } = drawingShape

      setStrokeStyle(context, drawingShape)
      context.strokeRect(rect.x, rect.y, rect.width, rect.height)

      setFillStyle(context, drawingShape)
      context.fillRect(rect.x, rect.y, rect.width, rect.height)
      break
    }

    case IProtoShapeType.Shape: {
      const { shape, styles } = drawingShape
      if (!shape) {
        break
      }

      const d = shape.d
      if (typeof d === 'string' && d) {
        if (IS_SUPPORT_PATH_2D) {
          const path = new Path2D(d)
          setStrokeStyle(context, drawingShape)
          context.stroke(path)
          setFillStyle(context, drawingShape)
          context.fill(path, 'evenodd')
        } else {
          const cacheKey = `${imageKey}.${index}.${frameIndex}`
          let svgCommands = svgCommandCache[cacheKey]
          if (!svgCommands) {
            svgCommands = svgPathToCommands(d)
            svgCommandCache[cacheKey] = svgCommands
          }

          const doFill = !!styles && !!styles.fill
          const doStroke = !!styles && !!styles.stroke
          drawSvg(context, drawingShape, svgCommands, doFill, doStroke)
        }
      }
      break
    }
  }

  lastShapeEntities[imageKey][index] = drawingShape
  context.restore()
}

function drawSvg (
  context: CanvasRenderingContext2D,
  shapeEntity: IProtoShapeEntity,
  svgCommands: ISvgCommand[],
  doFill: boolean,
  doStroke: boolean
) {
  context.save()
  context.beginPath()
  let lastPosition = [0, 0]
  let pointOne = [0, 0]
  let pointTwo = [0, 0]
  for (const command of svgCommands) {
    const marker = command.marker
    switch (marker) {
      case 'z':
      case 'Z':
        lastPosition = [0, 0]
        context.closePath()
        break

      case 'm':
        lastPosition = [lastPosition[0] + command.values[0], lastPosition[1] + command.values[1]]
        context.moveTo(lastPosition[0], lastPosition[1])
        break

      case 'M':
        lastPosition = [command.values[0], command.values[1]]
        context.moveTo(lastPosition[0], lastPosition[1])
        break

      case 'l':
        lastPosition = [lastPosition[0] + command.values[0], lastPosition[1] + command.values[1]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'L':
        lastPosition = [command.values[0], command.values[1]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'h':
        lastPosition = [lastPosition[0] + command.values[0], lastPosition[1]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'H':
        lastPosition = [command.values[0], lastPosition[1]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'v':
        lastPosition = [lastPosition[0], lastPosition[1] + command.values[0]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'V':
        lastPosition = [lastPosition[0], command.values[0]]
        context.lineTo(lastPosition[0], lastPosition[1])
        break

      case 'c':
        pointOne = [lastPosition[0] + command.values[0], lastPosition[1] + command.values[1]]
        pointTwo = [lastPosition[0] + command.values[2], lastPosition[1] + command.values[3]]
        lastPosition = [lastPosition[0] + command.values[4], lastPosition[1] + command.values[5]]
        context.bezierCurveTo(
          pointOne[0], pointOne[1],
          pointTwo[0], pointTwo[1],
          lastPosition[0], lastPosition[1]
        )
        break

      case 'C':
        pointOne = [command.values[0], command.values[1]]
        pointTwo = [command.values[2], command.values[3]]
        lastPosition = [command.values[4], command.values[5]]
        context.bezierCurveTo(
          pointOne[0], pointOne[1],
          pointTwo[0], pointTwo[1],
          lastPosition[0], lastPosition[1]
        )
        break
    }
  }

  if (doFill) {
    setFillStyle(context, shapeEntity)
    context.fill()
  }

  if (doStroke) {
    setStrokeStyle(context, shapeEntity)
    context.stroke()
  }

  context.restore()
}
