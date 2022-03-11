<script lang="ts">
import PixelGrid from '$lib/PixelGrid.svelte'
import BrushPanel from '$lib/BrushPanel.svelte'
import { useMyPresence, useObject, useOthers, useSelf } from './lib-liveblocks'
import LayersPanel from '$lib/LayersPanel.svelte'
import ExportsPanel from '$lib/ExportsPanel.svelte'
import UserOnline from '$lib/UserOnline.svelte'
import { generateLayer } from '$lib/utils/generateLayer'
import IconButton from '$lib/IconButton.svelte'
import { useUndo } from './lib-liveblocks/useUndo'
import { useRedo } from './lib-liveblocks/useRedo'
import SharePanel from '$lib/SharePanel.svelte'
import Cursor from '$lib/Cursor.svelte'

/**
 *  TODO
 *  intro page
 *  store state ie width height in new LiveObject, pass to exports panel
 *  cursor for each user on canvas or highlight each pixel when changed
 *  ? avatar appears in pixel for second
 *  Save and fork button
 *  Toggle grid switch
 *  More brush sizes
 *  When layer 0 doesn't exist, select a layer
 */

// Generate a default layer
const defaultLayer = generateLayer({
  layer: 0,
  rows: 16,
  cols: 16,
  defaultObject: { color: '#eccdf4' }
})

// Holds each pixel, default layer used if none exist
const pixelStorage = useObject('pixelStorage', defaultLayer)

// Holds information about each layer, default layer set if none set
const layerStorage = useObject('layerStorage', {
  0: {
    id: 0,
    opacity: 1,
    blendMode: 'normal',
    hidden: false
  }
})

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

    formattedLayers = Object.values($layerStorage.toObject()).map(layer => {
      const grid = []
      currentPixels.forEach(pixel => {
        if (layer.id !== pixel.layer) return
        if (!grid[pixel.row]) grid[pixel.row] = []
        if (!grid[pixel.row][pixel.col]) grid[pixel.row][pixel.col] = []

        grid[pixel.row][pixel.col] = getPixel(pixel)
      })
      return { ...layer, grid }
    })
  }
}

const myPresence = useMyPresence()
const others = useOthers()
const self = useSelf()

let showGrid = false

// Set default value for presence
myPresence.update({
  selectedLayer: 0,
  cursor: null
})

$: $others ? console.log($others.toArray()?.[0]?.presence?.brush || 'no others') : null

// On brush component change, update presence with new brush
function handleBrushChange ({ detail }) {
  myPresence.update({ brush: detail })
}

function handlePixelChange ({ detail }) {
  if (!$myPresence || !$pixelStorage) {
    return
  }

  updatePixel({
    row: detail.row,
    col: detail.col,
    layer: $myPresence.selectedLayer
  }, {
    color: $myPresence.brush.color || '#000'
  })
}

const undo = useUndo()
const redo = useRedo()

// Update cursor presence to current mouse location
function handleMouseMove (event) {
  myPresence.update({
    cursor: {
      x: Math.round(event.offsetX),
      y: Math.round(event.offsetY),
    },
  });
}

// When the mouse leaves the page, set cursor presence to null
function handleMouseLeave () {
  myPresence.update({
    cursor: null,
  });
}
</script>



<div class="flex min-h-full bg-white" on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
  <div class="side-panel w-[300px] py-5 overflow-y-auto flex flex-col justify-between">
    <div>
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
      <SharePanel />
    </div>
    <div>
      <!--<LinksPanel />-->
      <!--<SwitchesPanel bind:showGrid={showGrid} />-->
    </div>
  </div>

  <div class="main-panel relative flex-grow bg-gray-100 overflow-hidden flex flex-col">

    <div class="absolute inset-0 z-50 pointer-events-none">
      {#if $others}
        {#each [...$others] as { presence, info }}
          {#if presence?.cursor}
            <Cursor
              x={presence.cursor.x}
              y={presence.cursor.y}
              color={presence.brush}
              name={info.name}
            />
          {/if}
        {/each}
      {/if}
    </div>



    <div class="relative z-10  flex-shrink-0 flex-grow-0 flex justify-between items-center w-full bg-white border-2 border-t-0 border-gray-100 p-4">
      <div class="flex gap-3">

        <IconButton screenReader="Toggle grid" toggled={showGrid} on:click={() => showGrid = !showGrid}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </IconButton>

      </div>

      <div class="flex gap-3">

        <sl-button-group>
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
        </sl-button-group>

      </div>
    </div>
    <div class="flex-grow relative">
      {#if formattedLayers?.length}
        <PixelGrid layers={formattedLayers} {showGrid} on:pixelChange={handlePixelChange} />
      {/if}
    </div>
  </div>

  <div class="side-panel w-auto flex-grow-0 flex-shrink-0 bg-white overflow-y-auto">
    <BrushPanel on:brushChange={handleBrushChange} />
    {#if formattedLayers}
      <LayersPanel layers={formattedLayers} />
      <ExportsPanel />
    {/if}
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
