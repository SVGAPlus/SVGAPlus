export interface IProtoMovieParams {
  fps: number
  frames: number
  viewBoxHeight: number
  viewBoxWidth: number
}

export interface IProtoLayout {
  x: number
  y: number
  width: number
  height: number
}

export enum IProtoShapeType {
  Shape = 0,    // 路径.
  Rect = 1,     // 矩形.
  Ellipse = 2,  // 圆形.
  Keep = 3      // 与前一帧一致.
}

export enum IProtoLineCap {
  Butt = 0,
  Round = 1,
  Square = 2
}

export enum IProtoLineJoin {
  Miter = 0,
  Round = 1,
  Bevel = 2
}

export interface IProtoShapeEntity {
  args: string
  type: IProtoShapeType

  shape?: {
    d: string  // SVG 路径.
  }

  ellipse?: {
    x: number
    y: number
    radiusX: number
    radiusY: number
  }

  rect?: {
    x: number
    y: number
    width: number
    height: number
    cornerRadius: number  // 圆角.
  }

  styles: {
    fill: {
      r: number
      g: number
      b: number
      a: number
    }
    lineCap: IProtoLineCap
    lineJoin: IProtoLineJoin
    lineDashI: number
    lineDashII: number
    lineDashIII: number
    miterlimit: number
    stroke: {
      r: number
      g: number
      b: number
      a: number
    }
    strokeWidth: number
  }

  transform: {
    a: number
    b: number
    c: number
    d: number
    tx: number
    ty: number
  }
}

export interface IProtoTransform {
  a: number
  b?: number
  c?: number
  d: number
  tx: number
  ty: number
}

export interface IProtoFrameEntity {
  alpha: number
  layout: IProtoLayout
  shapes: IProtoShapeEntity[]
  transform: IProtoTransform
}

export interface IProtoSpriteEntity {
  imageKey: string
  frames: IProtoFrameEntity[]
}

export interface IProtoMovieEntity {
  audios: unknown[]
  images: {[key: string]: Uint8Array}
  params: IProtoMovieParams
  sprites: IProtoSpriteEntity[]
  version: number
}
