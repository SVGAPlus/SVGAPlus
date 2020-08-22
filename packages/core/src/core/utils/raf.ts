const raf = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  function (callback: any) {
    return setTimeout(() => typeof callback === 'function' && callback())
  }

const caf = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  function (id: any) {
    return clearTimeout(id)
  }

export {
  raf,
  caf
}
