abstract class TypeUtils {
  static isNumber (target: any): boolean {
    return typeof target === 'number'
  }

  static isBoolean (target: any): boolean {
    return typeof target === 'boolean'
  }

  static isFunction (target: any): boolean {
    return typeof target === 'function'
  }
}

export {
  TypeUtils
}
