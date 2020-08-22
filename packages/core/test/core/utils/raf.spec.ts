import { caf, raf } from '../../../src/core/utils/raf'

describe('Raf testing.', () => {
  it('raf should work.', async () => {
    const result = await new Promise(resolve => {
      raf(() => resolve(10))
    })
    expect(result).toEqual(10)
  })

  it('raf should return an id.', () => {
    const id = raf(() => null)
    expect(typeof id).toEqual('number')
  })

  it('caf should work.', async () => {
    let count = 0
    const id = raf(() => count++)
    caf(id)
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    expect(count).toEqual(0)
  })
})
