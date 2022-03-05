<script lang="ts">
import { copyUrlToClipboard } from '$lib/utils/copyText'
import { onMount } from 'svelte'

let copied

onMount(async () => {
  await import('@shoelace-style/shoelace/dist/components/button/button.js')
  copied = false
})

function copy () {
  copyUrlToClipboard()
  copied = true
  setTimeout(() => copied = false, 1000)
}

</script>

<sl-button class="mt-2 w-full" on:click={copy} disabled={copied}>
  {#if copied}
    Copied!
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
    </svg>
    Click to copy link
  {/if}
</sl-button>
