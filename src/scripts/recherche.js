/* global renderRecherche, requete_recherche_politicien, wikidataUrl */

let resultatsDeRecherche = []

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResults = document.getElementById('searchResults')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')

function submitSearch(q, n = 1) {
  if (q === 0) {
    return rechercheAfficherResultats([])
  }
  const url = wikidataUrl(requete_recherche_politicien(q, n))
  console.log(`fetch(${url})`)
  fetch(url).then(async x => {
    if (x.ok) {
      console.log(search.value, q)
      if (search.value.includes(q)) {
        const res = await x.json()
        console.log(res)
        const resultats = res.results.bindings.map((x_1) => ({
          nom: x_1.NomPoliticien.value,
          id: x_1.politician.value.match(/\/entity\/(.+)$/)?.[1]
        }))
        rechercheAfficherResultats(resultats)
      }
    } else {
      console.error(await x.text())
    }
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

  const submit1 = throttle((x) => submitSearch(x, 1), 500, { leading: false, trailing: true })
  const submit5 = throttle((x) => submitSearch(x, 5), 500, { leading: false, trailing: true })

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
    submit1(search.value)
    submit5(search.value)
  })
}
init()

// https://stackoverflow.com/a/27078401
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var context, args, result
  var timeout = null
  var previous = 0
  if (!options) options = {}
  var later = function() {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function() {
    var now = Date.now()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}
