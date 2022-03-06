<script lang="ts">
import PixelGrid from '$lib/PixelGrid.svelte'
import BrushPanel from '$lib/BrushPanel.svelte'
import { useList, useMyPresence, useObject, useOthers, useSelf } from './lib-liveblocks'
import LayersPanel from '$lib/LayersPanel.svelte'
import ExportsPanel from '$lib/ExportsPanel.svelte'
import UserOnline from '$lib/UserOnline.svelte'
import CopyLinkButton from '$lib/CopyLinkButton.svelte'
import { generateLayer } from '$lib/utils/generateLayer'
import IconButton from '$lib/IconButton.svelte'
import { useUndo } from './lib-liveblocks/useUndo'
import { useRedo } from './lib-liveblocks/useRedo'

const defaultLayer = generateLayer({
  layer: 0,
  rows: 16,
  cols: 16,
  defaultObject: { color: 'purple' }
})

// Holds each pixel
const pixelStorage = useObject('pixelStorage', defaultLayer)

// Holds information about each layer
const layerStorage = useList('layerStorage', [{
  id: 0,
  opacity: 1,
  blendMode: 'normal',
  hidden: false
}])

// Convert a pixel object into a pixel key
const pixelToKey = ({ layer = $myPresence.selectedLayer, row, col }) => `LAY${layer}_ROW${row}_COL${col}`

// Convert a pixel key into a pixel object
const keyToPixel = (key: string)  => {
  const [layer, row, col] = key.split('_').map(str => parseInt(str.slice(3)))
  return { layer, row, col }
}

// Get the current pixel, using a pixel object
const getPixel = (pixelProps) => {
  return $pixelStorage.get(pixelToKey(pixelProps))
}

// Update the current pixel, using a pixel object to access
const updatePixel = (pixelProps, newObj) => {
  return $pixelStorage.set(pixelToKey(pixelProps), newObj)
}

/**
 * Returns an object containing all layers and pixel grids, for general use
 *
 * Layers [
 *   Layer {
 *     Grid [
 *       Row [
 *         Pixel {
 *           Color
 *         }
 *       ]
 *     ]
 *     Opacity
 *     BlendMode
 *   }
 * ]
 */
let formattedLayers = []
$: {
  if (pixelStorage && $layerStorage) {
    const currentPixels = Object.keys($pixelStorage.toObject())
      .map(key => ({ key, ...keyToPixel(key) }))

    formattedLayers = $layerStorage.map(layer => {
      const grid = []
      currentPixels.forEach(pixel => {
        if (layer.id ==! pixel.layer) return
        if (!grid[pixel.row]) grid[pixel.row] = []
        if (!grid[pixel.row][pixel.col]) grid[pixel.row][pixel.col] = []

        grid[pixel.row][pixel.col] = getPixel(pixel)
      })
      return { grid, ...layer }
    })
  }
}


setTimeout(() => {
  console.log(123, formattedLayers)
}, 2000)







const myPresence = useMyPresence()
const others = useOthers()
const self = useSelf()



myPresence.update({
  selectedLayer: 0
})

$: $others ? console.log($others.toArray()?.[0]?.presence?.brush || 'no others') : null

function handleBrushChange ({ detail }) {
  //console.log('brush', detail)
  myPresence.update({ brush: detail })
}

function handlePixelChange ({ detail }) {
  console.log(detail)
  if (!$myPresence || !$pixelStorage) {
    return
  }

  updatePixel({
    row: detail.row,
    col: detail.col,
    layer: $myPresence.selectedLayer
    }, {
      color: $myPresence.brush.color || '#000'
    }
  )
}

const undo = useUndo()
const redo = useRedo()
</script>

<div class="flex min-h-full bg-white">
  <div class="side-panel w-[300px] py-5 overflow-y-auto">
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
      <p class="text-center mt-2 text-gray-600 text-sm">
        Share link to play together
      </p>
      <div class="mx-auto mt-8 text-center">
        <sl-qr-code value={window.location.href} label="Scan this code to visit Shoelace on the web!"></sl-qr-code>
      </div>
    </div>
  </div>

  <div class="main-panel relative flex-grow bg-gray-100 overflow-hidden flex flex-col">
    <div class="flex-shrink-0 flex-grow-0 flex justify-between items-center w-full bg-white border-2 border-t-0 border-gray-100 p-4">
      <div>
        toolbar
      </div>
      <div class="flex gap-3">

        <IconButton screenReader="Undo" on:click={() => undo()}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </IconButton>

        <IconButton screenReader="Redo" on:click={() => redo()}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </IconButton>

      </div>
    </div>
    <div class="flex-grow relative">
      {#if formattedLayers?.length}
        <PixelGrid layers={formattedLayers} borders={true} on:pixelChange={handlePixelChange} />
      {/if}
    </div>
  </div>

  <div class="side-panel w-auto flex-grow-0 flex-shrink-0 bg-white overflow-y-auto">
    <BrushPanel on:brushChange={handleBrushChange} />
    <LayersPanel layers={formattedLayers} />
    <ExportsPanel />
  </div>
</div>


<!--
  Include undo button
  Show other users brush state
  Brushes can have color/opacity/blend mode/size?/shape?
-->

<style>
  .main-panel, .side-panel {
    max-height: calc(100vh - var(--header-height));
  }

  .side-panel {
    scrollbar-width: thin;
  }

  .side-panel::-webkit-scrollbar {
    width: 8px;
  }

  .side-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .side-panel::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border: transparent;
  }
</style>
