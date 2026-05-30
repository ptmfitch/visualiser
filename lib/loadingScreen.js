function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen')
  if (!screen || screen.classList.contains('loading-screen--hide')) {
    return
  }
  screen.classList.add('loading-screen--hide')
  screen.setAttribute('aria-busy', 'false')
  const remove = () => screen.remove()
  screen.addEventListener('transitionend', remove, { once: true })
  setTimeout(remove, 900)
}
