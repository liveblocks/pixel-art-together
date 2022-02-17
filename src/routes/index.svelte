<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
import PixelGrid from '$lib/PixelGrid.svelte'
import { generateGrid } from '$lib/generateGrid'

const grid = generateGrid(8, 8, { color: 'skyblue' })

function handlePixelChange ({ detail }) {
  console.log(detail.row, detail.col)
  grid[detail.row][detail.col] = { color: 'red' }
}
</script>

<div class="max-w-xl">
  <div class="relative w-full pt-[100%]">
    <PixelGrid grid={grid} borders={true} on:pixelChange={handlePixelChange} />
  </div>
</div>
