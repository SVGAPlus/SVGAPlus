const getElement = (selector: string): HTMLElement => {
  return document.querySelector(selector)!
}

export {
  getElement
}
