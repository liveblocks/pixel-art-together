export function generateLayer ({ layer, cols, rows, defaultObject }) {
  const storage = {}
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      storage[`LAY${layer}_ROW${row}_COL${col}`] = { ...defaultObject }
    }
  }
  console.log(storage)
  return storage
}

export function generateLay (cols, rows, defaultObject) {
  return Array.from({ length: rows }, () => {
    return Array.from({ length: cols }, () => ({
      ...defaultObject
    }))
  })
}
