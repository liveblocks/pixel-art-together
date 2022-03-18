<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  export let screenReader: string = ''
  export let toggled: boolean = false
  export let classes = ''

  onMount(async () => {
    await import('@shoelace-style/shoelace/dist/components/tooltip/tooltip.js')
  })
</script>

<sl-tooltip content={screenReader} hoist>
  <sl-button variant={toggled ? 'primary' : 'default'} on:click={event => dispatch('click', event)} class="relative w-10 h-10 flex justify-center items-center {classes}">
    <span class="sr-only">{screenReader}</span>
    <div class="absolute inset-0 flex justify-center items-center">
      <slot></slot>
    </div>
  </sl-button>
</sl-tooltip>
