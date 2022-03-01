<script lang="ts">
  import { blendModes } from '$lib/utils/blendModes'
  import type { Layer } from '../types'

  export let layer: Layer
</script>

<div>
  <select>
    {#each blendModes as mode (mode.name)}
      <option value={mode.name}>{mode.label}</option>
    {/each}
  </select>
</div>
