<script lang="ts">
  import { fade } from "svelte/transition";
  import { spring } from "svelte/motion";
  import { getMovePixels } from "$lib/utils/getMovePixels";
  import { generateLayer } from "$lib/utils/generateLayer";
  import { getFillPixels } from "$lib/utils/getFillPixels";
  import { formatLayers } from "$lib/utils/formatLayers";
  import MobileColorPicker from "$lib/MobileColorPicker.svelte";
  import MobileLinksPanel from "$lib/MobileLinksPanel.svelte";
  import ExportsPanel from "$lib/ExportsPanel.svelte";
  import IntroDialog from "$lib/IntroDialog.svelte";
  import LayersPanel from "$lib/LayersPanel.svelte";
  import BrushPanel from "$lib/BrushPanel.svelte";
  import UserOnline from "$lib/UserOnline.svelte";
  import IconButton from "$lib/IconButton.svelte";
  import SharePanel from "$lib/SharePanel.svelte";
  import LinksPanel from "$lib/LinksPanel.svelte";
  import PixelGrid from "$lib/PixelGrid.svelte";
  import { Direction, Tool } from "./types";
  import Cursor from "$lib/Cursor.svelte";
  import {
    useMyPresence,
    useObject,
    useOthers,
    useRedo,
    useSelf,
    useUndo,
  } from "./lib-liveblocks";

  /**
   * PIXEL ART TOGETHER is a multiplayer pixel editor. It works by using
   * Liveblocks (https://liveblocks.io), a set of tools helpful for
   * building collaborative experiences.
   *
   * This tool has a number of features including:
   * - Different drawing tools
   * - Undo/redo
   * - Layers panel
   * - Blend modes/opacity on layers
   * - Export art as SVG/PNG
   * - Panning on canvas
   * - Grid overlay
   * - Multiplayer cursors
   * Liveblocks also allows
   */

  // ================================================================================
  // SETUP

  /**
   * Liveblocks allows each user to have "presence", essentially a set of
   * properties specific to that users. An example would be the colour they've
   * selected, or their cursor's location in coordinates. We can then use
   * "others", a list of every other user's "presence", to build an app. We
   * can use our custom hooks to watch and edit these.
   *
   * This Svelte example uses a set of custom Svelte hooks (inside the
   * `src/lib-liveblocks` directory), based on the Liveblocks React library:
   * https://liveblocks.io/docs/api-reference/liveblocks-react
   */

  const myPresence = useMyPresence();
  const others = useOthers();
  const self = useSelf();

  // Set a default value for presence
  myPresence.update({
    name: "",
    selectedLayer: 0,
    cursor: null,
    tool: "brush",
    mouseDown: false,
  });

  /**
   * Liveblocks also allows for storage, essentially stored objects and arrays
   * that are automatically updated for all users when they are changed. In
   * this project, we're using two LiveObjects, a type of storage, to contain
   * the colours of each pixel, and the state of each layer,
   */

  // Two LiveObjects that will store the layer info and pixels
  // These are Svelte stores and can be accessed with a `$` prefix
  const layerStorage = useObject("layerStorage");
  const pixelStorage = useObject("pixelStorage");

  // ================================================================================
  // FORMAT LAYERS AND PIXELS

  /**
   * Pixels are stored inside pixelStorage as individual properties in an object
   * A red pixel on layer 0, row 1, column 2:
   *
   * $pixelStorage = {
   *   0_1_2: { color: 'red' },
   *   // ...
   *   }
   */

  // A key for a pixel, e.g. '0_1_2'
  type PixelKey = string;

  type PixelObject = {
    layer: number;
    row: number;
    col: number;
    value?: object;
  };

  // Convert a pixel object into a pixel key
  const pixelToKey = ({
    layer = $myPresence.selectedLayer,
    row,
    col,
  }: PixelObject): PixelKey => `${layer}_${row}_${col}`;

  // Convert a pixel key into a pixel object
  const keyToPixel = (key: PixelKey): PixelObject => {
    const [layer, row, col] = key.split("_").map((num) => parseInt(num));
    return { layer, row, col };
  };

  // Get the current pixel, using a pixel object
  const getPixel = (pixelProps: PixelObject) => {
    return $pixelStorage.get(pixelToKey(pixelProps));
  };

  // Update an array of pixels, with the pixelArray.value object, or newObj if none set
  const updatePixels = (pixelArray: PixelObject[], newObj) => {
    const updatedPixels = {};
    pixelArray.forEach(
      (pixelProps) =>
        (updatedPixels[pixelToKey(pixelProps)] = pixelProps.value || newObj)
    );
    return $pixelStorage.update(updatedPixels);
  };

  // Every time pixelStorage or layerStorage updates, format layers into single array
  let layers = [];
  $: layers = formatLayers({
    pixelStorage: $pixelStorage?.toObject(),
    layerStorage: $layerStorage?.toObject(),
    keyToPixel,
    getPixel,
  });

  // If pixels stored in pixelStorage, canvas is ready to draw
  $: canvasReady = $pixelStorage
    ? Object.keys($pixelStorage.toObject()).length > 0
    : false;

  // ================================================================================
  // INTRO DIALOG

  let nameSet = false;

  // Set name inside presence
  function setName({ detail }) {
    myPresence.update({ name: detail.name });
    nameSet = true;
  }

  // Create canvas with dialog settings and default color
  function createCanvas({ detail }) {
    if ($pixelStorage?.update) {
      const defaultLayer = generateLayer({
        layer: 0,
        rows: detail.height,
        cols: detail.width,
        defaultObject: { color: "transparent" },
      });
      $pixelStorage.update(defaultLayer);
      $layerStorage.set(0, {
        id: 0,
        opacity: 1,
        blendMode: "normal",
        hidden: false,
      });
      setName({ detail });
    }
  }

  // ================================================================================
  // CANVAS

  // Functions that allow undoing and redoing storage changes
  const undo = useUndo();
  const redo = useRedo();

  // Is grid showing on canvas
  let showGrid = false;

  // Are move tools showing on canvas
  let showMove = false;

  // Will be bound to a function that allows the current color to be updated
  let updateBrushColor;

  // Recently used colors to be passed to the swatch
  let recentColors = new Array(16).fill("#ffffffff");

  // On brush component change, update presence with new brush
  function handleBrushChange({ detail }) {
    myPresence.update({ brush: detail });
  }

  // On pixel change, update pixels according to the current tool
  function handlePixelChange({ detail }) {
    if (!$myPresence?.brush?.color || !$pixelStorage) {
      return;
    }

    const tool: Tool = $myPresence.tool;
    const color = $myPresence.brush.color;
    const selected = $myPresence.selectedLayer;

    const currentPixel = {
      row: detail.row,
      col: detail.col,
      layer: selected,
    };

    // Current pixel
    let pixelsToChange = [currentPixel];

    // If fill tool, find neighbour pixels
    if (tool === Tool.Fill) {
      const currentLayer = layers.find((layer) => layer.id === selected);
      pixelsToChange = [
        ...pixelsToChange,
        ...getFillPixels(currentPixel, currentLayer.grid),
      ];
    }

    updatePixels(pixelsToChange, {
      color: tool === Tool.Eraser ? "transparent" : color,
    });

    if (!recentColors.includes(color)) {
      const a = recentColors;
      a.pop();
      a.unshift(color);
      recentColors = a;
    }
  }

  // Move pixels by 1 pixel in detail.direction Direction
  function handleLayerMove({ detail }) {
    if (!$myPresence?.brush?.color || !$pixelStorage || !canvasReady) {
      return;
    }

    const selected = $myPresence.selectedLayer;
    const movedLayer = getMovePixels({
      pixelStorage: $pixelStorage?.toObject(),
      detail,
      selected,
      keyToPixel,
    });

    updatePixels(movedLayer, { color: "transparent" });
  }

  // ================================================================================
  // LIVE CURSORS

  /**
   * Live cursor position is calculated according to which panel is currently being
   * used. The center panel uses a percentage value calculated from the middle of
   * the panel, whereas the two side panels use a pixel value from the top left
   * corner.
   */

  // The different panels
  const panels = {
    multiplayerPanel: null,
    mainPanel: null,
    toolsPanel: null,
  };

  // Pass current cursor position on panel, and current panel, to presence
  function handleMouseMove(event, area) {
    if (!panels[area] || !$myPresence) {
      return;
    }

    const { top, left, width, height } = panels[area].getBoundingClientRect();

    // Position from top left corner by default
    let x = Math.round(event.clientX - left);
    let y = Math.round(event.clientY - top + panels[area].scrollTop);

    // Percentage from center of element for main panel
    if (area === "mainPanel") {
      x = x / width;
      y = y / height;
    }

    myPresence.update({
      cursor: { x, y, area },
    });
  }

  // Reverse of above, find location of cursor according to coords and panel
  function calculateCursorPosition({ x, y, area }) {
    if (!panels?.[area]) {
      return;
    }

    const { top, left, width, height } = panels[area].getBoundingClientRect();
    let newX;
    let newY;

    if (area === "mainPanel") {
      // Percentage from center of element for main panel
      newX = left + width * x;
      newY = top + height * y;
    } else {
      // Position from top left corner otherwise
      newX = left + x;
      newY = top + y;
    }

    return { x: newX, y: newY };
  }

  // When the mouse leaves the page, set cursor presence to null
  function handleMouseLeave() {
    myPresence.update({
      cursor: null,
    });
  }

  // ================================================================================
  // MOBILE MENU

  let mobileMenuOpen = false;

  // Spring animation for mobile menu
  let mobileMenuTransform = spring(0, {
    stiffness: 0.07,
    damping: 0.4,
  });

  // When `mobileMenuOpen` changes, set spring value
  $: mobileMenuTransform.set(mobileMenuOpen ? 100 : 0);

  // ================================================================================
  // KEYBOARD SHORTCUTS

  // B for brush, F for fill, E for eraser, M for move, G for grid
  // Arrow keys to move layers if showMove truthy
  // Ctrl+Z for undo. Ctrl+Shift+Z and Ctrl+Y for redo.
  function handleKeyDown(event) {
    if (!event.ctrlKey && !event.metaKey) {
      if (event.key === "g") {
        showGrid = !showGrid;
        return;
      }

      if (event.key === "m") {
        showMove = !showMove;
        return;
      }

      // Change tool
      const toolKeys = {
        b: Tool.Brush,
        f: Tool.Fill,
        e: Tool.Eraser,
      };
      if ($myPresence && toolKeys[event.key]) {
        myPresence.update({ tool: toolKeys[event.key] });
        return;
      }

      // If move tool enabled, move layer with arrow keys
      const arrowKeys = {
        ArrowUp: Direction.Up,
        ArrowRight: Direction.Right,
        ArrowDown: Direction.Down,
        ArrowLeft: Direction.Left,
      };
      if (showMove && arrowKeys[event.key]) {
        const detail = { direction: arrowKeys[event.key] };
        handleLayerMove({ detail });
      }

      return;
    }

    // Undo/redo keys
    if (event.key.toLowerCase() === "z") {
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (event.key === "y") {
      redo();
    }
  }
</script>

<svelte:window
  on:keydown={handleKeyDown}
  on:pointerdown={() => myPresence.update({ mouseDown: true })}
  on:pointerup={() => myPresence.update({ mouseDown: false })}
/>

<!-- Live Cursors -->
<div class="pointer-events-none absolute inset-0 z-50">
  {#if $others}
    {#each [...$others] as { presence, info, connectionId } (connectionId)}
      {#if presence?.cursor && presence?.brush}
        <Cursor
          {...calculateCursorPosition(presence.cursor)}
          shrink={presence.mouseDown}
          color={presence.brush}
          tool={presence.tool}
          name={presence.name || info.name}
        />
      {/if}
    {/each}
  {/if}
</div>

<!-- Intro dialog -->
{#if !nameSet}
  <div class="absolute inset-0 z-50 flex items-center justify-center">
    <IntroDialog
      loading={!$pixelStorage}
      shouldCreateCanvas={!canvasReady}
      on:createCanvas={createCanvas}
      on:setName={setName}
    />
  </div>
{/if}

<!-- App -->
<div class="relative flex h-full min-h-full bg-white">
  <!-- Left panel, containing layers etc -->
  <div
    class="side-panel fixed right-full z-20 h-full w-auto flex-shrink-0 flex-grow-0 overflow-y-auto overflow-x-hidden border-gray-100 bg-white bg-white md:relative md:!relative md:right-auto md:z-10 md:!w-auto md:w-auto md:min-w-[320px] md:!translate-x-0 {mobileMenuOpen
      ? 'border-r-2 drop-shadow-xl'
      : ''}"
    id="tools-panel"
    style="transform: translateX({$mobileMenuTransform}%);"
  >
    {#if layers && canvasReady}
      <div
        bind:this={panels.toolsPanel}
        on:pointermove={(e) => handleMouseMove(e, "toolsPanel")}
        on:pointerleave={handleMouseLeave}
        transition:fade
        class="relative top-[-455px] flex h-full min-h-full flex-col md:top-0"
      >
        <BrushPanel
          on:brushChange={handleBrushChange}
          bind:updateColor={updateBrushColor}
          swatch={recentColors}
        />
        <LayersPanel {layers} />
        <ExportsPanel />
        <div class="-mt-2 mb-5 xl:hidden">
          <SharePanel />
        </div>
        <MobileLinksPanel />
      </div>
    {/if}
  </div>

  <!-- Center panel, containing canvas, undo/redo etc. -->
  <div
    class="main-panel relative flex flex-grow flex-col overflow-hidden bg-gray-100"
    id="main-panel"
    on:pointerleave={handleMouseLeave}
    on:pointermove={(e) => handleMouseMove(e, "mainPanel")}
  >
    {#if canvasReady}
      <!-- Tool bar above canvas -->
      <div
        transition:fade
        class="relative z-10 flex w-full flex-shrink-0 flex-grow-0 items-center justify-between border-2 border-t-0 border-gray-100 bg-white p-4"
      >
        <!-- Buttons: left side -->
        <div class="flex gap-3">
          <sl-button-group>
            <IconButton
              screenReader="Brush tool (B)"
              toggled={$myPresence.tool === Tool.Brush}
              on:click={() => myPresence.update({ tool: "brush" })}
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"
                />
              </svg>
            </IconButton>
            <IconButton
              screenReader="Eraser tool (E)"
              toggled={$myPresence.tool === Tool.Eraser}
              on:click={() => myPresence.update({ tool: "eraser" })}
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"
                />
              </svg>
            </IconButton>
            <IconButton
              screenReader="Fill tool (F)"
              toggled={$myPresence.tool === Tool.Fill}
              on:click={() => myPresence.update({ tool: "fill" })}
            >
              <svg class="mt-[6px] h-6 w-6 scale-x-[-1]" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"
                />
              </svg>
            </IconButton>
          </sl-button-group>
          <sl-button-group>
            <IconButton
              screenReader="Toggle grid (G)"
              toggled={showGrid}
              on:click={() => (showGrid = !showGrid)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </IconButton>
            <IconButton
              screenReader="Toggle move (M)"
              toggled={showMove}
              on:click={() => (showMove = !showMove)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  transform="translate(10, -2.7) rotate(45) scale(0.95)"
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </IconButton>
          </sl-button-group>
        </div>

        <!-- Buttons: right side -->
        <div class="ml-3 flex gap-3">
          <sl-button-group>
            <IconButton screenReader="Undo" on:click={() => undo()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </IconButton>
            <IconButton screenReader="Redo" on:click={() => redo()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </IconButton>
          </sl-button-group>
        </div>
      </div>
    {/if}

    <!-- Main canvas -->
    <div class="relative flex-shrink flex-grow">
      {#if canvasReady && layers?.[0].grid.length}
        <PixelGrid
          {showGrid}
          {showMove}
          {layers}
          on:layerMove={handleLayerMove}
          on:pixelChange={handlePixelChange}
          bind:mainPanelElement={panels.mainPanel}
        />
      {/if}
    </div>

    <!-- Mobile menu bar at bottom -->
    <div
      class="relative z-30 w-full flex-shrink-0 flex-grow-0 border-2 border-gray-100 bg-white py-3 pr-4 xl:hidden"
    >
      <div class="flex items-center justify-between">
        <!-- Open mobile menu button -->
        <div class="flex md:hidden">
          <button
            class="px-4 py-2"
            on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
          >
            {#if mobileMenuOpen}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            {:else}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            {/if}
          </button>
        </div>

        <!-- User avatars -->
        <div
          class="-mr-3 flex flex-grow flex-row-reverse items-center justify-center md:mr-0"
        >
          {#if $others}
            {#each [...$others] as { presence, info, connectionId } (connectionId)}
              {#if presence}
                <div
                  class="transparent-bg relative -ml-2 h-10 w-10 rounded-full ring-4 ring-white"
                >
                  <img
                    alt="{presence?.name || info.name}'s avatar"
                    src={info.picture}
                  />
                </div>
              {/if}
            {/each}
          {/if}
          {#if $self && $myPresence}
            <div class="-my-2 mr-2 flex hidden flex-grow md:block">
              <div class="flex-grow-0">
                <UserOnline
                  picture={$self.info.picture}
                  name={$myPresence.name || $self.info.name}
                  brush={$myPresence.brush}
                  selectedLayer={$myPresence.selectedLayer}
                  tool={$myPresence.tool}
                  on:selectColor={({ detail }) =>
                    updateBrushColor(detail.color)}
                  isYou={true}
                  short={true}
                />
              </div>
              <div class="w-full flex-grow" />
            </div>
            <div
              class="transparent-bg relative -ml-2 block h-10 w-10 rounded-full ring-4 ring-white md:hidden"
            >
              <img
                alt="{$myPresence?.name || $self.info.name}'s avatar"
                src={$self.info.picture}
              />
            </div>
          {/if}
        </div>

        <!-- Mobile color picker -->
        <div class="flex md:hidden">
          <MobileColorPicker
            on:brushChange={handleBrushChange}
            swatch={recentColors}
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Right panel, containing share links, users' colors etc. (only on large screens) -->
  <div
    bind:this={panels.multiplayerPanel}
    class="side-panel relative left-full flex  w-0 flex-col overflow-y-auto py-5 xl:left-auto xl:w-[300px]"
    id="multiplayer-panel"
    on:pointerleave={handleMouseLeave}
    on:pointermove={(e) => handleMouseMove(e, "multiplayerPanel")}
  >
    {#if $others}
      <div transition:fade>
        <div>
          <div
            class="border-gray-200 px-5 pb-1 text-sm font-semibold text-gray-500"
          >
            Currently online
          </div>

          <!-- You -->
          {#if $myPresence && $self}
            <UserOnline
              picture={$self.info.picture}
              name={$myPresence.name || $self.info.name}
              brush={$myPresence.brush}
              selectedLayer={$myPresence.selectedLayer}
              tool={$myPresence.tool}
              isYou={true}
            />
          {/if}

          <!-- Other users -->
          {#each [...$others] as { presence, info, connectionId } (connectionId)}
            {#if presence?.brush?.color}
              <UserOnline
                picture={info.picture}
                name={presence.name || info.name}
                brush={presence.brush}
                selectedLayer={presence.selectedLayer}
                tool={presence.tool}
                on:selectColor={({ detail }) => updateBrushColor(detail.color)}
                isYou={false}
              />
            {/if}
          {/each}
        </div>

        <!-- Share buttons-->
        <SharePanel />
      </div>

      <!-- Liveblocks logo -->
      <div transition:fade class="flex flex-grow items-end">
        <LinksPanel />
      </div>
    {/if}
  </div>
</div>

<style>
  .main-panel,
  .side-panel {
    max-height: calc(var(--full-height) - var(--header-height));
  }

  .side-panel {
    scrollbar-width: thin;
  }

  .side-panel::-webkit-scrollbar {
    width: 8px;
  }

  .side-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .side-panel::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border: transparent;
  }
</style>
