declare class EventBus {
  on (callback: Callback): void
  off (callback: Callback): void
  emit (...value: any): void
  destroy (): void
}

export {
  EventBus
}

type Callback = (...args: any[]) => void
