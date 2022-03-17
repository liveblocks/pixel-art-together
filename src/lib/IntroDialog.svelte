<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte'

  const dispatch = createEventDispatcher()
  let dialog

  let min = 2
  let max = 64

  let name = ''
  let width = 16
  let height = 16

  $: gridArray = new Array(width * height)

  function cancelClose (event) {
    if (event.detail.source === 'overlay') {
      event.preventDefault()
    }
  }

  function submitDialog () {
    localStorage.setItem('name', name)
    dispatch('createCanvas', { name, width, height })
  }

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

    <sl-input value={name} on:sl-change={e => name = e.target.value} placeholder="Enter your name">
      <div slot="label" class="text-sm font-semibold pb-1.5 text-gray-500">Name</div>
    </sl-input>

    <!--
     <div class="bg-gray-100 relative flex justify-center items-center h-36">
       <div class="absolute inset-4">
         <div style="grid-template-columns: repeat({width}, 1fr); grid-template-rows: repeat({height}, 1fr);" class="gap-0.5 flex-grow w-full h-full grid">
           {#each gridArray as _}
             <div class="bg-white w-full aspect-square"></div>
           {/each}
         </div>
       </div>
    </div>
    -->


    <div class="flex gap-4 items-end">
      <div class="flex-grow flex-shrink">
        <sl-range {min} {max} value={height} on:sl-change={e => height = e.target.__value}>
          <div slot="label" class="text-sm font-semibold pb-1 text-gray-500">Height</div>
        </sl-range>
      </div>
      <div class="w-6 text-right text-lg font-medium text-gray-600">{height}</div>
    </div>


    <div class="flex gap-4 items-end">
      <div class="flex-grow flex-shrink">
        <sl-range {min} {max} value={width} on:sl-change={e => width = e.target.__value}>
          <div slot="label" class="text-sm font-semibold pb-1 text-gray-500">Width</div>
        </sl-range>
      </div>
      <div class="w-6 text-right text-lg font-medium text-gray-600">{width}</div>
    </div>

    <sl-button on:click={submitDialog} variant="primary">Create canvas</sl-button>

  </div>
</sl-dialog>
