export function debounce (func, wait, immediate) {
  let timeout

  return function executedFunction () {
    const context = this
    const args = arguments

    const later = function () {
      timeout = null
      if (!immediate) {
        return func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) {
      return func.apply(context, args)
    }
  }
}
