<script lang="ts">
import CopyLinkButton from '$lib/CopyLinkButton.svelte'
import QRCodeButton from '$lib/QRCodeButton.svelte'
</script>

<div class="px-5 mt-3 pt-5 border-t-2 border-gray-100 ">
  <div class="text-sm font-semibold pb-1 text-gray-500">Share with friends</div>

  <CopyLinkButton />
  <p class="text-center mt-2 text-gray-600 text-sm mb-2.5">
    Share link to play together
  </p>
  <QRCodeButton />
  <p class="text-center mt-2 text-gray-600 text-sm">
    Scan code to play on mobile
  </p>
</div>
