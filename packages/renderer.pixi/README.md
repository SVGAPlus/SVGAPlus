# SVGAPlus PixiRenderer

You are able to use PIXI.js to render SVGA graphics.

Just doing a few steps and you are gonna be on 🔥!

> This version is for PIXI.JS v7. If you want to use v5, please install 1.x.

## Setup

1. Install PIXI.js v7 to your project:

```
npm install pixi.js --save
```

2. Install PixiRenderer:

```
npm install @svgaplus/renderer.pixi --save
```

3. Rock and roll:

```ts
import { SVGAPlus } from '@svgaplus/core'
import { PixiRenderer } from '@svgaplus/renderer.pixi' 

const player = new SVGAPlus({
  ...
  renderer: PixiRenderer
})
```

Done! Now you have everything from PIXI.js!

## Customize your PIXI Renderer

You can access all pixi stuffs from here:

```ts
const player = new SVGAPlus({
  ...
  renderer: PixiRenderer
})

player.renderer  // Pixi is so 🔥! 
```

And you might want to know:

```ts
player.renderer.pixiApp        // Pixi Application.
player.renderer.pixiContainer  // Everything has been put in this container.
```

For an example, this is the way to use pixi filters:

```ts
import { SVGAPlus } from '@svgaplus/core'
import { PixiRenderer } from '@svgaplus/renderer.pixi' 
import * as Filters from 'pixi-filters'

const player = new SVGAPlus({
  ...
  renderer: PixiRenderer
})

await player.init()

// Set your favourite filters.
// Just doing this after calling "init()".
player.renderer.pixiContainer.filters = [
  new Filters.RGBSplitFilter()
]
```

Check out [PIXI.js](https://github.com/pixijs) for more information.
