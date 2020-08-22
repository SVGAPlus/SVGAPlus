import { Ticker } from '../../src/core/modules/ticker'

describe('Ticker testing.', () => {
  it('Ticker should work.', async () => {
    const shouldBeThis = 10
    const result = await new Promise(resolve => {
      let count = 0
      const ticker = new Ticker()
      ticker.onTick(() => {
        if (count < shouldBeThis) {
          count++
        } else {
          ticker.stopTick()
          resolve(count)
        }
      })
      ticker.startTick()
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    expect(result).toEqual(shouldBeThis)
  })
})
