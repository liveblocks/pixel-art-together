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
    //size.set(1.1)
    //setTimeout(() => {
    //  size.set(1)
    //}, 100)
  }
</script>

<div
  on:click={handleClick}
  on:mousedown={dispatch('mousedown', { row, col })}
  on:mouseup={dispatch('mouseup', { row, col })}
  on:mouseover={dispatch('mouseover', { row, col })}
  data-row={row}
  data-col={col}
  class="w-full h-full transition-colors duration-75 relative pt-[100%]"
  style="background: {pixel.color}; transform: scale({$size}); z-index: {$size > 1 ? 10 : 0}"
></div>
