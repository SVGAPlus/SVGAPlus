abstract class StringUtils {
  static padStart (str: string, targetLength: number, padString: string) {
    // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    targetLength = targetLength >> 0 // floor if number or convert non-number to 0;

    if (padString === null || typeof padString === 'undefined' || padString === '') {
      padString = ' '
    } else {
      padString = String(padString)
    }

    if (str.length > targetLength) {
      return String(str)
    } else {
      targetLength = targetLength - str.length
      if (targetLength > padString.length) {
        // append to original to ensure we are longer than needed
        padString += padString.repeat(targetLength / padString.length)
      }
      return padString.slice(0, targetLength) + String(str)
    }
  }
}

export {
  StringUtils
}
