export function generateLayer({ layer, cols, rows, defaultValue }) {
  const storage = {};
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      storage[`${layer}_${row}_${col}`] = defaultValue;
    }
  }
  return storage;
}
