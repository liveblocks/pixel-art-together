<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let screenReader = ''
  export let toggled = false
</script>

<sl-button variant={toggled ? 'primary' : 'default'} on:click={event => dispatch('click', event)} class="relative w-10 h-10 flex justify-center items-center">
  <span class="sr-only">{screenReader}</span>
  <div class="absolute inset-0 flex justify-center items-center">
    <slot></slot>
  </div>
</sl-button>
