<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte'

  export let shouldCreateCanvas: boolean = false
  export let loading: boolean = true

  const dispatch = createEventDispatcher()
  let dialog

  // Min and max width/height for canvas
  let pixelSizeMin: number =  2
  let pixelSizeMax: number =  64

  // Default name and sizes
  let name: string = localStorage.getItem('name') || ''
  let width: number = 16
  let height: number = 16

  // Prevent dialog closing
  function cancelClose (event) {
    event.preventDefault()
  }

  // Submit dialog events
  function submitDialog () {
    if (shouldCreateCanvas) {
      dispatch('createCanvas', { name, width, height })
    } else {
      dispatch('setName', { name })
    }
    localStorage.setItem('name', name)
  }

  // Submit dialog when return key pressed in input
  function handleInputKeyDown ({ code }) {
    if (code === 'Enter') {
      setTimeout(() => submitDialog(), 20)
    }
  }

  // Load components, prevent closing
  onMount(async () => {
    await import('@shoelace-style/shoelace/dist/components/dialog/dialog.js')

    if (dialog) {
      dialog.addEventListener('sl-request-close', cancelClose)
    }

    await import('@shoelace-style/shoelace/dist/components/range/range.js')
  })

  onDestroy(() => {
    if (dialog) {
      dialog.removeEventListener('sl-request-close', cancelClose)
    }
  })
</script>

<sl-dialog style="--width: 300px;" bind:this={dialog} label="Create a pixel canvas" open no-header>
  <div class="flex flex-col gap-5">
    <h1 class="text-2xl mt-1">
      <span class="font-extrabold tracking-tighter text-black">Pixel art</span>
      <span class="font-medium text-gray-500 tracking-tight">together</span>
    </h1>

    <sl-input
      value={name}
      placeholder="Enter your name"
      on:sl-input={e => name = e.target.value}
      on:keydown={handleInputKeyDown}
    >
      <div slot="label" class="text-sm font-semibold pb-1.5 text-gray-500">Name</div>
    </sl-input>

    {#if shouldCreateCanvas && !loading}
      <div class="flex gap-4 items-end">
        <div class="flex-grow flex-shrink">
          <sl-range {pixelSizeMin} {pixelSizeMax} value={height} on:sl-change={e => height = e.target.__value}>
            <div slot="label" class="text-sm font-semibold pb-1 text-gray-500">Height</div>
          </sl-range>
        </div>
        <div class="w-6 text-right text-lg font-medium text-gray-600">{height}</div>
      </div>

      <div class="flex gap-4 items-end mb-2">
        <div class="flex-grow flex-shrink">
          <sl-range {pixelSizeMin} {pixelSizeMax} value={width} on:sl-change={e => width = e.target.__value}>
            <div slot="label" class="text-sm font-semibold pb-1 text-gray-500">Width</div>
          </sl-range>
        </div>
        <div class="w-6 text-right text-lg font-medium text-gray-600">{width}</div>
      </div>
    {/if}

    <sl-button {loading} on:click={submitDialog} variant="primary">
      {shouldCreateCanvas ? 'Create canvas' : 'Set name'}
    </sl-button>

  </div>
</sl-dialog>
