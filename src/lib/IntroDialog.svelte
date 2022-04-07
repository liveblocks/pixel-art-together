<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import logo from "../../static/logo.svg";

  export let shouldCreateCanvas: boolean = false;
  export let loading: boolean = true;

  const dispatch = createEventDispatcher();
  let dialog;

  // Min and max width/height for canvas
  let pixelSizeMin: number = 2;
  let pixelSizeMax: number = 48;

  // Default name and sizes
  let name: string = localStorage.getItem("name") || "";
  let width: number = 16;
  let height: number = 16;

  // Prevent dialog closing
  function cancelClose(event) {
    event.preventDefault();
  }

  // Submit dialog events
  function submitDialog() {
    if (shouldCreateCanvas) {
      dispatch("createCanvas", { name, width, height });
    } else {
      dispatch("setName", { name });
    }
    localStorage.setItem("name", name);
  }

  // Submit dialog when return key pressed in input
  function handleInputKeyDown({ code }) {
    if (code === "Enter") {
      setTimeout(() => submitDialog(), 20);
    }
  }

  // Load components, prevent closing
  onMount(async () => {
    await import("@shoelace-style/shoelace/dist/components/dialog/dialog.js");

    if (dialog) {
      dialog.addEventListener("sl-request-close", cancelClose);
    }

    await import("@shoelace-style/shoelace/dist/components/range/range.js");
  });

  onDestroy(() => {
    if (dialog) {
      dialog.removeEventListener("sl-request-close", cancelClose);
    }
  });
</script>

<sl-dialog
  bind:this={dialog}
  label="Create a pixel canvas"
  no-header
  open
  style="--width: 300px;"
>
  <div class="flex flex-col">
    <h1 class="mt-2.5 text-2xl">
      <img
        alt="Pixel art together"
        class="mx-auto block max-w-full"
        src={logo}
      />
    </h1>

    <sl-input
      class="mt-5"
      on:keydown={handleInputKeyDown}
      on:sl-input={(e) => (name = e.target.value)}
      placeholder="Enter your name"
      value={name}
    >
      <div class="pb-1.5 text-sm font-semibold text-gray-500" slot="label">
        Name
      </div>
    </sl-input>

    {#if shouldCreateCanvas && !loading}
      <div class="mt-5 flex items-end gap-4">
        <div class="flex-shrink flex-grow">
          <sl-range
            min={pixelSizeMin}
            max={pixelSizeMax}
            value={height}
            on:sl-change={(e) => (height = e.target.__value)}
          >
            <div slot="label" class="pb-1 text-sm font-semibold text-gray-500">
              Height
            </div>
          </sl-range>
        </div>
        <div class="w-6 text-right text-lg font-medium text-gray-600">
          {height}
        </div>
      </div>

      <div class="mb-2 mt-5 flex items-end gap-4">
        <div class="flex-shrink flex-grow">
          <sl-range
            min={pixelSizeMin}
            max={pixelSizeMax}
            value={width}
            on:sl-change={(e) => (width = e.target.__value)}
          >
            <div slot="label" class="pb-1 text-sm font-semibold text-gray-500">
              Width
            </div>
          </sl-range>
        </div>
        <div class="w-6 text-right text-lg font-medium text-gray-600">
          {width}
        </div>
      </div>
    {/if}

    <sl-button class="mt-5" {loading} on:click={submitDialog} variant="primary">
      {shouldCreateCanvas ? "Create canvas" : "Set name"}
    </sl-button>
  </div>
</sl-dialog>
