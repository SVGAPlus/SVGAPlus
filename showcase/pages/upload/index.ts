import { PixiRenderer } from '@svgaplus/renderer.pixi'
import { SVGAPlus } from '@svgaplus/core'
import {getElement} from "../../utils";

let player: SVGAPlus | undefined = undefined
let playerPixi: SVGAPlus | undefined = undefined

const fileInput = document.getElementById('file-upload') as HTMLInputElement
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if (!file) {
    return
  }

  const buffer = await new Promise<ArrayBuffer>(resolve => {
    const fileReader = new FileReader()
    fileReader.onloadend = (event: ProgressEvent<FileReader>) => {
      const result = (event.target!).result as ArrayBuffer
      resolve(result)
    }
    fileReader.readAsArrayBuffer(file)
  })

  player?.destroy()
  playerPixi?.destroy()

  player = new SVGAPlus({
    element: document.getElementById('stage') as HTMLCanvasElement,
    buffer
  })

  playerPixi = new SVGAPlus({
    element: document.getElementById('stage-pixi') as HTMLCanvasElement,
    buffer,
    renderer: PixiRenderer
  })

  console.log(player)
  console.log(playerPixi)

  await player.init()
  await playerPixi.init()

  player.play()
  playerPixi.play()

  fileInput.value = ''
})

const replyBtn = getElement('#replay-btn')
replyBtn.addEventListener('click', () => {
  player?.playOnce()
  playerPixi?.playOnce()
})
