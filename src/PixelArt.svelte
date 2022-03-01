<script lang="ts">
import PixelGrid from '$lib/PixelGrid.svelte'
import { generateGrid } from '$lib/generateGrid'
import BrushPanel from '$lib/BrushPanel.svelte'
import { useMyPresence, useOthers, useSelf } from './lib-liveblocks'
import LayersPanel from '$lib/LayersPanel.svelte'
import ExportsPanel from '$lib/ExportsPanel.svelte'
import UserOnline from '$lib/UserOnline.svelte'
import CopyLinkButton from '$lib/CopyLinkButton.svelte'

let grid = generateGrid(12, 12, { color: 'skyblue' })

const myPresence = useMyPresence()
const others = useOthers()
const self = useSelf()

myPresence.update({
  selectedLayer: 'Layer 0'
})

$: $others ? console.log($others.toArray()?.[0]?.presence?.brush || 'no others') : null



function handleBrushChange ({ detail }) {
  console.log('brush', detail)
  myPresence.update({ brush: detail })
}

function handlePixelChange ({ detail }) {
  console.log(detail)
  if ($myPresence) {
    grid[detail.row][detail.col] = { color: $myPresence.brush.color || '#000' }
  }
}
</script>

<div class="flex min-h-full bg-white">
  <div class="w-[300px] py-5">
    {#if $others}
      <div class="border-gray-200 text-sm font-semibold pb-1 text-gray-500 px-5">Currently online</div>
      {#if $myPresence && $self}
        <UserOnline
          name={$self.info.name + ' (you)'}
          picture={$self.info.picture}
          color={$myPresence.brush.color}
          selectedLayer={$myPresence.selectedLayer}
        />
      {/if}
      {#each [...$others] as { connectionId, presence, info } (connectionId)}
        {#if presence}
          <UserOnline
            name={info.name}
            picture={info.picture}
            color={presence.brush.color}
            selectedLayer={presence.selectedLayer}
          />
        {/if}
      {/each}
    {/if}
    <div class="px-5">
      <div class="border-t-2 border-gray-100 mt-3 pt-5 text-sm font-semibold pb-1 text-gray-500">Share with friends</div>
      <CopyLinkButton />
    </div>
  </div>

  <div class="flex-grow flex justify-center items-center bg-gray-100">
    <div class="max-w-xl">
      <div class="relative w-full pt-[100%]">
        <PixelGrid grid={grid} borders={true} on:pixelChange={handlePixelChange} />
      </div>

    </div>
  </div>

  <div class="w-auto flex-grow-0 flex-shrink-0 bg-white">
    <BrushPanel on:brushChange={handleBrushChange} />
    <LayersPanel />
    <ExportsPanel />
  </div>
</div>


<!--
  Include undo button
  Show other users brush state
  Brushes can have color/opacity/blend mode/size?/shape?
-->
