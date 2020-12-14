/* global Slots requete_recherche_partis requete_recherche_politicien wikidataUrl extractIdFromWikidataUrl */

const tousLesResultats = {}

let meilleurResultat = null

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResultsContainer = document.getElementById('searchResultsContainer')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')

function creerFonctionRecherche(type, fonctionRequete, mapper) {
  return (q, n = 1) => submitSearch(q, n, type, fonctionRequete, mapper)
}

function submitSearch(q, n, type, fonctionRequete, mapper) {
  if (q === '') {
    return afficherResultats(type, [])
  }
  const url = wikidataUrl(fonctionRequete(q, n))
  fetch(url).then(async r => {
    if (r.ok) {
      if (search.value.includes(q)) {
        const res = await r.json()
        const resultats = res.results.bindings.map(mapper)
        tousLesResultats[type] = resultats
        afficherResultats(type, resultats)
      }
    } else {
      console.error(await r.text())
    }
  })
}

function afficherResultats(type, resultats) {
  const shouldRestoreFocus = searchResultsContainer.matches(':focus-within')
  const shouldRestoreFocusToHref = document.activeElement.href

  searchResultsContainer.setAttribute(`n-${type}s`, resultats.length)

  if (resultats.length > 0) {
    Slots.setListOfLinks(`resultats-${type}s`, resultats.map(({ nom, id }) => ({
      text: nom,
      href: `${type}.html#${id}-${nom}`,
    })))

    const premier = resultats[0]
    if (search.value.length > 0) {
      searchAutocomplete.innerHTML = search.value + ' — ' + premier.nom
      meilleurResultat = { ...premier, type }
    }
  } else {
    searchAutocomplete.innerHTML = ''
    Slots.setText(`resultats-${type}s`, '')
    Slots.hide(`resultats-${type}s`)
  }

  if (shouldRestoreFocus) {
    console.log(shouldRestoreFocusToHref)
    const links = [...searchResultsContainer.querySelectorAll('[href]')]
    const el = links.find(x => x.href === shouldRestoreFocusToHref)
    if (el) {
      el.focus()
    } else {
      search.focus()
    }
  }
}

function goToFirstResult() {
  if (meilleurResultat) {
    location.assign(`${meilleurResultat.type}.html#${meilleurResultat.id}-${meilleurResultat.nom}`)
  }
}

const chercherProfil = creerFonctionRecherche('profil', requete_recherche_politicien, (x) => ({
  nom: x.NomPoliticien.value,
  id: extractIdFromWikidataUrl(x.politician.value)
}))

const chercherParti = creerFonctionRecherche('parti', requete_recherche_partis, (x) => ({
  nom: x.NomParti.value,
  id: extractIdFromWikidataUrl(x.parti.value)
}))

function init() {
  Slots.hide('resultats-profils')
  Slots.hide('resultats-partis')

  const submitProfil1 = throttle((x) => chercherProfil(x, 1), 500, { leading: false, trailing: true })
  const submitProfil5 = throttle((x) => chercherProfil(x, 5), 1500, { leading: false, trailing: true })
  const submitPartis1 = throttle((x) => chercherParti(x, 1), 500, { leading: false, trailing: true })
  const submitPartis5 = throttle((x) => chercherParti(x, 5), 1500, { leading: false, trailing: true })

  searchButton.addEventListener('click', goToFirstResult)

  search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      goToFirstResult()
    } else {
      searchAutocomplete.innerHTML = ''
    }
  })

  search.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      searchResultsContainer.querySelector('a')?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      searchResultsContainer.querySelector('.recherche-categorie:last-child ul:last-child li:last-child a')?.focus()
    }
  })

  search.addEventListener('input', () => {
    searchAutocomplete.innerHTML = ''
    submitProfil1(search.value)
    submitProfil5(search.value)
    submitPartis1(search.value)
    submitPartis5(search.value)
  })

  searchResultsContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()

      const direction = (e.key === 'ArrowDown') ? +1 : -1
      const liens = [...searchResultsContainer.querySelectorAll('a')]
      if (liens && liens.length > 0) {
        const index = liens.indexOf(document.activeElement)
        if (index == -1) {
        // le focus n'est pas sur une ancre
          liens[0].focus()
        } else {
          const nextIndex = index + direction
          if (nextIndex < 0) {
            search.focus() // on focus l'entrée
          } else if (nextIndex >= liens.length) {
            search.focus() // on boucle
          } else {
            liens[nextIndex].focus()
          }
        }
      }
    }
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
