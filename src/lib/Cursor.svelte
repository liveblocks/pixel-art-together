<script>
  export let color = {}
  export let x = 100;
  export let y = 100;
  export let name = ''

  $: blackText = colourIsLight(color.rgb)

  function colourIsLight ({ r, g, b }) {
    var isLight = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return isLight < 0.5;
  }
</script>

<div
  style={`transform: translateX(${x}px) translateY(${y}px)`}
  class="absolute top-0 left-0"
>

  <div class="absolute top-8 left-8 whitespace-nowrap rounded-full overflow-hidden">
    <div
      style="background-color: {color.color.slice(0, 7)}; color: {blackText ? 'black' : 'white'}"
      class="px-1.5 py-0.5"
    >
      {name}
    </div>
  </div>

  <div class="absolute top-0 left-0 block">
    <svg class="w-12 h-12 block">
      <path fill="currentColor" d="M8.482,0l8.482,20.36L8.322,17.412,0,20.36Z" transform="translate(11 22.57) rotate(-48)" />
    </svg>
  </div>

</div>

<style>
  div {
    transition: transform 0.5s cubic-bezier(.17, .93, .38, 1);
  }
</style>
