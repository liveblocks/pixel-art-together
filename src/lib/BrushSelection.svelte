<script lang="ts">
  import { blendModes } from '$lib/blendModes'
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  let brush = {
    opacity: 100,
    color: '#000',
    blendMode: 'normal'
  }

  $: dispatch('brushChange', brush)
  onMount(() => dispatch('brushChange', brush))
</script>

<div>
  <div class="flex justify-between">
    <div>
      <label for="">Blend mode</label>
      <select bind:value={brush.blendMode}>
        {#each blendModes as mode (mode.name)}
          <option value={mode.name}>{mode.label}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="">Opacity</label>
      <input type="range" bind:value={brush.opacity} />
      {brush.opacity}%
    </div>
    <div>
      <label for="">Color</label>
      <input type="color" bind:value={brush.color} />
      {brush.color}
    </div>
  </div>
</div>
