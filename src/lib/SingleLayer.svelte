<script lang="ts">
  import { blendModes } from '$lib/utils/blendModes'
  import type { Layer } from '../types'

  export let layer: Layer
</script>

<div class="border-b last:border-b-0 border-[#D4D4D8] flex justify-between items-center text-sm text-gray-700">
  <span class="pl-4 font-semibold">Layer {layer.id}</span>
  <select class="bg-transparent hover:bg-gray-100 py-3 px-2 m-0 w-28">
    {#each blendModes as mode (mode.name)}
      <option value={mode.name}>{mode.label}</option>
    {/each}
  </select>
</div>
