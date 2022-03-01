<script lang="ts">
  import type { Layer } from '../types'
  import SingleLayer from '$lib/SingleLayer.svelte'

  export let layers: Layer[] = []
</script>



<div class="p-5 border-b-2 border-gray-100">
  <div class="text-sm font-semibold pb-3 text-gray-500">Layers</div>
  <div>
    {#each layers as layer (layer.name)}
      <SingleLayer {layer} />
    {/each}
  </div>
</div>
