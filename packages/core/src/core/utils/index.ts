import { StringUtils } from './string'

abstract class SVGAUtils {
  static uint8ToString (uint8Array: Uint8Array): string {
    const CHUNK_SZ = 0x8000
    const c = []
    for (let i = 0, length = uint8Array.length; i < length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, uint8Array.subarray(i, i + CHUNK_SZ)))
    }
    return c.join('')
  }

  static createHexColor (r: number, g: number, b: number): string {
    if (r > 255) { r = 255 }
    if (g > 255) { g = 255 }
    if (b > 255) { b = 255 }
    if (r < 0) { r = 0 }
    if (g < 0) { g = 0 }
    if (b < 0) { b = 0 }

    return '#' +
      StringUtils.padStart(r.toString(16), 2, '0') +
      StringUtils.padStart(g.toString(16), 2, '0') +
      StringUtils.padStart(b.toString(16), 2, '0')
  }

  static createRgbColor (r: number, g: number, b: number): string {
    if (r > 255) { r = 255 }
    if (g > 255) { g = 255 }
    if (b > 255) { b = 255 }
    if (r < 0) { r = 0 }
    if (g < 0) { g = 0 }
    if (b < 0) { b = 0 }

    return `rgb(${r}, ${g}, ${b})`
  }

  static isIe (): boolean {
    return /(Trident|MSIE)/i.test(navigator.userAgent)
  }

  static isSupportPath2d (): boolean {
    // Edge browser does support Path2D, but it will throw a warning message says:
    // "2DCONTEXT20301: Attempt to construct Path2D from unsupported type. Empty path created".
    // There will be strange outlines when using Path2D in Safari, so just block it.
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    const isClassicEdge = /edge/i.test(navigator.userAgent)
    return typeof Path2D !== 'undefined' && !isSafari && !isClassicEdge
  }
}

export {
  SVGAUtils
}
