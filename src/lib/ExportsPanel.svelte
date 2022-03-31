<script lang="ts">
  import { Canvg } from "canvg";
  import { onMount } from "svelte";

  export let width: number = 2000;
  export let ratio: number = 1;

  let renderer;

  // Creates file from SVG and starts download
  function handleSaveSvg () {
    const svgContent = document.querySelector("#svg-image").outerHTML;
    var file = new File([svgContent], "pixelart.svg", {
      type: "image/svg+xml",
    });
    downloadFile(file);
  }

  // Creates file by adding SVG to canvas, converts to base64 png, and starts download
  async function handleSavePng () {
    const svgContent = document.querySelector("#svg-image").outerHTML;
    const canvas: HTMLCanvasElement = document.querySelector("#export-canvas");
    const ctx = canvas.getContext("2d");

    renderer = Canvg.fromString(ctx, svgContent);
    renderer.start();

    canvas.toBlob(blob => {
      const file = new File([blob], "pixelart.png", {
        type: "image/png",
      });
      downloadFile(file);
    });
  }

  // Downloads a file object
  function downloadFile (file) {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = URL.createObjectURL(file);
    link.download = file.name;

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.parentNode.removeChild(link);
    }, 0);
  }

  onMount(async () => {
    await import("@shoelace-style/shoelace/dist/components/button-group/button-group.js");
  });
</script>

<canvas class="hidden" height={width * ratio} id="export-canvas" width={width}></canvas>

<div class="p-5 border-t-2 border-gray-100">
  <div class="text-sm font-semibold pb-3 text-gray-500">Exports</div>
  <div class="flex gap-3">
    <sl-button-group style="width: 100%;">
      <sl-button on:click={handleSaveSvg} style="width: 50%;">Download SVG</sl-button>
      <sl-button on:click={handleSavePng} style="width: 50%;">Download PNG</sl-button>
    </sl-button-group>
  </div>
</div>
