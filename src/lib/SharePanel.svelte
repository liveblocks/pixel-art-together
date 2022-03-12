<script lang="ts">
import CopyLinkButton from '$lib/CopyLinkButton.svelte'
</script>

<div class="px-5 mt-3 pt-5 border-t-2 border-gray-100 ">
  <div class="text-sm font-semibold pb-1 text-gray-500">Share with friends</div>
  <CopyLinkButton />
  <p class="text-center mt-2 text-gray-600 text-sm">
    Share link to play together
  </p>
  <!--
  <div class="mx-auto mt-8 text-center">
    <sl-qr-code value={window.location.href} label="Scan this code to visit Shoelace on the web!"></sl-qr-code>
  </div>
  -->
</div>
