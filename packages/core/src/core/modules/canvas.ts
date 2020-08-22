import { IProtoLineCap, IProtoLineJoin, IProtoShapeEntity } from '../models/proto'
import { SVGAUtils } from '../utils'

const IS_IE = SVGAUtils.isIe()

function setStrokeStyle (
  context: CanvasRenderingContext2D,
  shapeEntity: IProtoShapeEntity
) {
  const { styles } = shapeEntity
  if (!styles) {
    return
  }

  const { stroke, lineCap, lineJoin, strokeWidth, miterlimit } = styles

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
  const { styles } = shapeEntity
  if (!styles) {
    return
  }

  const { fill } = styles

  if (fill) {
    // When decode movieEntity in worker, some color maybe lost sometime.
    // Give it a fallback value "0" seems to fix this wired issue.
    const r = Math.round((fill.r || 0) * 255)
    const g = Math.round((fill.g || 0) * 255)
    const b = Math.round((fill.b || 0) * 255)
    context.fillStyle = IS_IE
      ? SVGAUtils.createRgbColor(r, g, b)  // IE only recognise rgb color.
      : SVGAUtils.createHexColor(r, g, b)  // Fucking safari only use hex color so give everything else a hex just.
    context.globalAlpha = context.globalAlpha * (fill.a || 0)
  }
}

export {
  setStrokeStyle,
  setFillStyle
}
