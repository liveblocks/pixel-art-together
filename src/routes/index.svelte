<script context="module" lang="ts">
	export const prerender = true;
</script>

<!--
  The main code for this component is in src/PixelArtTogether.svelte
  This file contains the Liveblocks providers, based on the
  liveblocks-react library
  https://liveblocks.io/docs/api-reference/liveblocks-react#LiveblocksProvider
-->

<script lang="ts">
  import PixelArtTogether from "../PixelArtTogether.svelte";
  import { createRoomId } from "$lib/utils/createRoomId";
  import { onMount } from "svelte";
  import { createClient } from "@liveblocks/client";
  import LiveblocksProvider from "../lib-liveblocks/LiveblocksProvider.svelte";
  import RoomProvider from "../lib-liveblocks/RoomProvider.svelte";

  let id;
  let loaded = false;
  let client;

  onMount(() => {
    // Add random id to room param if not set, and return the id string
    // e.g. /?room=758df70b5e94c13289df6
    id = createRoomId();

    // Connect to the authentication API for Liveblocks
    client = createClient({
      authEndpoint: "/api/auth",
    });

    loaded = true;
  });
</script>

{#if loaded}
  <!-- Provides Liveblocks hooks to children -->
  <LiveblocksProvider {client}>

    <!-- Create a room from id e.g. `sveltekit-pixel-art-758df70b5e94c13289df6` -->
    <RoomProvider id={'sveltekit-pixel-art-' + id}>

      <!-- Main app component -->
      <PixelArtTogether />

    </RoomProvider>
  </LiveblocksProvider>
{/if}
