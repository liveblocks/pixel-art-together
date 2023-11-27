<script lang="ts">
  import { slide } from "svelte/transition";
  import {
    useBatch,
    useMyPresence,
    useObject,
    useRoom,
  } from "../lib-liveblocks";
  import { createEventDispatcher, onMount } from "svelte";
  import { generateLayer } from "$lib/utils/generateLayer";
  import { blendModes } from "$lib/utils/blendModes";
  import { debounce } from "$lib/utils/debounce";
  import type { Layer } from "../types";

  export let layers: Layer[] = [];
  export let maxPixels: number = 2600;

  const dispatch = createEventDispatcher();
  const myPresence = useMyPresence();
  const room = useRoom();
  const batch = useBatch();

  const layerStorage = useObject("layerStorage");
  const pixelStorage = useObject("pixelStorage");

  const layerPixelCount = layers[0].grid.length * layers[0].grid[0].length;
  $: willExceedPixelCount = (layers.length + 1) * layerPixelCount > maxPixels;

  onMount(async () => {
    import("@shoelace-style/shoelace/dist/components/menu-item/menu-item.js");
    import("@shoelace-style/shoelace/dist/components/menu/menu.js");
    import("@shoelace-style/shoelace/dist/components/dropdown/dropdown.js");
    await import("@shoelace-style/shoelace/dist/components/range/range.js");
    rangeElement.tooltipFormatter = (value) => `Opacity: ${value}%`;
  });

  function getLayerIndexFromSelected() {
    if ($myPresence) {
      return layers.findIndex(
        (layer) => layer.id === $myPresence.selectedLayer
      );
    }
    return 0;
  }

  let rangeElement;
  let blendText;

  $: {
    if (rangeElement) {
      rangeElement.value =
        layers[getLayerIndexFromSelected()]?.opacity * 100 || 0;
    }
  }

  let addingNewLayer = false;

  // When layers update, make sure a layer is still selected
  $: whenLayersUpdate($layerStorage, $myPresence?.selectedLayer);

  function whenLayersUpdate(_, __) {
    if (
      $layerStorage &&
      $myPresence &&
      $myPresence.selectedLayer !== undefined
    ) {
      const currentLayer = $myPresence.selectedLayer;

      if (!$layerStorage.get(currentLayer + "") && !addingNewLayer) {
        const tempLayers = Object.values($layerStorage.toObject());
        const newLayer =
          tempLayers[tempLayers.length > 0 ? tempLayers.length - 1 : 0].id;
        myPresence.update({ selectedLayer: newLayer });
      }

      dispatch("layerChange", $myPresence.selectedLayer);
    }
  }

  // Update current layer blend mode on change
  async function handleBlendModeChange({ detail }) {
    if (!$myPresence) {
      return;
    }

    const index = $myPresence.selectedLayer;
    const oldLayer = $layerStorage.get("" + index);
    const newLayer = { ...oldLayer, blendMode: detail.item.dataset.value };
    $layerStorage.set("" + $myPresence.selectedLayer, newLayer);

    blendText.innerText = detail.item.dataset.value;
  }

  // Update current layer opacity on change
  const handleOpacityChange = debounce(
    async function ({ target }) {
      if (!$myPresence) {
        return;
      }

      const firstIndex = $myPresence.selectedLayer;
      const oldLayer = $layerStorage.get("" + firstIndex);
      const newLayer = { ...oldLayer, opacity: target.__value / 100 };
      $layerStorage.set("" + $myPresence.selectedLayer, newLayer);
    },
    100,
    false
  );

  // Toggle visibility of current layer
  function toggleVisibility(layerId, event) {
    if (event) {
      event.stopPropagation();
    }

    const oldLayer = $layerStorage.get("" + layerId);
    const newLayer = { ...oldLayer, hidden: !oldLayer.hidden };
    $layerStorage.set(layerId, newLayer);
  }

  // Adds new layer to top of stack
  function addLayer() {
    let newId = 0;
    Object.values($layerStorage.toObject()).map((layer) => {
      if (layer.id > newId) {
        newId = layer.id;
      }
    });
    newId++;

    const generatedLayer = generateLayer({
      layer: newId,
      cols: layers[0].grid[0].length,
      rows: layers[0].grid.length,
      defaultValue: "",
    });

    // Batching changes means one undo click will reverse all
    batch(() => {
      $pixelStorage.update({ ...generatedLayer });
      $layerStorage.set("" + newId, {
        id: newId,
        opacity: 1,
        blendMode: "normal",
        hidden: false,
      });
      addingNewLayer = true;
      myPresence?.update({ selectedLayer: newId });
    });
    setTimeout(() => (addingNewLayer = false));
  }

  // Deletes layer using `id`
  function deleteLayer(id, event) {
    if (event) {
      event.stopPropagation();
    }

    if (Object.values($layerStorage.toObject()).length > 1) {
      batch(() => {
        $layerStorage.delete("" + id);
        for (let row = 0; row < layers[0].grid.length; row++) {
          for (let col = 0; col < layers[0].grid[0].length; col++) {
            $pixelStorage.delete(`${id}_${row}_${col}`);
          }
        }
      })
      selectTopLayer();
    }
  }

  // Changes to layer using `id`
  function changeLayer(id) {
    myPresence?.update({ selectedLayer: id });
    if (blendText) {
      blendText.innerText =
        layers[getLayerIndexFromSelected()]?.blendMode || "normal";
    }
    if (rangeElement) {
      rangeElement.value =
        layers[getLayerIndexFromSelected()]?.opacity * 100 || 100;
    }
  }

  // Selects the top layer
  function selectTopLayer() {
    if ($layerStorage && myPresence) {
      const firstLayer = Object.values($layerStorage.toObject())[0].id;
      myPresence?.update({ selectedLayer: firstLayer });
    }
  }
</script>

<div class="border-t-2 border-gray-100 p-5 text-sm">
  <div class="pb-3 font-semibold text-gray-500">Layers</div>
  <div class="select-none text-sm text-gray-700">
    <div class="rounded-[4px] border border-[#D4D4D8]">
      <!-- Blend/opacity bar -->
      {#if $layerStorage && $myPresence}
        <div class="items-middle relative z-10 flex justify-between border-b">
          <label for="blend-mode-changer" class="sr-only"
            >Change blend mode</label
          >

          <sl-dropdown
            id="blend-mode-changer"
            on:sl-select={handleBlendModeChange}
          >
            <sl-button
              class="focus-visible:z-10"
              variant="text"
              slot="trigger"
              caret
            >
              <sl-tooltip content="Blend mode">
                <span class="capitalize" bind:this={blendText}>
                  {layers[getLayerIndexFromSelected()]?.blendMode || "normal"}
                </span>
              </sl-tooltip>
            </sl-button>
            <sl-menu class="relative z-10">
              {#each blendModes as mode ("blendModes" + mode.name)}
                <sl-menu-item data-value={mode.name}>
                  <div class="text-sm">{mode.label}</div>
                </sl-menu-item>
              {/each}
            </sl-menu>
          </sl-dropdown>

          <div class="flex max-w-[140px] items-center justify-center pr-4">
            <label for="opacity-changer" class="sr-only">Change opacity</label>
            <sl-range
              id="opacity-changer"
              on:sl-change={handleOpacityChange}
              bind:this={rangeElement}
            ></sl-range>
          </div>
        </div>
      {/if}

      <!-- New layer bar -->
      {#if !willExceedPixelCount}
        <button
          class="focus-visible-style group relative flex w-full cursor-pointer select-none bg-gray-50 px-2 py-2.5 focus-visible:z-10"
          on:click={addLayer}
        >
          <span
            class="pr-2 text-gray-400 transition-colors group-hover:text-gray-600"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clip-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                fill-rule="evenodd"
              />
            </svg>
          </span>
          <span
            class="font-semibold text-gray-500 transition-colors group-hover:text-gray-700"
          >
            Add new layer
          </span>
        </button>
      {:else}
        <div
          class="relative block flex w-full select-none bg-gray-50 px-2 py-2.5 cursor-not-allowed"
        >
          <span
            class="pr-2 text-red-400 transition-colors group-hover:text-gray-600"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clip-rule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                fill-rule="evenodd"
              />
            </svg>
          </span>
          <span
            class="font-semibold text-red-500"
          >
            Pixel limit reached
          </span>
        </div>
      {/if}

      <!-- All layers -->
      <div class="flex flex-col-reverse">
        {#each layers as layer}
          <div
            transition:slide
            style={$myPresence?.selectedLayer === layer.id
              ? "background-color: var(--sl-color-primary-600); color: #fff;"
              : ""}
            class="group relative flex cursor-pointer items-center justify-between gap-1 border-t py-0.5 hover:bg-[color:var(--sl-color-primary-50)] {$myPresence?.selectedLayer ===
            layer.id
              ? 'bg-gray-100 font-semibold'
              : 'bg-white'}"
          >
            <button
              class="focus-visible-style absolute inset-0 block w-full transition-all focus-visible:z-10"
              on:click={() => changeLayer(layer.id)}
            >
              <span class="sr-only">Select layer {layer.id}</span>
            </button>

            <div class="relative flex items-center">
              <sl-tooltip content={layer.hidden ? "Show" : "Hide"}>
                <button
                  on:click={(e) => toggleVisibility(layer.id, e)}
                  class="focus-visible-style focus-visible:!opacity-100 {$myPresence?.selectedLayer ===
                  layer.id
                    ? 'text-[color:var(--sl-color-primary-200)] hover:!text-white'
                    : ''} cursor-pointer p-2 text-gray-400 hover:text-gray-600"
                >
                  {#if !layer.hidden}
                    <span class="sr-only">Hide layer {layer.id}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  {:else}
                    <span class="sr-only">Show layer {layer.id}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clip-rule="evenodd"
                      />
                      <path
                        d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                      />
                    </svg>
                  {/if}
                </button>
              </sl-tooltip>

              <span
                class="font-medium {$myPresence?.selectedLayer === layer.id
                  ? 'font-bold'
                  : ''}">Layer {layer.id}</span
              >
            </div>
            <div>
              {Math.round(layer.opacity * 100)}%, {layer.blendMode}
            </div>

            <sl-tooltip content="Delete" placement="top">
              <button
                on:click={() => deleteLayer(layer.id)}
                class="focus-visible-style relative {$myPresence?.selectedLayer ===
                layer.id
                  ? 'text-[color:var(--sl-color-primary-200)] hover:!text-white'
                  : ''} cursor-pointer p-2 text-gray-400 hover:text-gray-600"
              >
                <span class="sr-only">Delete layer {layer.id}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </sl-tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
