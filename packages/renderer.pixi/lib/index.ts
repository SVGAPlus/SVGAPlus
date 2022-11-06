/*!
 * SVGAPlusPixiRenderer - Pixi Renderer for SVGAPlus.
 * @ LancerComet | # Carry Your World #
 * License: MIT
 */
import {
  IProtoFrameEntity,
  IProtoMovieEntity,
  IProtoShapeEntity,
  IProtoShapeType,
  IProtoTransform
} from '@svgaplus/proto/types'
import { BaseTexture, Container, Texture, Sprite, Application, Matrix } from 'pixi.js'

import { drawEllipse, drawSvg, setFillStyle, setStrokeStyle } from '../../core/src/core/draw'
import {
  ISVGAPlusRendererParam,
  ISVGAPlusRendererTickFrameParam,
  SVGAPlusRenderer
} from '../../core/src/core/models/renderer'
import { SVGAImageController } from '../../core/src/core/modules/controller.image'
import { SvgaPlayController } from '../../core/src/core/modules/controller.play'
import { EventBus } from '../../core/src/core/modules/event-bus'
import { svgPathToCommands, ISvgCommand } from '../../core/src/core/svg/svg-command'
import { SVGAUtils } from '../../core/src/core/utils'
import { raf } from '../../core/src/core/utils/raf'
import { TypeUtils } from '../../core/src/core/utils/type'

const IS_SUPPORT_PATH_2D = SVGAUtils.isSupportPath2d()

class PixiRenderer implements SVGAPlusRenderer {
  private _canvas: HTMLCanvasElement = null
  private _movieEntity: IProtoMovieEntity = null
  private _imageController: SVGAImageController = null
  private _playController: SvgaPlayController = null
  private _eventBus: EventBus = null
  private _fps = 0
  private _childrenMap = new Map()
  private _isDestroyed = false

  private _pixiApp: Application = null
  private _pixiContainer: Container = null

  get pixiApp (): Application {
    return this._pixiApp
  }

  get pixiContainer (): Container {
    return this._pixiContainer
  }

  // This object keeps the shape that was used in last frame.
  // Some frames' type are "ShapeType.Keep", and we're about to get the shape from here.
  private _lastShapes: { [imageKey: string]: IProtoShapeEntity[] } = {}

  // SVG Command cache pool.
  // Cache key: `${imageKey}.${shapeIndex}.${frame}`
  private _svgCommandCache: { [commandKey: string]: ISvgCommand[] } = {}

  private _drawBitmapSprite (
    frame: IProtoFrameEntity,
    spriteIndex: number
  ) {
    const { transform, alpha, layout } = frame
    const spritePixi = this._childrenMap.get(spriteIndex.toString())

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
      spritePixi.transform.setFromMatrix(new Matrix(
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

    const pixiSprite = new Sprite(
      new Texture(
        new BaseTexture(canvas, {
          width: canvas.width,
          height: canvas.height
        })
      )
    )
    this._pixiContainer.addChild(pixiSprite)
    this._childrenMap.set(pixiSprite.name, pixiSprite)
    this._pixiApp.render() // render function must be called.

    // Destroy sprite in next tick in case of OOM.
    raf(() => {
      this._childrenMap.delete(pixiSprite.name)
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
    const app = new Application({
      width: this._canvas.width,
      height: this._canvas.height,
      view: this._canvas,
      backgroundAlpha: 0
    })

    app.ticker.maxFPS = this._fps
    app.ticker.add(() => this.tickFrame())
    this._pixiApp = app

    const container = new Container()
    app.stage.addChild(container)
    this._pixiContainer = container

    const loadingImageKey: Record<string, 1> = {}
    const loadedTextures: Record<string, Texture> = {}
    const loadQueue: Promise<void>[] = []

    // Add sprite image into pixi.
    for (const sprite of this._movieEntity.sprites) {
      const { imageKey } = sprite

      // There would be two kinda situations:
      // 1. You will receive a HTMLImageElement with a valid src prop,
      //    but perhaps it could be loading.
      // 2. No bitmap image received, because it is a SVG.
      //    All svg path are stored in every single frame.
      const spriteImage = this._imageController.getSpriteImage(imageKey)
      const isAlreadyAdded = loadingImageKey[imageKey]
      if (spriteImage && !isAlreadyAdded) {
        const imageSrc = spriteImage.src
        loadQueue.push(
          Texture.fromURL(imageSrc).then(texture => {
            loadedTextures[imageKey] = texture
          })
        )
        loadingImageKey[imageKey] = 1 // Just to indicate this image is being loaded.
      }
    }

    // Create pixi sprites for every single SVGA sprite.
    Promise.all(loadQueue).then(() => {
      for (let i = 0, length = this._movieEntity.sprites.length; i < length; i++) {
        const spriteSvga = this._movieEntity.sprites[i]
        const { imageKey } = spriteSvga

        const texture = loadedTextures[imageKey]
        if (texture) {
          const spritePixi = new Sprite(texture)
          spritePixi.name = i.toString()
          container.addChild(spritePixi)
          this._childrenMap.set(spritePixi.name, spritePixi)
        } else {
          // console.log('[SVGAPlus] This is a vector sprite:', spriteSvga)
        }
      }
      this.tickFrame({ forceTick: true }) // This is used for drawing first frame.
    }).catch(error => {
      console.error('[SVGAPlus] Failed to load sprites:', error)
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

  constructor (param: ISVGAPlusRendererParam) {
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
