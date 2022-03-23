<!--
<script lang="ts">
  import logo from '../../static/liveblocks.svg'
</script>

<div class="px-5 mt-3 py-5 border-t-2 border-gray-100 ">
  <div class="text-sm font-semibold pb-1 text-gray-500">Collaboration powered by</div>
  <sl-button class="mt-2 w-full" href="https://liveblocks.io" target="_blank">
    <span class="sr-only">Visit Liveblocks website</span>
    <img class="mx-auto mt-1.5" alt="Liveblocks logo" src={logo} />
  </sl-button>
</div>
-->

<script>
  import poweredByLiveblocks from '../../static/poweredbyliveblocks.svg'
</script>

<div class="flex justify-end w-full mr-5">
  <a href="https://liveblocks.io" target="_blank" class="group overflow-hidden relative ring-transparent transition-all hover:ring-[color:var(--sl-color-primary-200)] ring-1 rounded-[7px] ring-inset ">
    <img src={poweredByLiveblocks} alt="Powered by Liveblocks.io">
    <div class="opacity-0 transition-opacity group-hover:opacity-20 mix-blend-darken inset-0 absolute bg-[color:var(--sl-color-primary-100)]"></div>
  </a>
</div>
