export function generateGrid (cols, rows, defaultObject) {
  return Array.from({ length: rows }, () => {
    return Array.from({ length: cols }, () => ({
      ...defaultObject
    }))
  })
}
