# SVGAPlus

[![npm version](https://badge.fury.io/js/@svgaplus%2Fcore.svg)](https://badge.fury.io/js/@svgaplus%2Fcore)
[![SVGAPlus](https://github.com/SVGAPlus/SVGAPlus/workflows/Test/badge.svg)](https://github.com/SVGAPlus/SVGAPlus/actions)

![logo](https://static.lancercomet.com/lancercomet/misc/svgaplus-logo.png)

Enhanced SVGA Player for Web.

## Feature

 - Vanilla canvas drawing by default, no 3rd-part rendering libs included.
 - Pixi.js renderer available.
 - Provide more useful information and more customizable options, such as adjustable framerate.
 - No strange resizing behavior, act like a HTML image.
 - Better API design for playing control.
 
## Quick Start

```typescript
import { SVGAPlus } from 'svgaplus'

async function main () {
  // Load SVGA file into array buffer.
  const buffer = await SVGAPlus.loadSvgaFile('/your-svga-file-url.svga')

  // Or you can just prepare a copy of arary buffer.
  const buffer = new ArrayBuffer(...)
  
  // Create SVGAPlus.
  const sprite = new SVGAPlus({
    element: document.querySelector('#my-svga-canvas') as HTMLCanvasElement,
    buffer
  })

  // Initialize SVGAPlus instance.
  await sprite.init()

  // Feel free to add a listener.
  sprite.onPlay(() => {
    console.log('current frame:', sprite.frame)
  })

  // Play whole animation in loop.
  sprite.play()

  // Play frame 1 - 5 in loop.
  sprite.play(0, 4)  

  // Play frame 1 - 15 once.
  await sprite.playOnce(0, 14)

  // Reverse frame 10 to 1.
  await sprite.playOnce(9, 0)
}
```

## Initialize several SVGAs

Initialize several SVGAs will cause some performance problem usually.

Avoid doing other works during SVGA initialization as far as you can.

Let's see this shit here:

```typescript
const list = [
  { url: './static/background.svga', element: '#background' },
  { url: './static/hex.svga', element: '#hex' },
  { url: './static/explosion.svga', element: '#explosion' },
  { url: './static/22.svga', element: '#sprite-22' },
  { url: './static/22-text.svga', element: '#text-22' },
  { url: './static/33.svga', element: '#sprite-33' },
  { url: './static/33-text.svga', element: '#text-33' }
]
```

This is the most efficient way as far as I know:

```typescript
// Load all SVGA files into buffers.
const buffers = await Promise.all(
  // You can use SVGAPlus.loadSvgaFile or your own function.
  list.map(item => SVGAPlus.loadSvgaFile(item.url))
)

// Transform buffers into SVGAPlus.
const svgas = await Promise.all(buffers.map((buffer, index) => {
  const element = list[index].element
  return new SVGAPlus({
    element: document.querySelector(element) as HTMLCanvasElement,
    buffer: new Uint8Array(buffer)
  })
}))

// Parsing.
await Promise.all(svgas.map(item => item.init()))

// Play.
svgas.forEach(item => item.play())
```

## Compatibility

It should support browsers those have canvas such like IE11+.

## Adjustable frame rate

Set `fpsOverride: number` to achieve customized framerate. However it probably won't reach that kind of speed such as 999.

## Use PIXI.js

Check out the documentation for PixiRenderer.

## API

### Package Exports

 - `SVGAPlus: SVGAPlus`
 - `SVGAParser: SVGAParser`

### SVGAPlus

#### SVGAPlus Props

 - `readonly isInPlay: boolean`
 - `readonly fps: number`
 - `readonly frame: number`
 - `readonly frameCount: number`
 - `readonly maxFrame: number`
 - `readonly fpsOverride: number`

#### SVGAPlus Methods

 - `init: () => Promise<void>`
 - `play: (from?: number, to?: number) => void`
 - `playOnce: (from: number, to: number) => Promise<void>`
 - `pause: () => void`
 - `stop: (stopAt?: number) => void`
 - `seek: (frame: number) => void`
 - `onPlay: (handler: () => void) => void`
 - `offOnPlay: (handler: () => void) => void`
 - `destroy: () => void`

#### SVGAPlus Static Methods

 - `loadSvgaFile: (url: string) => Promise<ArrayBuffer>`

#### SVGAPlus Constructor

```typescript
constructor: (param: ISVGAPlus)

interface ISVGAPlus {
  element: HTMLCanvasElement
  buffer: ArrayBuffer
  fpsOverride?: number
  renderer?: typeof SVGAPlusRenderer
}
```

### SVGAParser

#### SVGAParser Static Methods

 - `parse: (svgaBuffer: ArrayBuffer) => Promise<IProtoMovieEntity>`

### Renderer

#### SVGAPlusRenderer

```ts
class SVGAPlusRenderer {
  startTick: () => void
  stopTick: () => void
  tickFrame: (param?: ISVGAPlusRendererTickFrameParam) => void
  destroy: () => void
}

interface ISVGAPlusRendererTickFrameParam {
  forceTick?: boolean
}
```
