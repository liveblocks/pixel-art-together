<script>
  import { spring } from 'svelte/motion';

  export let color = {}
  export let x = 100;
  export let y = 100;
  export let name = ''

  let coords = spring({ x, y }, {
    stiffness: 0.07,
    damping: 0.35
  })

  $: {
    coords.set({ x, y })
  }

  $: blackText = colourIsLight(color.rgb)

  function colourIsLight ({ r, g, b }) {
    if (r && g && b) {
      var isLight = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return isLight < 0.5;
    }
    return false
  }
</script>

<div
  style={`transform: translateX(${$coords.x}px) translateY(${$coords.y}px)`}
  class="absolute -top-4 -left-4"
>

  <div class="font-medium text-sm inner-border drop-shadow-sm absolute top-7 left-7 whitespace-nowrap rounded-full overflow-hidden">
    <div
      style="background-color: {color.color.slice(0, 7)}; color: {blackText ? 'black' : 'white'}"
      class="px-2.5 py-1.5"
    >
      {name}
    </div>
  </div>

  <div class="absolute top-0 left-0 block">
    <svg class="w-10 h-10 block scale-75">
      <path fill="currentColor" d="M8.482,0l8.482,20.36L8.322,17.412,0,20.36Z" transform="translate(11 22.57) rotate(-48)" />
    </svg>
  </div>

</div>

<style>
  div {
    //transition: transform 0.5s cubic-bezier(.17, .93, .38, 1);
  }
</style>
