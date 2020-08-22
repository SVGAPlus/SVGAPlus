import { StringUtils } from '../../../src/core/utils/string'

describe('StringUtils testing.', () => {
  it('padStart testing.', () => {
    // Normal.
    expect(StringUtils.padStart('L', 2, '0')).toEqual('0L')
    expect(StringUtils.padStart('1', 4, '0')).toEqual('0001')

    // Empty.
    expect(StringUtils.padStart('', 10, 'a')).toEqual('aaaaaaaaaa')

    // Short length.
    expect(StringUtils.padStart('L', 0, '0')).toEqual('L')
    expect(StringUtils.padStart('L', 1, '0')).toEqual('L')

    // Empty padString should be replaced by white space.
    expect(StringUtils.padStart('L', 2, '')).toEqual(' L')
  })
})
