import { readFileSync } from 'fs'
import { resolve } from 'path'
import { SVGAParser } from '../../src'

describe('SVGAParser test.', () => {
  it('Should parse SVGA file correctly.', async () => {
    const buffer = readFileSync(resolve(__dirname, '../assets/hex.svga'))
    const svga = await SVGAParser.parse(buffer)
    expect(svga.audios.length).toEqual(0)
    expect(Object.keys(svga.images).length).toEqual(14)
    expect(svga.params).toEqual({
      viewBoxWidth: 770,
      viewBoxHeight: 770,
      fps: 20,
      frames: 12
    })
    expect(svga.sprites.length).toEqual(15)
    expect(svga.version).toEqual('2.1.0')
  })
})
