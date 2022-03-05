<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  let colorPicker

  let brush = {
    opacity: 100,
    hue: 0,
    saturation: 0,
    color: '#000',
    lightness: 0
  }

  $: dispatch('brushChange', brush)
  onMount(async () => {
    dispatch('brushChange', brush)
    await import('@shoelace-style/shoelace/dist/components/color-picker/color-picker.js')
    applyCustomStyles(colorPicker)
  })
  // https://efeskucuk.github.io/svelte-color-picker/
  // https://sseemayer.github.io/svelte-colorpick/

  function applyCustomStyles (host) {
    const style = document.createElement('style')
    style.innerHTML = `
      .color-picker__controls, .color-picker__user-input { padding-left: 0; padding-right: 0; }
      .color-picker__grid { border-radius: 4px !important; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2); }
    `
    host.shadowRoot.appendChild(style)
    host.swatches = []
  }

  function colorChange ({ target }) {
    let col = target.value
    if (col[0] !== '#') {
      col = colorPicker.getFormattedValue('hex')
    }
    brush = {
      color: col,
      opacity: parseInt(target.alpha),
      hue: parseInt(target.hue),
      saturation: parseInt(target.saturation),
      lightness: parseInt(target.lightness)
    }
  }
</script>

<!-- script tag for color picker is in app.html -->

<div class="p-5 pb-2 border-b-2 border-gray-100">
  <div class="text-sm font-semibold pb-3 text-gray-500">Colour</div>
  <div>
    <sl-color-picker
      on:sl-change={colorChange}
      bind:this={colorPicker}
      inline
      opacity
    ></sl-color-picker>
  </div>
</div>

<style global>
:root {
  --sl-font-sans: Karla, Inter, sans-serif;
  --sl-panel-border-width: 0;
  --sl-font-size-medium: 14px;
  /*
  --sl-color-primary-50: ;
  --sl-color-primary-100: ;
  --sl-color-primary-200: ;
  --sl-color-primary-300: ;
  --sl-color-primary-400: ;
  --sl-color-primary-500: ;
  --sl-color-primary-600: ;
  --sl-color-primary-700: ;
   */
}
</style>
