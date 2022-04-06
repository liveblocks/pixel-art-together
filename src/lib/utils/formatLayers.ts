/**
 * Returns an object containing all layers and pixel grids, for general use
 *
 * Example of 3*3 grid with 2 layers:
 * const formattedLayers = [
 *   {
 *     id: 1,
 *     opacity: 0.8,
 *     blendMode: 'color-dodge',
 *     grid: [
 *       [{ color: '#ff0000' }, { color: '#ffffff' }, { color: '#0000ff' }],
 *       [{ color: '#ff0000' }, { color: '#ffffff' }, { color: '#0000ff' }],
 *       [{ color: '#ff0000' }, { color: '#ffffff' }, { color: '#0000ff' }],
 *     ]
 *   },
 *   {
 *     id: 0,
 *     opacity: 1,
 *     blendMode: 'normal',
 *     grid: [
 *       [{ color: 'transparent' }, { color: 'transparent' }, { color: 'transparent' }],
 *       [{ color: 'transparent' }, { color: 'transparent' }, { color: 'transparent' }],
 *       [{ color: 'transparent' }, { color: 'transparent' }, { color: 'transparent' }],
 *     ]
 *   }
 * ]
 */

export function formatLayers({
  pixelStorage,
  layerStorage,
  keyToPixel,
  getPixel,
}) {
  let layers = [];
  if (pixelStorage && layerStorage) {
    const currentPixels = Object.keys(pixelStorage).map((key) => ({
      key,
      ...keyToPixel(key),
    }));

    layers = Object.values(layerStorage).map((layer) => {
      const grid = [];
      currentPixels.forEach((pixel) => {
        // @ts-ignore TODO
        if (layer.id !== pixel.layer) return;
        if (!grid[pixel.row]) grid[pixel.row] = [];
        if (!grid[pixel.row][pixel.col]) grid[pixel.row][pixel.col] = [];

        grid[pixel.row][pixel.col] = getPixel(pixel);
      });
      // @ts-ignore TODO
      return { ...layer, grid };
    });
  }
  return layers;
}
