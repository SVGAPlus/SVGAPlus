abstract class Logger {
  static info (...args) {
    try {
      console.log('[SVGAPlus]', ...args)
    } catch (error) {
      // ...
    }
  }

  static warn (...args) {
    try {
      console.warn('[SVGAPlus]', ...args)
    } catch (error) {
      // ...
    }
  }

  static error (...args) {
    try {
      console.error('[SVGAPlus]', ...args)
    } catch (error) {
      // ...
    }
  }
}

export {
  Logger
}
