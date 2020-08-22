import { TypeUtils } from '../../../src/core/utils/type'

describe('TypeUtils testing.', () => {
  it('isNumber should work.', () => {
    expect(TypeUtils.isNumber(10)).toEqual(true)
    expect(TypeUtils.isNumber('10')).toEqual(false)
    expect(TypeUtils.isNumber(null)).toEqual(false)
    expect(TypeUtils.isNumber(undefined)).toEqual(false)
    expect(TypeUtils.isNumber(() => 10)).toEqual(false)
    expect(TypeUtils.isNumber([])).toEqual(false)
    expect(TypeUtils.isNumber({})).toEqual(false)
    expect(TypeUtils.isNumber(true)).toEqual(false)
  })

  it('isBoolean should work.', () => {
    expect(TypeUtils.isBoolean(true)).toEqual(true)
    expect(TypeUtils.isBoolean(false)).toEqual(true)
    expect(TypeUtils.isBoolean(1)).toEqual(false)
    expect(TypeUtils.isBoolean(undefined)).toEqual(false)
    expect(TypeUtils.isBoolean(null)).toEqual(false)
    expect(TypeUtils.isBoolean([])).toEqual(false)
    expect(TypeUtils.isBoolean({})).toEqual(false)
    expect(TypeUtils.isBoolean(() => false)).toEqual(false)
  })
})
