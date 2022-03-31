import { LiveList } from "@liveblocks/client";

export function generateGrid (cols, rows, defaultObject) {
  return Array.from({ length: rows }, () => {
    return new LiveList(
      Array.from({ length: cols }, () => ({
        ...defaultObject,
      })),
    );
  });
}
