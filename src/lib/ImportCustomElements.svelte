<script lang="ts">
import { onMount } from "svelte";

onMount(async () => {
  await import("@shoelace-style/shoelace/dist/components/qr-code/qr-code.js");
});

</script>
