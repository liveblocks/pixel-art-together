<script lang="ts">
  import CopyLinkButton from "$lib/CopyLinkButton.svelte";
  import QRCodeButton from "$lib/QRCodeButton.svelte";
</script>

<div class="mt-3 border-t-2 border-gray-100 px-5 pt-5 ">
  <div class="pb-1 text-sm font-semibold text-gray-500">Share with friends</div>

  <CopyLinkButton />
  <p class="mt-2 mb-2.5 text-center text-sm text-gray-600">
    Share link to play together
  </p>
  <QRCodeButton />
  <p class="mt-2 text-center text-sm text-gray-600">
    Scan code to play on mobile
  </p>
</div>
