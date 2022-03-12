export function getFillPixels (initialPixel, grid) {
  const layer = initialPixel.layer
  let pixels = []

  const alreadyCounted = ({ row, col }) => pixels.some(pixel => {
    return pixel.row === row && pixel.col === col
  })

  function findClosest ({ row, col }) {
    const neighbours = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 }
    ]

    neighbours.forEach(neighbour => {
      const pixel = grid?.[neighbour.row]?.[neighbour.col]
      const pixelObj = { row: neighbour.row, col: neighbour.col }

      if (pixel?.color === grid[row][col].color && !alreadyCounted(pixelObj)) {
        pixels.push({ ...pixelObj, layer })
        findClosest(pixelObj)
      }
    })
  }

  findClosest(initialPixel)
  return pixels
}
