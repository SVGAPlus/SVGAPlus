import { IProtoLineCap, IProtoLineJoin, IProtoShapeType } from '../../../src/proto/models'

describe('proto testing.', () => {
  it('IProtoShapeType must be correct.', () => {
    expect(IProtoShapeType.Shape).toEqual(0)
    expect(IProtoShapeType.Rect).toEqual(1)
    expect(IProtoShapeType.Ellipse).toEqual(2)
    expect(IProtoShapeType.Keep).toEqual(3)
  })

  it('IProtoLineCap must be correct.', () => {
    expect(IProtoLineCap.Butt).toEqual(0)
    expect(IProtoLineCap.Round).toEqual(1)
    expect(IProtoLineCap.Square).toEqual(2)
  })

  it('IProtoLineJoin must be correct.', () => {
    expect(IProtoLineJoin.Miter).toEqual(0)
    expect(IProtoLineJoin.Round).toEqual(1)
    expect(IProtoLineJoin.Bevel).toEqual(2)
  })
})
