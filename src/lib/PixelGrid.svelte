<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { PixelGrid, PixelGridCoords } from '../types'
  import SinglePixel from '$lib/SinglePixel.svelte'
  const dispatch = createEventDispatcher()

  export let grid: PixelGrid = [[]]
  export let borders: boolean = false
  const cols = grid.length
  const rows = grid[0].length

  function handlePixelClick ([col, row]: PixelGridCoords) {
    dispatch('pixelChange', {
      col,
      row
    })
  }
</script>

<div class="absolute inset-0 grid" style="gap: {borders ? 1 : 0}px; grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr))">
  {#each grid as row, i}
    {#each row as pixel, j}
      <SinglePixel
        {pixel}
        row={i}
        col={j}
        on:change={() => handlePixelClick([j, i])}
       />
    {/each}
  {/each}
</div>
