<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
import PixelArt from '../PixelArt.svelte'
import { createRoomId } from '$lib/createRoomId'
import { onMount } from 'svelte'
import { createClient } from '@liveblocks/client'
import LiveblocksProvider from '../lib-liveblocks/LiveblocksProvider.svelte'
import RoomProvider from '../lib-liveblocks/RoomProvider.svelte'

let id
let loaded = false
let client

onMount(() => {
  id = createRoomId()
  client = createClient({
    authEndpoint: '/api/auth'
  })
  loaded = true
})
</script>

{#if loaded}
  <LiveblocksProvider {client}>
    <RoomProvider id={'sveltekit-pixel-art-' + id}>
      <PixelArt />
    </RoomProvider>
  </LiveblocksProvider>
{/if}
