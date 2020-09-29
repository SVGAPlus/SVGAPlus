import { IProtoLineCap, IProtoLineJoin, IProtoShapeEntity, IProtoShapeType } from '../../proto/models'
import { ISvgCommand, svgPathToCommands } from '../svg/svg-command'
import { SVGAUtils } from '../utils'

const IS_SUPPORT_PATH_2D = SVGAUtils.isSupportPath2d()
const IS_IE = SVGAUtils.isIe()

/**
 * Draw Shape on canvas.
 *
 * @param context
 * @param shapeEntity
 * @param imageKey
 * @param index
 * @param lastShapeEntities
 * @param svgCommandCache
 * @param frameIndex
 */
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

/**
 * Draw SVG on canvas.
 *
 * @param context
 * @param shapeEntity
 * @param svgCommands
 * @param doFill
 * @param doStroke
 */
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

/**
 * Draw ellipse on canvas.
 *
 * @param context
 * @param shape
 */
function drawEllipse (
  context: CanvasRenderingContext2D,
  shape: IProtoShapeEntity
) {
  const ellipse = shape.ellipse
  if (!ellipse) {
    return
  }

  const x = ellipse.x - ellipse.radiusX
  const y = ellipse.y - ellipse.radiusY
  const w = ellipse.radiusX * 2
  const h = ellipse.radiusY * 2

  const kappa = 0.5522848

  const ox = (w / 2) * kappa
  const oy = (h / 2) * kappa

  const xe = x + w
  const ye = y + h

  const xm = x + w / 2
  const ym = y + h / 2

  context.beginPath()
  context.moveTo(x, ym)
  context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
  context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
  context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
  context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)

  if (shape.styles?.fill) {
    context.fill()
  } else if (shape.styles.stroke) {
    context.stroke()
  }
}

function setStrokeStyle (
  context: CanvasRenderingContext2D,
  shapeEntity: IProtoShapeEntity
) {
  const { styles } = shapeEntity
  if (!styles) {
    return
  }

  const {
    stroke, lineCap, lineJoin, strokeWidth, miterlimit,
    lineDashI: lineDash,
    lineDashII: lineDashGap,
    lineDashIII: lineDashOffset
  } = styles

  const lineDashArgs: number[] = []
  if (lineDash > 0) {
    lineDashArgs.push(lineDash)
  }

  if (lineDashGap > 0) {
    if (!lineDashArgs.length) {
      lineDashArgs.push(0)
    }
    lineDashArgs.push(lineDashGap)
    lineDashArgs.push(0)
  }

  if (lineDashOffset > 0) {
    if (lineDashArgs.length < 2) {
      lineDashArgs.push(0)
      lineDashArgs.push(0)
    }
    lineDash[2] = lineDashOffset
  }

  lineDashArgs.length === 3 && context.setLineDash(lineDashArgs)

  switch (lineCap) {
    case IProtoLineCap.Butt:
      context.lineCap = 'butt'
      break

    case IProtoLineCap.Round:
      context.lineCap = 'round'
      break

    case IProtoLineCap.Square:
      context.lineCap = 'square'
      break
  }

  switch (lineJoin) {
    case IProtoLineJoin.Bevel:
      context.lineJoin = 'bevel'
      break

    case IProtoLineJoin.Miter:
      context.lineJoin = 'miter'
      break

    case IProtoLineJoin.Round:
      context.lineJoin = 'round'
      break
  }

  context.lineWidth = strokeWidth
  context.miterLimit = miterlimit

  if (stroke) {
    const r = Math.round((stroke.r || 0) * 255)
    const g = Math.round((stroke.g || 0) * 255)
    const b = Math.round((stroke.b || 0) * 255)
    context.strokeStyle = IS_IE
      ? SVGAUtils.createRgbColor(r, g, b)
      : SVGAUtils.createHexColor(r, g, b)
    context.globalAlpha = context.globalAlpha * (stroke.a || 0)
  }
}

function setFillStyle (
  context: CanvasRenderingContext2D,
  shapeEntity: IProtoShapeEntity
) {
  const fill = shapeEntity.styles?.fill
  if (fill) {
    // Some of these color value would be lost when decoding movieEntity in worker.
    // It seems like giving it a fallback value "0" would fix this wired issue.
    const r = Math.round((fill.r || 0) * 255)
    const g = Math.round((fill.g || 0) * 255)
    const b = Math.round((fill.b || 0) * 255)
    context.fillStyle = IS_IE
      ? SVGAUtils.createRgbColor(r, g, b)  // IE only recognise rgb color.
      : SVGAUtils.createHexColor(r, g, b)  // Fucking safari only uses hex color so just give the other browsers a hex.
    context.globalAlpha = context.globalAlpha * (fill.a || 0)
  }
}

export {
  drawShape,
  drawSvg,
  drawEllipse,
  setFillStyle,
  setStrokeStyle
}
