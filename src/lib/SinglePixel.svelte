<script lang="ts">
  import { spring } from 'svelte/motion'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let pixel = {}
  export let row = null
  export let col = null

  let size = spring(1, { stiffness: 0.5 })

  function handleClick () {
    dispatch('change', { row, col })
    size.set(1.1)
    setTimeout(() => {
      size.set(1)
    }, 100)
  }
</script>

<div
  on:click={handleClick}
  data-row={row}
  data-col={col}
  class="w-full h-full transition-colors duration-300 relative"
  style="background: {pixel.color}; transform: scale({$size}); z-index: {$size > 1 ? 10 : 0}"
></div>
