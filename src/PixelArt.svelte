<script lang="ts">
import PixelGrid from '$lib/PixelGrid.svelte'
import { generateGrid } from '$lib/generateGrid'
import BrushSelection from '$lib/BrushSelection.svelte'
import { useMyPresence, useOthers } from './lib-liveblocks'

let grid = generateGrid(12, 12, { color: 'skyblue' })

const myPresence = useMyPresence()
const others = useOthers()

$: $others ? console.log($others.toArray()?.[0]?.presence?.brush || 'no others') : null



function handleBrushChange ({ detail }) {
  console.log('brush', detail)
  $myPresence = { brush: detail }
}

function handlePixelChange ({ detail }) {
  console.log(detail)
  if ($myPresence) {
    grid[detail.row][detail.col] = { color: $myPresence.brush.color || '#000' }
  }
}
</script>

<div class="max-w-xl">
  <div class="relative w-full pt-[100%]">
    <PixelGrid grid={grid} borders={true} on:pixelChange={handlePixelChange} />
  </div>
  <div>
    <BrushSelection on:brushChange={handleBrushChange} />
  </div>
</div>

<!--
  Include undo button
  Show other users brush state
  Brushes can have color/opacity/blend mode/size?/shape?
-->
