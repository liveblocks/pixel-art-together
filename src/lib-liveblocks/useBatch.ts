import { useRoom } from './useRoom'

/**
 * Works similarly to `liveblocks-react` useBatch
 * https://liveblocks.io/docs/api-reference/liveblocks-react#useBatch
 */
export function useBatch () {
  return useRoom().batch
}
