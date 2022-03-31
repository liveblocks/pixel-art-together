<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { useMyPresence } from "../lib-liveblocks";
  import type { Brush } from "../types";

  export let swatch: string[] = [];

  const dispatch = createEventDispatcher();
  const myPresence = useMyPresence();

  let colorPicker: { getFormattedValue, swatches };
  let colorValue: string = "";

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
    colorPicker.swatches = swatch;
  });

  $: if (colorPicker) {
    colorPicker.swatches = swatch;
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

  function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
</script>

<sl-color-picker
  bind:this={colorPicker}
  class="mobile-color-picker"
  on:sl-change={colorChange}
  opacity
  value={colorValue}
></sl-color-picker>

<style>
  .mobile-color-picker::part(base) {
    margin-bottom: 20px;
    margin-right: -10px;
  }
</style>
