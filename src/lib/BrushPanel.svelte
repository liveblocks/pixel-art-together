<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { useMyPresence } from '../lib-liveblocks'
  const dispatch = createEventDispatcher()

  const myPresence = useMyPresence()

  let colorPicker

  let brush = {
    opacity: 100,
    hue: 0,
    saturation: 0,
    color: '#000',
    lightness: 0,
    rgb: { r: 255, g: 255, b: 255 }
  }

  $: dispatch('brushChange', brush)
  onMount(async () => {
    dispatch('brushChange', brush)
    await import('@shoelace-style/shoelace/dist/components/color-picker/color-picker.js')
    applyCustomStyles(colorPicker)
  })

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
      lightness: parseInt(target.lightness),
      rgb: hexToRgb(col.slice(0, 7))
    }
    myPresence.update({ tool: 'brush' })
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
