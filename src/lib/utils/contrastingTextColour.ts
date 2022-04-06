export function contrastingTextColour({ r, g, b }) {
  if (r && g && b) {
    var isLight = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return isLight < 0.5;
  }
  return false;
}
