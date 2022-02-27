import type { Presence } from '@liveblocks/client'
import { onDestroy } from 'svelte'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { useRoom } from './useRoom'

/**
 * Works similarly to `liveblocks-react` useMyPresence
 * https://liveblocks.io/docs/api-reference/liveblocks-react#useMyPresence
 *
 * The main difference is that it returns a Svelte store:
 * const presence = useMyPresence()
 * $presence.set({ name: 'Chris })
 * console.log($presence.name)
 *
 * USAGE NOTE:
 * Changing the value of `presence` will not SET your presence, but UPDATE it.
 * This is slightly inconsistent with general Svelte store usage, where
 * presence.update(oldVal => ({ ...oldVal, newProp: 'hi' })) would be used to
 * update, but it is consistent with `liveblocks-react`
 */
export function useMyPresence (): Writable<Presence> | null {
  const room = useRoom()

  if (!room) {
    console.error('Use RoomProvider as parent with id prop')
    return null
  }

  const presence = writable<Presence>()
  const unsubscribeStore = presence.subscribe(newPresence => {
    room.updatePresence(newPresence)
  })

  onDestroy(unsubscribeStore)

  return presence
}
