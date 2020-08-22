# SVGAPlus PixiRenderer

You can use PIXI.js to render SVGA graphics.

Just doing few steps and you're on 🔥!

## Setup

1. Install PIXI.js v5 to your project:

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

You can access pixi stuff from here:

```ts
const player = new SVGAPlus({
  ...
  renderer: PixiRenderer
})

player.renderer  // Pixi is so 🔥! 
```

And two props are important for you:

```ts
player.renderer.pixiApp        // Pixi Application.
player.renderer.pixiContainer  // Everything has been put in this container.
```

For an example, this is how to add pixi filters:

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
// Do this process after "init".
player.renderer.filters = [
  new Filters.RGBSplitFilter()
]
```

For more usage, check out pixi.js for more information.
