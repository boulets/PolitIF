/* global renderRecherche */

function submitSearch(q) {
  document.location.hash = q
}

function update() {
  renderRecherche('')
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())

  const searchButton = document.getElementById('searchButton')
  const search = document.getElementById('search')

  searchButton.addEventListener('click', () => submitSearch(search.value))
  search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitSearch(search.value)
    }
  })
}
init()
