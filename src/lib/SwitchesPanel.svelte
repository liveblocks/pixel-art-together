<script lang="ts">
  import { onMount } from 'svelte'

  export let showGrid

  onMount(async () => {
    await import('@shoelace-style/shoelace/dist/components/switch/switch.js')
  })
</script>

<div class="px-5 flex">
  <sl-switch on:sl-change={() => showGrid = !showGrid}>Show grid</sl-switch>
</div>
