<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { useHistory, useMyPresence } from "../lib-liveblocks";
  import type { Layer } from "../types";
  import panzoom from "panzoom";

  export let layers: Layer[] = [];
  export let showGrid: boolean = false;
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

  function handleKeyDown ({ code }) {
    if (panInstance && code === "Space") {
      panning = true;
    }
  }

  function handleKeyUp ({ code }) {
    if (panInstance && code === "Space") {
      panning = false;
    }
  }

  // Change pixel if not panning
  function pixelChange ({ col, row, hex }) {
    if (panning) {
      return;
    }

    dispatch("pixelChange", {
      col,
      row,
      hex,
    });
  }

  function handleMouseDown () {
    mouseIsDown = true;
    history.pause();
  }

  function handleMouseUp () {
    mouseIsDown = false;
    history.resume();
  }

  // If mouse down, change pixel
  function handleMouseMove ({ target, col, row, hex }) {
    if (!mouseIsDown || previousHoveredPixel === target) {
      return;
    }

    previousHoveredPixel = target;
    pixelChange({ col, row, hex });
  }

  // On touch move, take hovered col/row from data-col/data-row and pass to handleMouseMove
  function handleTouchMove (event, { hex }) {
    event.preventDefault();
    const location = event?.touches?.[0] || event?.changedTouches?.[0] || event?.targetTouches?.[0];
    const target = document.elementFromPoint(location.clientX, location.clientY);

    // @ts-ignore
    if (target?.dataset?.col && target?.dataset?.row) {
      // @ts-ignore
      const { col, row } = target.dataset;
      handleMouseMove({ target, hex, col, row });
    }
  }

  // Fallback for browsers that don't support CSS `aspect-ratio` (CSS fallback not possible here)
  function fixAspectRatioSupport () {
    if (CSS.supports("aspect-ratio", `${rows} / ${cols}`)) {
      return;
    }

    console.warn("CSS aspect-ratio not supported, using fallback");

    const maxWidth = parseInt(getComputedStyle(mainPanelWrapper).maxWidth);
    const currentWidth = mainPanelWrapper.offsetWidth;

    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(panElement);
    const { offsetHeight, offsetWidth } = panElement;

    const wrapperWidth = offsetWidth - parseFloat(paddingRight) - parseFloat(paddingLeft);
    const wrapperHeight = offsetHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);

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
  class="absolute inset-0 touch-none focus-visible-style"
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:touchend={handleMouseUp}
  on:touchstart={handleMouseDown}
  style="cursor: {!panning ? 'crosshair' : mouseIsDown ? 'grabbing' : 'grab' }"
>
  <div
    bind:this={panElement}
    class="absolute inset-0 flex justify-center items-center p-12"
  >
    <div
      bind:this={mainPanelWrapper}
      class="relative w-full h-full max-h-full max-w-2xl flex justify-center items-middle"
    >

      <!-- Handle all events on canvas using CSS grid and HTML elements -->
      <div
        bind:this={mainPanelElement}
        class="absolute inset-0 max-w-full max-h-full m-auto"
        style="aspect-ratio: {rows} / {cols};"
      >
        <div
          class="grid absolute inset-0 select-none"
          style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); grid-template-rows: repeat({cols}, minmax(0, 1fr)); transform: translateZ(0); gap: 0;"
        >
          {#each layersCache[0].grid as row, i}
            {#each row as pixel, j}
              <div
                data-row={i}
                data-col={j}
                on:click={() => pixelChange({ col: j, row: i, hex: pixel.color })}
                on:mousemove={({ target }) => handleMouseMove({ target, col: j, row: i, hex: pixel.color })}
                on:touchmove={(event) => handleTouchMove(event, { col: j, row: i, hex: pixel.color })}
                class="transparent-bg-pixel w-full h-full relative pt-[100%]"
              ></div>
            {/each}
          {/each}
        </div>

        <!-- Updatable SVG display of canvas -->
        <div class="absolute inset-0 pointer-events-none isolate">
          <svg class="max-w-full mx-auto h-full" id="svg-image" viewBox="0 0 {rows / cols * 100} 100" xmlns="http://www.w3.org/2000/svg">
            {#each layers as layer (layer.id)}
              <g style="mix-blend-mode: {layer.blendMode};" opacity={layer.hidden ? 0 : layer.opacity}>
                {#each layer.grid as row, rowIndex}
                  {#each row as pixel, colIndex}
                    <rect
                      shape-rendering="optimizeSpeed"
                      x={colIndex * (100 / cols)}
                      y={rowIndex * (100 / cols)}
                      width={100 / cols}
                      height={100 / cols}
                      fill={pixel?.color || ''}
                      class="transition-colors duration-75"
                    ></rect>
                  {/each}
                {/each}
              </g>
            {/each}
          </svg>
        </div>

        <!-- Grid overlay -->
        {#if showGrid}
          <div class="absolute inset-0 select-none pointer-events-none opacity-50 mix-blend-difference">
            <svg class="absolute inset-0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern x="-0.5" y="-0.5" id="grid" width="{100 / rows}%" height="{100 / cols}%" patternUnits="userSpaceOnUse">
                  <path shape-rendering="crispEdges" d="M 1000 0 L 0 0 0 1000" fill="none" stroke-dasharray="3,3" stroke="white" stroke-width="2" />
                </pattern>
              </defs>
              <rect shape-rendering="crispEdges" width="100%" height="100%" fill="url(#grid)" class="" />
            </svg>
          </div>
        {/if}

        {#if $myPresence}
          <div class="md:hidden absolute bottom-full left-0 mb-1.5 font-bold uppercase text-sm text-gray-500 tracking-wider">
            Layer {$myPresence.selectedLayer}
          </div>
        {/if}

      </div>
    </div>
  </div>
</div>
