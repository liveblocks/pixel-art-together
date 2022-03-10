<script lang="ts">
  import { Canvg } from 'canvg'

  export let width = 2000
  export let ratio = 1

  let renderer

  async function handleSavePng () {
    const svgContent = document.querySelector('#svg-image').outerHTML
    const canvas: HTMLCanvasElement = document.querySelector('#export-canvas')
    const ctx = canvas.getContext('2d')

    renderer = Canvg.fromString(ctx, svgContent)
    renderer.start()

    canvas.toBlob(blob => {
      const file = new File([blob], 'pixelart.png', {
        type: 'image/png'
      })
      downloadFile(file)
    })
  }

  function handleSaveSvg () {
    const svgContent = document.querySelector('#svg-image').outerHTML
    var file = new File([svgContent], 'pixelart.svg', {
      type: 'image/svg+xml'
    })
    downloadFile(file)
  }

  function downloadFile (file) {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = URL.createObjectURL(file)
    link.download = file.name

    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      URL.revokeObjectURL(link.href)
      link.parentNode.removeChild(link)
    }, 0)
  }
</script>

<canvas id="export-canvas" class="hidden" width={width} height={width * ratio}></canvas>

<div class="p-5 border-b-2 border-gray-100">
  <div class="text-sm font-semibold pb-3 text-gray-500">Exports</div>
  <div class="flex gap-3">
    <sl-button on:click={handleSaveSvg}>Save as SVG</sl-button>
    <sl-button on:click={handleSavePng}>Save as PNG</sl-button>
  </div>
</div>
