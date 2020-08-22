import { SVGAUtils } from '../../../src/core/utils'

describe('SVGAUtils testing.', () => {
  it('SVGAUtils.createHexColor', () => {
    expect(SVGAUtils.createHexColor(43, 116, 137)).toEqual('#2b7489')
    expect(SVGAUtils.createHexColor(-1, -2, -3)).toEqual('#000000')
    expect(SVGAUtils.createHexColor(300, 300, 300)).toEqual('#ffffff')
  })

  it('SVGAUtils.createRgbColor', () => {
    expect(SVGAUtils.createRgbColor(43, 116, 137)).toEqual('rgb(43, 116, 137)')
    expect(SVGAUtils.createRgbColor(-1, -2, -3)).toEqual('rgb(0, 0, 0)')
    expect(SVGAUtils.createRgbColor(300, 300, 300)).toEqual('rgb(255, 255, 255)')
  })
})
