class EventBus {
  private callbacks: Callback[] = []

  on (callback: Callback) {
    if (this.callbacks.indexOf(callback) < 0) {
      this.callbacks.push(callback)
    }
  }

  off (callback: Callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  emit (...value: any[]) {
    this.callbacks.forEach(func => func(...value))
  }

  destroy () {
    this.callbacks = []
  }
}

export {
  EventBus
}

type Callback = (...args: any[]) => void
