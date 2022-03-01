<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { PixelGrid, PixelGridCoords } from '../types'
  import SinglePixel from '$lib/SinglePixel.svelte'
  const dispatch = createEventDispatcher()

  export let grid: PixelGrid = [[]]
  export let borders: boolean = false

  const cols = grid.length
  const rows = grid[0].length

  let mouseIsDown = false

  function pixelChange ([col, row]: PixelGridCoords) {
    dispatch('pixelChange', {
      col,
      row
    })
  }

  function handleMouseDown ({ detail }) {
    mouseIsDown = true
  }

  function handleMouseUp ({ detail }) {
    mouseIsDown = false
  }

  function handleMouseOver ({ detail }) {
    if (mouseIsDown) {
      pixelChange([detail.col, detail.row])
    }
  }
</script>

<div class="relative">
  <div
    class="grid select-none"
    style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr)); transform: translateZ(0);"
  >
    {#each grid as row, i}
      {#each row as pixel, j}
        <SinglePixel
          {pixel}
          row={i}
          col={j}
          on:change={() => pixelChange([j, i])}
          on:mousedown={handleMouseDown}
          on:mouseup={handleMouseUp}
          on:mouseover={handleMouseOver}
         />
      {/each}
    {/each}
  </div>
  {#if borders}
    <div class="absolute inset-0 overflow-hidden select-none pointer-events-none opacity-30">
      <svg class="absolute inset-[-0.5px]" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="{100 / rows}%" height="{100 / cols}%" patternUnits="userSpaceOnUse">
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke-dasharray="3,3" stroke="white" stroke-width="1"/>
          </pattern>
          <pattern id="grid2" width="{100 / rows}%" height="{100 / cols}%" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke-dasharray="3,3" stroke="black" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" class="" />
        <rect width="100%" height="100%" fill="url(#grid2)" class="" />
      </svg>
    </div>
  {/if}
</div>
