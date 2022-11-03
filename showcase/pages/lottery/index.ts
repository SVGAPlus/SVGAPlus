import { PixiRenderer } from '@svgaplus/renderer.pixi'
import { SVGAPlus } from '@svgaplus/core'
import { randomNumber, sleep } from './utils'
import { getElement } from '../../utils'

const spriteList: { [key: string]: { url: string, element: string, svga: SVGAPlus | undefined } } = {
  background: { url: '/background.svga', element: '#background', svga: undefined },
  hex: { url: '/hex.svga', element: '#hex', svga: undefined },
  explosion: { url: '/explosion.svga', element: '#explosion', svga: undefined },
  sprite22: { url: '/22.svga', element: '#sprite-22', svga: undefined },
  text22: { url: '/22-text.svga', element: '#text-22', svga: undefined },
  sprite33: { url: '/33.svga', element: '#sprite-33', svga: undefined },
  text33: { url: '/33-text.svga', element: '#text-33', svga: undefined }
}

let playStatus: 'standby' | 'lottery22' | 'lottery33' = 'standby'
let allowControl: boolean = true

const hexCanvas = document.getElementById('hex') as HTMLCanvasElement
const sprite22Canvas = document.getElementById('sprite-22') as HTMLCanvasElement
const sprite33Canvas = document.getElementById('sprite-33') as HTMLCanvasElement
const text22Canvas = document.getElementById('text-22') as HTMLCanvasElement
const text33Canvas = document.getElementById('text-33') as HTMLCanvasElement
const explosionCanvas = document.getElementById('explosion') as HTMLCanvasElement

main()

async function main () {
  await initSvga()
  playStandby()
  registerEvents()
}

async function initSvga () {
  const startTs = Date.now()
  const usePixi = window.location.href.includes('usepixi')

  const buffers = await Promise.all(
    Object.keys(spriteList)
      .map(key => SVGAPlus.loadSvgaFile(spriteList[key].url + '?ts=' + Date.now()))
  )

  await Promise.all(buffers.map((buffer, index) => {
    const item = spriteList[Object.keys(spriteList)[index]]
    const element = item.element
    const svga = new SVGAPlus({
      element: document.querySelector(element) as HTMLCanvasElement,
      buffer,
      renderer: usePixi ? PixiRenderer : undefined
    })
    item.svga = svga
    return svga
      .init()
      .then(() => {
        svga.stop()
      })
  }))

  console.log('Init takes:', Date.now() - startTs, 'ms')
}

function registerEvents () {
  getElement('#action-area')
    .addEventListener('click', () => {
      if (!allowControl) {
        return
      }

      allowControl = false
      playLottery22()
    })
}

async function playStandby () {
  playStatus = 'standby'

  const hexSprite = spriteList.hex.svga!
  hexSprite.play()

  const sprite22 = spriteList.sprite22.svga!
  const text22 = spriteList.text22.svga!

  const tick22 = async () => {
    if (playStatus === 'standby') {
      await sprite22.playOnce(0, 14)
    }
    await sleep(randomNumber(2000, 4000))
    requestAnimationFrame(tick22)
  }
  tick22()

  const tick22Text = async () => {
    await text22.playOnce(0, 27)
    requestAnimationFrame(tick22Text)
  }
  tick22Text()

  const sprite33 = spriteList.sprite33.svga!
  const text33 = spriteList.text33.svga!

  const tick33 = async () => {
    if (playStatus === 'standby') {
      await sprite33.playOnce(0, 18)
    }
    await sleep(randomNumber(2000, 4000))
    requestAnimationFrame(tick33)
  }
  tick33()

  const tick33Text = async () => {
    await text33.playOnce(0, 19)
    requestAnimationFrame(tick33Text)
  }
  tick33Text()
}

async function playLottery22 () {
  playStatus = 'lottery22'

  const sprite22 = spriteList.sprite22.svga!
  const explosion = spriteList.explosion.svga!
  const background = spriteList.background.svga!

  hexCanvas.classList.add('focus')
  sprite22Canvas.classList.add('focus')
  text22Canvas.classList.add('focus')
  sprite33Canvas.classList.add('exit')
  text33Canvas.classList.add('exit')

  await sleep(600)

  text22Canvas.classList.add('exit')
  explosionCanvas.classList.add('display')

  await Promise.all([
    sprite22.playOnce(15, 25),
    explosion.playOnce(),
    background.playOnce()
  ])

  // Reset.
  await sleep(400)

  explosionCanvas.classList.remove('display')
  sprite22Canvas.classList.remove('focus')
  sprite33Canvas.classList.remove('exit')
  text33Canvas.classList.remove('exit')
  hexCanvas.classList.remove('focus')
  text22Canvas.classList.remove('focus')
  text22Canvas.classList.remove('exit')

  await Promise.all([
    sprite22.playOnce(25, 0),
    background.playOnce(background.maxFrame, 0)
  ])

  playStatus = 'standby'
  allowControl = true
}
