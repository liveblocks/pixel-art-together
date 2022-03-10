<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import type { Layer } from '../types'
  import panzoom from 'panzoom'
  import { useHistory } from '../lib-liveblocks/useHistory'
  const dispatch = createEventDispatcher()

  export let layers: Layer[]
  export let borders: boolean = false

  let layersCache = layers

  const cols = layers[0].grid.length
  const rows = layers[0].grid[0].length

  let mouseIsDown = false

  let panElement
  let panInstance
  let panning = false

  const history = useHistory()

  $: {
    if (panInstance) {
      panInstance[panning ? 'resume' : 'pause']()
    }
  }

  onMount(() => {
    // @ts-ignore
    panInstance = panzoom(panElement, {
      // transformOrigin: { x: 0.5, y: 0.5 },
      // smoothScroll: true
    })
    panning = false
  })

  function handleKeyDown ({ code }) {
    if (panInstance && code === 'Space') {
      panning = true
    }
  }

  function handleKeyUp ({ code }) {
    if (panInstance && code === 'Space') {
      panning = false
    }
  }

  function pixelChange ({ col, row }) {
    if (panning) {
      return
    }
    dispatch('pixelChange', {
      col,
      row
    })
  }

  function handleMouseDown () {
    mouseIsDown = true
    history.pause()
  }

  function handleMouseUp () {
    mouseIsDown = false
    history.resume()
  }

  function handleMouseOver ({ col, row }) {
    if (mouseIsDown) {
      pixelChange({ col, row })
    }
  }
</script>
<!--<svelte:options immutable={true}/>-->
<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>

<div class="absolute inset-0 flex justify-center items-center p-12" bind:this={panElement} style="cursor: {!panning ? 'crosshair' : mouseIsDown ? 'grabbing' : 'grab' }">
  <div class="relative w-full max-h-full max-w-2xl">
    <div class="relative max-h-full" style="max-height: 100%; height: 100%;">
      <div
        class="grid select-none"
        style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr)); transform: translateZ(0); gap: 0;"
      >
        {#each layersCache[0].grid as row, i}
          {#each row as pixel, j}
            <div
              data-row={i}
              data-col={j}
              on:click={() => pixelChange({ col: j, row: i })}
              on:mousedown={() => handleMouseDown({ col: j, row: i })}
              on:mouseup={() => handleMouseUp({ col: j, row: i })}
              on:mouseover={() => handleMouseOver({ col: j, row: i })}
              class="w-full h-full relative pt-[100%]"
            ></div>
          {/each}
        {/each}
      </div>

      <div class="absolute inset-0 pointer-events-none">
        <svg id="svg-image" viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {#each layers as layer (layer.id)}
            <g style="mix-blend-mode: {layer.blendMode};" opacity={layer.hidden ? 0 : layer.opacity}>
              {#each layer.grid as row, rowIndex}
                {#each row as pixel, colIndex}
                  <rect
                    shape-rendering="optimizeSpeed"
                    x={colIndex * (100 / cols)}
                    y={rowIndex * (100 / rows)}
                    width={100 / cols}
                    height={100 / rows}
                    fill={pixel.color}
                    class="transition-colors duration-75"
                  />
                {/each}
              {/each}
            </g>
          {/each}
        </svg>
      </div>

      {#if borders && false}
        <div class="absolute inset-0 overflow-hidden select-none pointer-events-none opacity-100 mix-blend-difference">
          <svg class="absolute inset-[-1px]" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="{100 / rows}%" height="{100 / cols}%" patternUnits="userSpaceOnUse">
                <path d="M 1000 0 L 0 0 0 1000" fill="none" stroke-dasharray="3,3" stroke="white" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" class="" />
          </svg>
        </div>
      {/if}

    </div>
  </div>
</div>
