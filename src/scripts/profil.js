/* global renderProfilOrLoading, renderProfilPartial, fetchProfil */

function update() {
  const hash = document.location.hash.slice(1)
  const p = decodeURIComponent(hash).split('-', 2)
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  renderProfilOrLoading(null)
  if (nameWhileLoading) {
    renderProfilPartial({ nom: nameWhileLoading })
  }
  fetchProfil(id).then(renderProfilOrLoading)
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()
