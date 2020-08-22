import { PixiRenderer } from '../../../renderer.pixi/lib'
import { SVGAPlus } from '../../src'

main()

let sprite: SVGAPlus = null
let standByTimer = null

async function main () {
  const usePixi = window.location.href.includes('usepixi')
  const buffer = await SVGAPlus.loadSvgaFile('./static/22.svga')
  sprite = new SVGAPlus({
    element: document.querySelector('#sprite-22') as HTMLCanvasElement,
    buffer: new Uint8Array(buffer),
    renderer: usePixi
      ? PixiRenderer
      : null
  })
  await sprite.init()
  sprite.onPlay(() => {
    console.log(sprite.frame)
  })
  console.log(sprite)
}

document.querySelector('#play-0-5').addEventListener('click', async () => {
  await sprite.playOnce(0, 5)
  console.log('done:', sprite.frame)
})

document.querySelector('#normal').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(sprite.frame)
  await sprite.playOnce(sprite.frame)
  sprite.play()
})

document.querySelector('#standby').addEventListener('click', () => {
  const tick = async () => {
    clearTimeout(standByTimer)
    sprite.stop(0)
    await sprite.playOnce(0, 14)
    console.log('standby done')
    standByTimer = setTimeout(tick, 2000)
  }
  tick()
})

document.querySelector('#lottery').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(15)
  await sprite.playOnce(15, sprite.frameCount - 1)
  console.log('lottery done')
})

document.querySelector('#loop').addEventListener('click', async () => {
  clearTimeout(standByTimer)
  sprite.stop(4)
  sprite.play(4, 12)
})

document.querySelector('#stop').addEventListener('click', () => {
  clearTimeout(standByTimer)
  sprite.stop(0)
})
