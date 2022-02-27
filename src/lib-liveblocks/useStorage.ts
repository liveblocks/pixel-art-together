import type { LiveObject } from '@liveblocks/client'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { useRoom } from './useRoom'

/**
 * No `liveblocks-react` public API equivalent, but useStorage is used internally
 */
export function useStorage (): Writable<LiveObject> | null {
  const room = useRoom()
  const rootStore = writable<LiveObject>()

  if (!room) {
    console.error('Use RoomProvider as parent with id prop')
    return null
  }

  async function fetchStorage () {
    const { root }: { root: LiveObject } = await room!.getStorage()
    rootStore.set(root)
  }

  fetchStorage()

  return rootStore
}
