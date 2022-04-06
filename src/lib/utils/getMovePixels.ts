import { Direction } from "../../types";

export function getMovePixels ({ detail, selected, keyToPixel, pixelStorage }) {
  const direction: Direction = detail.direction;

  const newLayer = []
  const pixelKeys = Object.keys(pixelStorage)
    .map(pixelKey => ({ ...keyToPixel(pixelKey), value: pixelStorage[pixelKey] }))
    .filter(({ layer }) => layer === selected)

  let maxCol = 0
  let maxRow = 0
  pixelKeys.forEach(pixel => {
    if (pixel.col > maxCol) {
      maxCol = pixel.col
    }
    if (pixel.row > maxRow) {
      maxRow = pixel.row
    }
  })

  if (direction === Direction.Up || direction === Direction.Down) {
    const up = direction === Direction.Up
    pixelKeys.forEach(pixel => {
      const newRowIndex = up ? pixel.row - 1 : pixel.row + 1
      if (newRowIndex >= 0 && newRowIndex <= maxRow) {
        newLayer.push(({
          ...pixel,
          row: newRowIndex
        }))
      }
    })

    const newRow = Array.from({ length: maxCol + 1 })
    newRow.map((_, index) => ({
      col: index,
      row: up ? maxRow : 0,
      value: { color: "transparent" }
    })).forEach(pixel => newLayer.push(pixel))

  } else {

    const left = direction === Direction.Left
    pixelKeys.forEach(pixel => {
      const newColIndex = left ? pixel.col - 1 : pixel.col + 1
      if (newColIndex >= 0 && newColIndex <= maxCol) {
        newLayer.push(({
          ...pixel,
          col: newColIndex
        }))
      }
    })

    const newCol = Array.from({ length: maxCol + 1 })
    newCol.map((_, index) => ({
      col: left ? maxRow : 0,
      row: index,
      value: { color: "transparent" }
    })).forEach(pixel => newLayer.push(pixel))
  }

  return newLayer
}
