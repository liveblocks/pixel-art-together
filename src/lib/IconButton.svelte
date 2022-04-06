<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let screenReader: string = "";
  export let toggled: boolean = false;
  export let classes = "";

  onMount(async () => {
    await import("@shoelace-style/shoelace/dist/components/tooltip/tooltip.js");
  });
</script>

<sl-tooltip content={screenReader} hoist>
  <sl-button
    class="relative flex h-10 w-10 items-center justify-center {classes}"
    on:click={(event) => dispatch("click", event)}
    variant={toggled ? "primary" : "default"}
  >
    <span class="sr-only">{screenReader}</span>
    <div class="absolute inset-0 flex items-center justify-center">
      <slot />
    </div>
  </sl-button>
</sl-tooltip>
