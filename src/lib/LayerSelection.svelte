<script lang="ts">
  import { blendModes } from '$lib/blendModes'
</script>

<label for="">Blend mode</label>
<select bind:value={brush.blendMode}>
  {#each blendModes as mode (mode.name)}
    <option value={mode.name}>{mode.label}</option>
  {/each}
</select>
