<script lang="ts">
  import { spring } from "svelte/motion";
  import { contrastingTextColour } from "$lib/utils/contrastingTextColour";
  import type { Brush } from "../types";
  import { Tool } from "../types";

  export let x: number = 100;
  export let y: number = 100;
  export let color: Brush;
  export let tool: Tool = Tool.Brush;
  export let name: string = "";
  export let shrink: boolean = false;

  // Spring animation for cursor
  let coords = spring(
    { x, y },
    {
      stiffness: 0.07,
      damping: 0.35,
    }
  );

  // Update spring when x and y change
  $: {
    coords.set({ x, y });
  }

  // Should text be black or white on this colour
  let blackText: boolean = true;
  $: blackText = contrastingTextColour(color.rgb);
</script>

<div
  class="absolute -top-4 -left-4"
  style={`transform: translateX(${$coords.x}px) translateY(${$coords.y}px)`}
>
  <div
    class="inner-border absolute top-7 left-7 origin-top-left overflow-hidden whitespace-nowrap rounded-full text-sm font-medium drop-shadow-sm transition-transform duration-150 {shrink
      ? 'scale-95'
      : ''}"
  >
    <div
      class="flex px-2.5 py-1.5 mix-blend-luminosity {blackText
        ? 'text-gray-800'
        : 'text-gray-200'}"
      style="background-color: {color.color.slice(0, 7)};"
    >
      <!-- Current tool icon -->
      <div class="mr-2 w-3">
        <div class="absolute top-2">
          {#if tool === Tool.Brush}
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"
              />
            </svg>
          {/if}
          {#if tool === Tool.Eraser}
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"
              />
            </svg>
          {/if}
          {#if tool === Tool.Fill}
            <svg class="-ml-0.5 h-5 w-5 scale-x-[-1]" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"
              />
            </svg>
          {/if}
        </div>
      </div>

      <!-- Current user's name -->
      {name}
    </div>
  </div>

  <!-- Cursor icon -->
  <div class="absolute top-0 left-0 block">
    <svg class="block h-10 w-10 scale-75">
      <path
        d="M8.482,0l8.482,20.36L8.322,17.412,0,20.36Z"
        fill="currentColor"
        transform="translate(11 22.57) rotate(-48)"
      />
    </svg>
  </div>
</div>
