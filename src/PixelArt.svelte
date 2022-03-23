<script lang="ts">
import { useMyPresence, useObject, useOthers, useRedo, useSelf, useUndo } from './lib-liveblocks'
import { generateLayer } from '$lib/utils/generateLayer'
import { getFillPixels } from '$lib/utils/getFillPixels'
import { formatLayers } from '$lib/utils/formatLayers'
import ExportsPanel from '$lib/ExportsPanel.svelte'
import LayersPanel from '$lib/LayersPanel.svelte'
import BrushPanel from '$lib/BrushPanel.svelte'
import UserOnline from '$lib/UserOnline.svelte'
import IconButton from '$lib/IconButton.svelte'
import SharePanel from '$lib/SharePanel.svelte'
import LinksPanel from '$lib/LinksPanel.svelte'
import PixelGrid from '$lib/PixelGrid.svelte'
import Cursor from '$lib/Cursor.svelte'
import IntroDialog from '$lib/IntroDialog.svelte'
import { Tool } from './types'

/**
 *  TODO
 *  tidy up this file
 *  Save and fork button
 *  make pill stand out more over it's own colour
 *  save button above colour picker
 *  mobile
 */

const myPresence = useMyPresence()
const others = useOthers()
const self = useSelf()

// Set default value for presence
myPresence.update({
  name: '',
  selectedLayer: 0,
  cursor: null,
  tool: 'brush',
  mouseDown: false
})

// Holds information about each layer, default layer set if none set
const layerStorage = useObject('layerStorage')

// Holds each pixel
const pixelStorage = useObject('pixelStorage')

// Convert a pixel object into a pixel key
const pixelToKey = ({ layer = $myPresence.selectedLayer, row, col }) => `${layer}_${row}_${col}`

// Convert a pixel key into a pixel object
const keyToPixel = (key: string)  => {
  const [layer, row, col] = key.split('_').map(num => parseInt(num))
  return { layer, row, col }
}

// Get the current pixel, using a pixel object
const getPixel = (pixelProps) => {
  return $pixelStorage.get(pixelToKey(pixelProps))
}

// Update an array of pixels, with the same object
const updatePixels = (pixelArray, newObj) => {
  const updatedPixels = {}
  pixelArray.forEach(pixelProps => updatedPixels[pixelToKey(pixelProps)] = newObj)
  return $pixelStorage.update(updatedPixels)
}

let layers = []
$: layers = formatLayers({
  pixelStorage: $pixelStorage?.toObject(),
  layerStorage: $layerStorage?.toObject(),
  keyToPixel,
  getPixel
})


let nameSet = false

function setName ({ detail }) {
  myPresence.update({ name: detail.name })
  nameSet = true
}

$: canvasReady = $pixelStorage ? Object.keys($pixelStorage.toObject()).length > 0 : false

function createCanvas ({ detail }) {
  if ($pixelStorage?.update) {
    const defaultLayer = generateLayer({
      layer: 0,
      rows: detail.height,
      cols: detail.width,
      defaultObject: { color: 'transparent' }
    })
    $pixelStorage.update(defaultLayer)
    $layerStorage.set(0, {
      id: 0,
      opacity: 1,
      blendMode: 'normal',
      hidden: false
    })
    setName({ detail })
  }
}

let showGrid = false

let updateBrushColor

// On brush component change, update presence with new brush
function handleBrushChange ({ detail }) {
  myPresence.update({ brush: detail })
}

function handlePixelChange ({ detail }) {
  if (!$myPresence?.brush?.color || !$pixelStorage) {
    return
  }

  let tool: Tool = $myPresence.tool
  let selected = $myPresence.selectedLayer
  let currentPixel = {
    row: detail.row,
    col: detail.col,
    layer: selected
  }

  // Current pixel
  let pixelsToChange = [currentPixel]

  // If fill tool, find neighbour pixels
  if (tool === Tool.Fill) {
    const currentLayer = layers.find(layer => layer.id === selected)
    pixelsToChange = [
      ...pixelsToChange,
      ...getFillPixels(currentPixel, currentLayer.grid)
    ]
  }

  updatePixels(pixelsToChange, {
    color: tool === Tool.Eraser ? 'transparent' : $myPresence.brush.color
  })
}

const undo = useUndo()
const redo = useRedo()

const panels = {
  multiplayerPanel: null,
  mainPanel: null,
  toolsPanel: null
}

// Update cursor presence to current mouse location
function handleMouseMove (event, area) {
  if (!panels[area] || !$myPresence) {
    return
  }

  const { top, left, width, height } = panels[area].getBoundingClientRect()

  let x = Math.round(event.clientX - left)
  let y = Math.round(event.clientY - top + panels[area].scrollTop)

  // Percentage across element
  if (area === 'mainPanel') {
    x = x / width
    y = y / height
  }

  myPresence.update({
    cursor: { x, y, area },
  })
}

function calculateCursorPosition ({ x, y, area }) {
  if (!panels?.[area]) {
    return
  }

  const { top, left, width, height } = panels[area].getBoundingClientRect()
  let newX
  let newY

  if (area === 'mainPanel') {
    newX = left + width * x
    newY = top + height * y
  } else {
    newX = left + x
    newY = top + y
  }

  return { x: newX, y: newY }
}

// When the mouse leaves the page, set cursor presence to null
function handleMouseLeave () {
  myPresence.update({
    cursor: null,
  });
}
</script>

<svelte:window
  on:mousedown={() => myPresence.update({ mouseDown: true })}
  on:mouseup={() => myPresence.update({ mouseDown: false })}
/>

<div class="absolute inset-0 z-50 pointer-events-none">
  {#if $others}
    {#each [...$others] as { presence, info }}
      {#if presence?.cursor && presence?.brush}
        <Cursor
          {...calculateCursorPosition(presence.cursor)}
          shrink={presence.mouseDown}
          color={presence.brush}
          tool={presence.tool}
          name={presence.name || info.name}
        />
      {/if}
    {/each}
  {/if}
</div>

{#if !nameSet}
  <div class="absolute inset-0 z-50 flex justify-center items-center">
    <IntroDialog
      loading={!$pixelStorage}
      shouldCreateCanvas={!canvasReady}
      on:createCanvas={createCanvas}
      on:setName={setName}
    />
  </div>
{/if}

<div class="flex min-h-full bg-white">

  <div
    id="tools-panel"
    bind:this={panels.toolsPanel}
    on:pointermove={e => handleMouseMove(e, 'toolsPanel')} on:pointerleave={handleMouseLeave}
    class="side-panel w-auto flex-grow-0 flex-shrink-0 bg-white overflow-y-auto"
  >
    <BrushPanel on:brushChange={handleBrushChange} bind:updateColor={updateBrushColor} />
    {#if layers && canvasReady}
      <LayersPanel layers={layers} />
      <ExportsPanel />
    {/if}
  </div>


  <div
    id="main-panel"
    on:pointermove={e => handleMouseMove(e, 'mainPanel')} on:pointerleave={handleMouseLeave}
    class="main-panel relative flex-grow bg-gray-100 overflow-hidden flex flex-col"
  >
    <div class="relative z-10  flex-shrink-0 flex-grow-0 flex justify-between items-center w-full bg-white border-2 border-t-0 border-gray-100 p-4">
      <div class="flex gap-3">

        <sl-button-group>
          <IconButton screenReader="Brush tool" toggled={$myPresence.tool === Tool.Brush} on:click={() => myPresence.update({ tool: 'brush' })}>
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" />
            </svg>
          </IconButton>

          <IconButton screenReader="Eraser tool" toggled={$myPresence.tool === Tool.Eraser} on:click={() => myPresence.update({ tool: 'eraser' })}>
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" />
            </svg>
          </IconButton>

          <IconButton screenReader="Fill tool" toggled={$myPresence.tool === Tool.Fill} on:click={() => myPresence.update({ tool: 'fill' })}>
            <svg class="w-6 h-6 mt-[6px] scale-x-[-1]" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z" />
            </svg>
          </IconButton>
        </sl-button-group>

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
      {#if canvasReady && layers?.[0].grid.length}
        <PixelGrid bind:mainPanelElement={panels.mainPanel} layers={layers} {showGrid} on:pixelChange={handlePixelChange} />
      {/if}
    </div>
  </div>

  <div
    id="multiplayer-panel"
    bind:this={panels.multiplayerPanel}
    on:pointermove={e => handleMouseMove(e, 'multiplayerPanel')} on:pointerleave={handleMouseLeave}
    class="side-panel relative left-full lg:left-auto w-0 lg:w-[300px] flex py-5 overflow-y-auto flex-col"
  >
    <div>
      {#if $others}
        <div class="border-gray-200 text-sm font-semibold pb-1 text-gray-500 px-5">Currently online</div>
        {#if $myPresence && $self}
          <UserOnline
            picture={$self.info.picture}
            name={($myPresence.name || $self.info.name) + ' (you)'}
            brush={$myPresence.brush}
            selectedLayer={$myPresence.selectedLayer}
            tool={$myPresence.tool}
            isYou={true}
          />
        {/if}
        {#each [...$others] as { connectionId, presence, info } (connectionId)}
          {#if presence?.brush?.color}
            <UserOnline
              picture={info.picture}
              name={presence.name || info.name}
              brush={presence.brush}
              selectedLayer={presence.selectedLayer}
              tool={presence.tool}
              on:selectColor={({ detail }) => updateBrushColor(detail.color)}
              isYou={false}
            />
          {/if}
        {/each}
      {/if}
      <SharePanel />
    </div>
    <div class="flex-grow flex items-end">
      <LinksPanel />
      <!--<SwitchesPanel bind:showGrid={showGrid} />-->
    </div>
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
