import { EventBus } from '../../src/core/modules/event-bus'

describe('EventBus testing.', () => {
  it('Simple on and emit should work.', async () => {
    const shouldBeThisNumber = 10
    const result = await new Promise(resolve => {
      const eventBus = new EventBus()
      const callback = value => resolve(value)
      eventBus.on(callback)
      eventBus.emit(shouldBeThisNumber)
    })
    expect(result).toEqual(shouldBeThisNumber)
  })

  it('off should work.', async () => {
    const shouldBeThisNumber = 10
    const fallbackValue = 11

    const result = await new Promise(resolve => {
      const eventBus = new EventBus()
      const callback = value => resolve(value)
      eventBus.on(callback)
      eventBus.off(callback)
      eventBus.emit(shouldBeThisNumber)
      setTimeout(() => resolve(fallbackValue), 1000)
    })

    expect(result).toEqual(fallbackValue)
  })

  it('destroy should work.', async () => {
    const shouldBeThisNumber = 10
    const fallbackValue = 11

    const result = await new Promise(resolve => {
      const eventBus = new EventBus()
      const callback = value => resolve(value)
      eventBus.on(callback)
      eventBus.destroy()
      eventBus.emit(shouldBeThisNumber)
      setTimeout(() => resolve(fallbackValue), 1000)
    })

    expect(result).toEqual(fallbackValue)
  })
})
