<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  let brush = {
    opacity: 100,
    hue: 0,
    saturation: 0,
    color: '#000',
    lightness: 0
  }

  $: dispatch('brushChange', brush)
  onMount(() => {
    dispatch('brushChange', brush)
  })
  // https://efeskucuk.github.io/svelte-color-picker/
  // https://sseemayer.github.io/svelte-colorpick/

  function colorChange ({ target }) {
    brush = {
      color: target.value,
      opacity: parseInt(target.alpha),
      hue: parseInt(target.hue),
      saturation: parseInt(target.saturation),
      lightness: parseInt(target.lightness)
    }
  }
</script>

<!-- script tag for color picker is in app.html -->

<div>
  <div class="p-7">
    <div>
      <label for="">Opacity</label>
      <input type="range" bind:value={brush.opacity} />
      {brush.opacity}%
    </div>
    <div>
      <sl-color-picker on:sl-change={colorChange} inline opacity ></sl-color-picker>

    </div>
      <label for="">Color</label>
      {brush.color}
  </div>
</div>

<style>
sl-color-picker {
  --sl-panel-border-width: 100px !important;
}

</style>
