<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { useMyPresence } from "../lib-liveblocks";
  import type { Brush } from "../types";

  // Allows changing color value outside of component
  let colorValue: string = "";
  export let updateColor = (hex: string) => colorValue = hex;

  export let swatch: string[] = [];

  const dispatch = createEventDispatcher();
  const myPresence = useMyPresence();

  let colorPicker: { getFormattedValue, swatches };

  // Default brush
  let brush: Brush = {
    opacity: 100,
    hue: 0,
    saturation: 0,
    color: "#000",
    lightness: 0,
    rgb: { r: 255, g: 255, b: 255 },
  };

  // Change brush event on any brush changes
  $: dispatch("brushChange", brush);
  onMount(async () => {
    dispatch("brushChange", brush);
    await import("@shoelace-style/shoelace/dist/components/color-picker/color-picker.js");
    applyCustomStyles(colorPicker);
  });

  $: if (colorPicker) {
    colorPicker.swatches = swatch;
  }


  // Workaround for custom elements
  function applyCustomStyles (host) {
    const style = document.createElement("style");
    style.innerHTML = `
      .color-picker__controls, .color-picker__user-input, .color-picker__swatches { padding-left: 0 !important; padding-right: 0 !important; }
      .color-picker__grid { border-radius: 4px !important; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2); }
      .color-picker__swatches { border-top: 0; padding-top: 2px; }
    `;
    host.shadowRoot.appendChild(style);
    host.swatches = swatch;
  }

  // When color changes, update presence
  function colorChange ({ target }) {
    let col = target.value;
    if (col[0] !== "#") {
      col = colorPicker.getFormattedValue("hex");
    }
    brush = {
      color: col,
      opacity: parseInt(target.alpha),
      hue: parseInt(target.hue),
      saturation: parseInt(target.saturation),
      lightness: parseInt(target.lightness),
      rgb: hexToRgb(col.slice(0, 7)),
    };
    if ($myPresence.tool === "eraser") {
      myPresence.update({ tool: "brush" });
    }
  }

  // "#00ff00" => { r: 0, g: 255, b: 0 }
  function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
</script>

<div class="p-5 pb-2">
  <div class="text-sm font-semibold pb-3 text-gray-500">Colour</div>
  <div>
    <sl-color-picker
      bind:this={colorPicker}
      inline
      on:sl-change={colorChange}
      opacity
      value={colorValue}
    ></sl-color-picker>
  </div>
</div>
