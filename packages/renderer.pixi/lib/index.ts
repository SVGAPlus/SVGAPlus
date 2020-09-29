import * as PIXI from 'pixi.js'
import { BaseTexture, Container, Texture } from 'pixi.js'

import { drawEllipse, drawSvg } from '../../core/src/core/draw'
import { ISVGAPlusRendererTickFrameParam } from '../../core/src/core/models/renderer'
import { SVGAPlusRenderer } from '../../core/src/core/models/renderer'
import { setFillStyle, setStrokeStyle } from '../../core/src/core/modules/canvas'
import { SVGAImageController } from '../../core/src/core/modules/controller.image'
import { SvgaPlayController } from '../../core/src/core/modules/controller.play'
import { EventBus } from '../../core/src/core/modules/event-bus'
import { svgPathToCommands } from '../../core/src/core/svg/svg-command'
import { ISvgCommand } from '../../core/src/core/svg/svg-command'
import { SVGAUtils } from '../../core/src/core/utils'
import { raf } from '../../core/src/core/utils/raf'
import { TypeUtils } from '../../core/src/core/utils/type'
import {
  IProtoFrameEntity,
  IProtoMovieEntity,
  IProtoShapeEntity,
  IProtoShapeType,
  IProtoTransform
} from '../../core/src/proto/models'

const IS_SUPPORT_PATH_2D = SVGAUtils.isSupportPath2d()

class PixiRenderer implements SVGAPlusRenderer {
  private _canvas: HTMLCanvasElement = null
  private _movieEntity: IProtoMovieEntity = null
  private _imageController: SVGAImageController = null
  private _playController: SvgaPlayController = null
  private _eventBus: EventBus = null
  private _fps: number = 0

  private _pixiApp: PIXI.Application = null
  private _pixiContainer: PIXI.Container = null

  get pixiApp (): PIXI.Application {
    return this._pixiApp
  }

  get pixiContainer (): PIXI.Container {
    return this._pixiContainer
  }

  private _isDestroyed: boolean = false

  // This object keeps the shape that is used in last frame.
  // Some frames' type are "ShapeType.Keep". We'll get target shape from here when this kinda type of type was caught.
  private _lastShapes: { [imageKey: string]: IProtoShapeEntity[] } = {}

  // SVG Command cache pool.
  // Cache key: `${imageKey}.${shapeIndex}.${frame}`
  private _svgCommandCache: { [commandKey: string]: ISvgCommand[] } = {}

  private _drawBitmapSprite (
    frame: IProtoFrameEntity,
    spriteIndex: number
  ) {
    const { transform, alpha, layout } = frame
    const container = this._pixiContainer
    const spritePixi = container.children
      .find(item => item.name === spriteIndex.toString())

    if (!spritePixi) {
      return
    }

    if (TypeUtils.isNumber(alpha)) {
      spritePixi.alpha = alpha
    }

    if (layout) {
      spritePixi.transform.position.set(layout.x || 0, layout.y || 0)
    }

    if (transform) {
      spritePixi.transform.setFromMatrix(new PIXI.Matrix(
        transform.a, transform.b || 0, transform.c || 0, transform.d, transform.tx, transform.ty
      ))
    }
  }

  private _drawVectorSprite (
    shapeEntity: IProtoShapeEntity,
    imageKey: string,
    shapeIndex: number,
    frameIndex: number,
    transform: IProtoTransform,
    alpha: number
  ) {
    if (!this._lastShapes[imageKey]) {
      this._lastShapes[imageKey] = []
    }

    let drawingType = shapeEntity.type
    let drawingShape: IProtoShapeEntity = shapeEntity

    const isUseLastShape = drawingType === IProtoShapeType.Keep
    const lastShape = this._lastShapes[imageKey][shapeIndex]
    if (isUseLastShape && lastShape) {
      drawingType = lastShape.type
      drawingShape = lastShape
    }

    // Convert svg to bitmap.
    const canvas = document.createElement('canvas')
    canvas.width = this._canvas.width
    canvas.height = this._canvas.height

    const context = canvas.getContext('2d')
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
          drawEllipse(context, shapeEntity)
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
            const svgCommandCache = this._svgCommandCache
            const cacheKey = `${imageKey}.${shapeIndex}.${frameIndex}`
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

    const pixiSprite = new PIXI.Sprite(
      new Texture(
        new BaseTexture(canvas, {
          width: canvas.width,
          height: canvas.height
        })
      )
    )
    this._pixiContainer.addChild(pixiSprite)
    this._pixiApp.render()  // render function must be called.

    // Destroy sprite in next tick in case of OOM.
    raf(() => {
      this._pixiContainer.removeChild(pixiSprite)
      pixiSprite.destroy({
        children: true, baseTexture: true, texture: true
      })
    })

    this._lastShapes[imageKey][shapeIndex] = drawingShape
  }

  tickFrame (param: ISVGAPlusRendererTickFrameParam = {}) {
    const { isInPlay, frame: frameIndex } = this._playController
    const forceTick = param.forceTick === true

    const isTickingAllowed = !this._isDestroyed && (isInPlay || forceTick)
    if (!isTickingAllowed) {
      return
    }

    for (let i = 0, length = this._movieEntity.sprites.length; i < length; i++) {
      const spriteSvga = this._movieEntity.sprites[i]
      const frame = spriteSvga.frames[frameIndex]

      // Deal with vector sprites.
      if (Array.isArray(frame.shapes)) {
        for (
          let shapeIndex = 0, shapeLength = frame.shapes.length;
          shapeIndex < shapeLength;
          shapeIndex++
        ) {
          const shape = frame.shapes[shapeIndex]
          this._drawVectorSprite(
            shape,
            spriteSvga.imageKey,
            shapeIndex,
            frameIndex,
            frame.transform,
            frame.alpha
          )
        }
      }

      // Deal with bitmap sprites.
      this._drawBitmapSprite(frame, i)
    }

    this._playController.setLastDrawFrame(frameIndex)
    this._eventBus.emit()
    this._playController.isReversing
      ? this._playController.stepIntoPrevFrame()
      : this._playController.stepIntoNextFrame()

    // If "forceTick = true" && ticker is stopped,
    // we need to render manually for once.
    const isTickerStarted = this._pixiApp.ticker.started
    const doRenderManually = !isTickerStarted && forceTick
    if (doRenderManually) {
      this._pixiApp.render()
    }
  }

  private _initPixi () {
    const app = new PIXI.Application({
      width: this._canvas.width,
      height: this._canvas.height,
      view: this._canvas,
      transparent: true
    })

    app.ticker.maxFPS = this._fps
    app.ticker.add(() => this.tickFrame())
    this._pixiApp = app

    const container = new Container()
    app.stage.addChild(container)
    this._pixiContainer = container

    // Add sprite image into pixi.
    for (const sprite of this._movieEntity.sprites) {
      const { imageKey } = sprite

      // There would be two kinda situations:
      // 1. You will receive a HTMLImageElement with a valid src prop,
      //    But maybe it would be in load.
      // 2. No image received, because it is a SVG.
      //    All svg path are stored in every single frame.
      const spriteImage = this._imageController.getSpriteImage(imageKey)
      const isAlreadyAdded = !!app.loader.resources[imageKey]
      if (spriteImage && !isAlreadyAdded) {
        app.loader.add(imageKey, spriteImage.src)
      }
    }

    app.loader.load((loader, resources) => {
      // Create pixi sprites for every single SVGA sprite.
      for (let i = 0, length = this._movieEntity.sprites.length; i < length; i++) {
        const spriteSvga = this._movieEntity.sprites[i]
        const { imageKey } = spriteSvga

        if (resources[imageKey]) {
          const spritePixi = new PIXI.Sprite(resources[imageKey].texture)
          spritePixi.name = i.toString()
          container.addChild(spritePixi)
        } else {
          // console.log('[SVGAPlus] This is a vector sprite:', spriteSvga)
        }
      }

      this.tickFrame({ forceTick: true })  // This is used for drawing first frame.
    })
  }

  startTick () {
    this._pixiApp.start()
  }

  stopTick () {
    this._pixiApp.stop()
  }

  destroy () {
    this._isDestroyed = true

    this._canvas = null
    this._movieEntity = null
    this._imageController = null
    this._playController = null
    this._fps = 0

    this._pixiApp.destroy(false, {
      children: true, baseTexture: true, texture: true
    })
    this._pixiApp = null

    this._pixiContainer.destroy({
      children: true, baseTexture: true, texture: true
    })
    this._pixiContainer = null

    this._isDestroyed = false
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
    this._movieEntity = param.movieEntity
    this._imageController = param.imageController
    this._playController = param.playController
    this._eventBus = param.eventBus
    this._fps = param.fps
    this._initPixi()
  }
}

export {
  PixiRenderer
}
