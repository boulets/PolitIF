/* global renderRecherche, requete_recherche1 */

const API_URL = 'https://query.wikidata.org/sparql'

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

    const req = requete_recherche1(search.value)
    const url = API_URL + '?format=json&query=' + encodeURIComponent(req)
    fetch(url)
      .then(res => res.json())
      .then((resultats) => {
        console.log(resultats)
      })
  })
}
init()
