<script lang="ts">
  import type { Layer } from '../types'
  import SingleLayer from '$lib/SingleLayer.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  export let layers: Layer[] = []

  let selectedLayer

  $: dispatch('layerChange', selectedLayer)
  onMount(() => {
    dispatch('layerChange', selectedLayer)
  })

</script>



<div class="p-5 border-b-2 border-gray-100">
  <div class="text-sm font-semibold pb-3 text-gray-500">Layers</div>
  <div>
    {#each layers as layer (layer.name)}
      <SingleLayer {layer} />
    {/each}
  </div>
</div>
