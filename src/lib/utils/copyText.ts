export function copyUrlToClipboard() {
  copyTextToClipboard(window.location.href)
}

export function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(function () {}, function (err) {
    console.error('Unable to copy', err)
  })
}

function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Unable to copy', err)
  }

  document.body.removeChild(textArea)
}
