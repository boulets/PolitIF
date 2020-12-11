/* global renderProfilOrLoading, renderProfilPartial, fetchProfil */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  renderProfilOrLoading(null)
  if (nameWhileLoading) {
    renderProfilPartial({ nom: nameWhileLoading })
  }
  fetchProfil(id).then(renderProfilOrLoading)
  fetchPositions(id).then(renderPositions)
  fetchPartis(id).then(renderPartis)
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()
