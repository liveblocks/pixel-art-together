export function formatLayers ({ pixelStorage, layerStorage, keyToPixel, getPixel }) {
  let layers = []
  if (pixelStorage && layerStorage) {
    const currentPixels = Object.keys(pixelStorage)
      .map(key => ({ key, ...keyToPixel(key) }))

    layers = Object.values(layerStorage).map(layer => {
      const grid = []
      currentPixels.forEach(pixel => {
        // @ts-ignore TODO
        if (layer.id !== pixel.layer) return
        if (!grid[pixel.row]) grid[pixel.row] = []
        if (!grid[pixel.row][pixel.col]) grid[pixel.row][pixel.col] = []

        grid[pixel.row][pixel.col] = getPixel(pixel)
      })
      // @ts-ignore TODO
      return { ...layer, grid }
    })
  }
  return layers
}
