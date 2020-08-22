declare module 'worker-loader*' {
  class WebpackWorker extends Worker {
    constructor ()
  }
  export default WebpackWorker
}

declare module '*.json' {
  const content: any
  export default content
}
