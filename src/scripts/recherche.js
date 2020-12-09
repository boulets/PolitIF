/* global renderRecherche, requete_recherche */
import {API_URL} from '../constants'

let resultatsDeRecherche = []

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResults = document.getElementById('searchResults')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')

function submitSearch(q, n = 1) {
  if (q === 0) {
    return rechercheAfficherResultats([])
  }

  const req = requete_recherche(q, n)
  const url = API_URL + '?format=json&query=' + encodeURIComponent(req)
  fetch(url)
    .then(res => res.json())
    .then((res) => {
      // if (q === search.value) {
      const resultats = res.results.bindings.map((x) => ({
        nom: x.NomPoliticien.value,
        id: x.politician.value.match(/\/entity\/(.+)$/)?.[1]
      }))
      rechercheAfficherResultats(resultats)
      // }
    })
}

function rechercheAfficherResultats(resultats) {
  resultatsDeRecherche = resultats
  searchResults.innerHTML = ''
  for (const {nom, id} of resultats) {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.innerText = nom
    a.href = `profil.html#${id}-${nom}`
    li.appendChild(a)
    searchResults.appendChild(li)
  }

  if (resultats.length > 0) {
    const premier = resultatsDeRecherche[0]
    if (search.value.length > 0) {
      searchAutocomplete.innerHTML = search.value + ' — ' + premier.nom
    }
  }
}

function goToFirstResult() {
  if (resultatsDeRecherche.length > 0) {
    const premier = resultatsDeRecherche[0]
    location.assign(`profil.html#${premier.id}-${premier.nom}`)
  }
}

function update() {
  renderRecherche('')
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())

  searchButton.addEventListener('click', () => {
    goToFirstResult()
  })
  search.addEventListener('keypress', (e) => {
    searchAutocomplete.innerHTML = ''
    if (e.key === 'Enter') {
      goToFirstResult()
    }
  })
  search.addEventListener('input', () => {
    searchAutocomplete.innerHTML = ''
    submitSearch(search.value)
  })
}
init()
