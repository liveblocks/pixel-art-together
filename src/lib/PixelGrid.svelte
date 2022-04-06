<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { useHistory, useMyPresence } from "../lib-liveblocks";
  import IconButton from "$lib/IconButton.svelte";
  import { debounce } from "$lib/utils/debounce";
  import type { Layer } from "../types";
  import { Direction } from "../types";
  import panzoom from "panzoom";

  export let layers: Layer[] = [];
  export let showGrid: boolean = false;
  export let showMove: boolean = false;
  export let mainPanelElement;

  const dispatch = createEventDispatcher();
  const myPresence = useMyPresence();

  let mainPanelWrapper;
  let layersCache = layers;

  // Width and height
  const cols = layers[0].grid.length;
  const rows = layers[0].grid[0].length;

  let mouseIsDown = false;

  let panElement;
  let panInstance;
  let panning = false;

  const history = useHistory();

  $: {
    if (panInstance) {
      panInstance[panning ? "resume" : "pause"]();
    }
  }

  onMount(() => {
    // Add panning support to canvas (hold space to pan)
    panInstance = panzoom(panElement);
    panning = false;

    fixAspectRatioSupport();
    window.addEventListener("resize", fixAspectRatioSupport);
    window.addEventListener("orientationchange", fixAspectRatioSupport);
  });

  let previousHoveredPixel = null;

  function handleKeyDown({ code }) {
    if (panInstance && code === "Space") {
      panning = true;
    }
  }

  function handleKeyUp({ code }) {
    if (panInstance && code === "Space") {
      panning = false;
    }
  }

  // Change pixel if not panning
  function pixelChange({ col, row, hex }) {
    if (panning) {
      return;
    }

    dispatch("pixelChange", {
      col,
      row,
      hex,
    });
  }

  // Move layer event
  const layerMove = debounce(
    function (direction) {
      dispatch("layerMove", {
        direction,
      });
    },
    100,
    true
  );

  function handleMouseDown() {
    mouseIsDown = true;
    history.pause();
  }

  function handleMouseUp() {
    mouseIsDown = false;
    history.resume();
  }

  // If mouse down, change pixel
  function handleMouseMove({ target, col, row, hex }) {
    if (!mouseIsDown || previousHoveredPixel === target) {
      return;
    }

    previousHoveredPixel = target;
    pixelChange({ col, row, hex });
  }

  // On touch move, take hovered col/row from data-col/data-row and pass to handleMouseMove
  function handleTouchMove(event, { hex }) {
    event.preventDefault();
    const location =
      event?.touches?.[0] ||
      event?.changedTouches?.[0] ||
      event?.targetTouches?.[0];
    const target = document.elementFromPoint(
      location.clientX,
      location.clientY
    );

    // @ts-ignore
    if (target?.dataset?.col && target?.dataset?.row) {
      // @ts-ignore
      const { col, row } = target.dataset;
      handleMouseMove({ target, hex, col, row });
    }
  }

  // Fallback for browsers that don't support CSS `aspect-ratio` (CSS fallback not possible here)
  function fixAspectRatioSupport() {
    if (CSS.supports("aspect-ratio", `${rows} / ${cols}`)) {
      return;
    }

    console.warn("CSS aspect-ratio not supported, using fallback");

    const maxWidth = parseInt(getComputedStyle(mainPanelWrapper).maxWidth);
    const currentWidth = mainPanelWrapper.offsetWidth;

    const { paddingTop, paddingRight, paddingBottom, paddingLeft } =
      getComputedStyle(panElement);
    const { offsetHeight, offsetWidth } = panElement;

    const wrapperWidth =
      offsetWidth - parseFloat(paddingRight) - parseFloat(paddingLeft);
    const wrapperHeight =
      offsetHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);

    const wrapperRatio = wrapperWidth / wrapperHeight;
    const artRatio = rows / cols;

    let width;
    let height;

    if (wrapperRatio > artRatio) {
      if (wrapperHeight * artRatio > maxWidth) {
        width = "100%";
        height = maxWidth * artRatio + "px";
      } else {
        height = "100%";
        width = wrapperHeight * artRatio + "px";
      }
    } else {
      if (wrapperWidth * artRatio > maxWidth) {
        height = currentWidth / artRatio + "px";
        width = "100%";
      } else {
        height = wrapperWidth / artRatio + "px";
        width = "100%";
      }
    }

    mainPanelWrapper.style.height = height;
    mainPanelWrapper.style.width = width;
  }
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div
  class="focus-visible-style absolute inset-0 touch-none"
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:touchend={handleMouseUp}
  on:touchstart={handleMouseDown}
  style="cursor: {!panning ? 'crosshair' : mouseIsDown ? 'grabbing' : 'grab'}"
>
  <div
    bind:this={panElement}
    class="absolute inset-0 flex items-center justify-center p-12"
  >
    <div
      bind:this={mainPanelWrapper}
      class="items-middle relative flex h-full max-h-full w-full max-w-2xl justify-center"
    >
      <!-- Handle all events on canvas using CSS grid and HTML elements -->
      <div
        bind:this={mainPanelElement}
        class="absolute inset-0 m-auto max-h-full max-w-full"
        style="aspect-ratio: {rows} / {cols};"
      >
        <div
          class="absolute inset-0 grid select-none"
          style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr)); transform: translateZ(0); gap: 0;"
        >
          {#each layersCache[0].grid as row, i}
            {#each row as pixel, j}
              <div
                data-row={i}
                data-col={j}
                on:click={() =>
                  pixelChange({ col: j, row: i, hex: pixel.color })}
                on:mousemove={({ target }) =>
                  handleMouseMove({ target, col: j, row: i, hex: pixel.color })}
                on:touchmove={(event) =>
                  handleTouchMove(event, { col: j, row: i, hex: pixel.color })}
                class="transparent-bg-pixel relative h-full w-full pt-[100%]"
              ></div>
            {/each}
          {/each}
        </div>

        <!-- Updatable SVG display of canvas -->
        <div class="pointer-events-none absolute inset-0 isolate">
          <svg
            class="mx-auto h-full max-w-full"
            id="svg-image"
            viewBox="0 0 {(rows / cols) * 100} 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {#each layers as layer (layer.id)}
              <!-- @const does calculation once instead of 4 times for each pixel -->
              {@const colsIn100 = 100 / cols}

              <!-- A single layer -->
              <g
                style="mix-blend-mode: {layer.blendMode};"
                opacity={layer.hidden ? 0 : layer.opacity}
              >
                {#each layer.grid as row, rowIndex}
                  {#each row as pixel, colIndex}
                    <rect
                      shape-rendering="optimizeSpeed"
                      x={colIndex * colsIn100}
                      y={rowIndex * colsIn100}
                      width={colsIn100}
                      height={colsIn100}
                      fill={pixel?.color || ""}
                      class="transition-colors duration-75"
                    />
                  {/each}
                {/each}
              </g>
            {/each}
          </svg>
        </div>

        <!-- Grid overlay -->
        {#if showGrid}
          <div
            transition:fade={{ duration: 100 }}
            class="pointer-events-none absolute inset-0 select-none opacity-50 mix-blend-difference"
          >
            <svg
              class="absolute inset-0"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  x="-0.5"
                  y="-0.5"
                  id="grid"
                  width="{100 / rows}%"
                  height="{100 / cols}%"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    shape-rendering="crispEdges"
                    d="M 1000 0 L 0 0 0 1000"
                    fill="none"
                    stroke-dasharray="3,3"
                    stroke="white"
                    stroke-width="2"
                  />
                </pattern>
              </defs>
              <rect
                shape-rendering="crispEdges"
                width="100%"
                height="100%"
                fill="url(#grid)"
                class=""
              />
            </svg>
          </div>
        {/if}

        {#if $myPresence}
          <div
            class="absolute bottom-full left-0 mb-1.5 text-sm font-bold uppercase tracking-wider text-gray-500 md:hidden"
          >
            Layer {$myPresence.selectedLayer}
          </div>
        {/if}

        {#if showMove}
          <div
            class="pointer-events-none absolute -inset-5 flex flex-col items-stretch"
            transition:fade={{ duration: 100 }}
          >
            <div class="pointer-events-auto flex items-center justify-center">
              <IconButton
                screenReader="Move up"
                on:click={() => layerMove(Direction.Up)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </IconButton>
            </div>
            <div class="flex flex-grow items-center justify-between">
              <div class="pointer-events-auto">
                <IconButton
                  screenReader="Move left"
                  on:click={() => layerMove(Direction.Left)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </IconButton>
              </div>
              <div class="pointer-events-auto">
                <IconButton
                  screenReader="Move right"
                  on:click={() => layerMove(Direction.Right)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </IconButton>
              </div>
            </div>
            <div class="pointer-events-auto flex items-center justify-center">
              <IconButton
                screenReader="Move down"
                on:click={() => layerMove(Direction.Down)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
