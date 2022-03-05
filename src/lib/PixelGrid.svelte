<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import type { Layer, PixelGrid } from '../types'
  import SinglePixel from '$lib/SinglePixel.svelte'
  import * as panzoom from 'panzoom'
  import { useHistory } from '../lib-liveblocks/useHistory'
  const dispatch = createEventDispatcher()

  export let layers: Layer[]
  export let grid: PixelGrid = [[]]
  export let borders: boolean = false

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

  function handleMouseDown ({ detail }) {
    mouseIsDown = true
    history.pause()
  }

  function handleMouseUp ({ detail }) {
    mouseIsDown = false
    history.resume()
  }

  function handleMouseOver ({ detail }) {
    if (mouseIsDown) {
      pixelChange(detail)
    }
  }


</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>

<div class="absolute inset-0 flex justify-center items-center p-12" bind:this={panElement} style="cursor: {!panning ? 'crosshair' : mouseIsDown ? 'grabbing' : 'grab' }">
  <div class="relative w-full max-h-full max-w-2xl">
    <div class="relative max-h-full" style="max-height: 100%; height: 100%;">
      <div
        class="grid select-none"
        style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr)); transform: translateZ(0); gap: 0;"
      >

        {#each layers[0].grid as row, i}
          {#each row as pixel, j}
            <SinglePixel
              {pixel}
              row={i}
              col={j}
              on:change={() => pixelChange({ col: j, row: i })}
              on:mousedown={handleMouseDown}
              on:mouseup={handleMouseUp}
              on:mouseover={handleMouseOver}
             />
          {/each}
        {/each}
      </div>

      {#if borders}
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
