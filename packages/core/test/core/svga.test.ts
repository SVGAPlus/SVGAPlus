import { readFileSync } from 'fs'
import { resolve } from 'path'
import { SVGAPlus } from '../../src'

describe('SVGAPlus testing.', function () {
  it('SVG-based svga testing.', async () => {
    const svga = new SVGAPlus({
      element: document.createElement('canvas'),
      buffer: readFileSync(resolve(__dirname, '../assets/hex.svga'))
    })

    await svga.init()

    expect(svga.frameCount).toEqual(12)
    expect(svga.viewportWidth).toEqual(770)
    expect(svga.viewportHeight).toEqual(770)

    // Play once.
    await svga.playOnce(0, 5)
    expect(svga.frame).toEqual(6)  // Should stop at 6.

    // Seek.
    svga.seek(5)
    expect(svga.frame).toEqual(5)
  })

  it('Bitmap-based svga testing.', async () => {
    const svga = new SVGAPlus({
      element: document.createElement('canvas'),
      buffer: readFileSync(resolve(__dirname, '../assets/22.svga'))
    })

    await svga.init()

    // Play once.
    await svga.playOnce(0, svga.frameCount - 1)
    expect(svga.frame).toEqual(0)  // Should stop at 0.
  })
})
