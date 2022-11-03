import { PixiRenderer } from '@svgaplus/renderer.pixi'
import { SVGAPlus } from '@svgaplus/core'
import {getElement} from "../../utils";

const usePixi = window.location.href.includes('usepixi')
const buffer = await SVGAPlus.loadSvgaFile('/22.svga')

const sprite = new SVGAPlus({
  element: document.querySelector('#sprite-22') as HTMLCanvasElement,
  buffer: new Uint8Array(buffer),
  renderer: usePixi
      ? PixiRenderer
      : undefined
})

await sprite.init()

sprite.onPlay(() => {
  console.log(sprite.frame)
})

console.log(sprite)

let standByTimer: any = null

getElement('#play-0-5').addEventListener('click', async () => {
  await sprite.playOnce(0, 5)
  console.log('done:', sprite.frame)
})

getElement('#normal').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(sprite.frame)
  await sprite.playOnce(sprite.frame)
  sprite.play()
})

getElement('#standby').addEventListener('click', () => {
  const tick = async () => {
    clearTimeout(standByTimer)
    sprite.stop(0)
    await sprite.playOnce(0, 14)
    console.log('standby done')
    standByTimer = setTimeout(tick, 2000)
  }
  tick()
})

getElement('#lottery').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(15)
  await sprite.playOnce(15, sprite.frameCount - 1)
  console.log('lottery done')
})

getElement('#loop').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(4)
  sprite.play(4, 12)
})

getElement('#stop').addEventListener('click', () => {
  clearTimeout(standByTimer)
  sprite.stop(0)
})
