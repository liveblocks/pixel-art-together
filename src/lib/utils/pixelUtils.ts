// Convert a pixel object into a pixel key
export const pixelToKey = ({ layer, row, col }) => `LAY${layer}_ROW${row}_COL${col}`

// Convert a pixel key into a pixel object
export const keyToPixel = (key: string)  => {
  const [layer, row, col] = key.split('_').map(str => parseInt(str.slice(3)))
  return { layer, row, col }
}
