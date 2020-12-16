/* global Slots PolitifCache requete_recherche_partis requete_recherche_politicien wikidataUrl extractIdFromWikidataUrl */

const tousLesResultats = {}

const pendingPromises = {}

const abortControllers = {}

/**
 * Active l'annulation des requêtes, permet d'économiser
 * de la bande passante mais le cache se remplira moins vite
 */
const enableAborts = true

const SEARCH_TYPES = ['profil', 'parti']

// const logr = (...x) => console.log('recherche.js   ', ...x)

let meilleurResultat = null

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResultsContainer = document.getElementById('searchResultsContainer')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')

function creerFonctionRecherche(type, fonctionRequete, mapper) {
  return (q, n = 1) => submitSearch(q, n, type, fonctionRequete, mapper)
}

function submitSearch(q, n, type, fonctionRequete, mapper) {
  if (enableAborts) {
    const toAbort = Object.keys(pendingPromises).filter((k) => k.split(':', 3)[2] !== q)
    toAbort.forEach(k => {
      if (abortControllers[k]) {
        // logr(`abort-other ${k}`)
        abortControllers[k].abort()
        delete abortControllers[k]
      }
    })
  }

  tousLesResultats[type] = []

  if (q === '') {
    return afficherResultats(type, [])
  }

  const url = wikidataUrl(fonctionRequete(q, n))
  const k = `${n}:${type}:${q.toLocaleLowerCase()}`

  if (enableAborts && abortControllers[k]) {
    // logr(`abort ${k}`)
    abortControllers[k].abort()
    delete abortControllers[k]
  }

  const inCache = PolitifCache.get(`recherche/${k}`)
  if (inCache) {
    afficherResultats(type, inCache)
    // logr(`in cache ${k}`)
    return
  }

  if (pendingPromises[k]) {
    // logr(`already ${k}`)
    return // already fetching results for this query params
  }

  abortControllers[k] = new AbortController()
  const { signal } = abortControllers[k]
  pendingPromises[k] = fetch(url, { signal }).then(async r => {
    if (r.ok) {
      const res = await r.json()
      const resultats = res.results.bindings.map(mapper)
      PolitifCache.set(`recherche/${k}`, resultats)

      if (search.value === q) {
        delete abortControllers[k]
        delete pendingPromises[k]
        afficherResultats(type, resultats)
      } else {
        if (enableAborts) {
          throw new Error('failed to cancel')
        } else {
          // logr(`ignored ${k}`)
          delete pendingPromises[k]
        }
      }
    } else {
      throw new Error(await r.text())
    }
  }).catch((err) => {
    // on ignore les `DOMException: The user aborted a request.`
    if (!(err instanceof DOMException)) {
      console.error(err)
      delete abortControllers[k]
      delete pendingPromises[k]
    }
  })
}

function afficherResultats(type, resultats, forceSetResults = false) {
  const prevLength = tousLesResultats[type]?.length || 0
  const nextLength = resultats.length
  if (nextLength < prevLength && !forceSetResults) {
    // logr(`skip ${type} ${resultats.length}`)
    return
  }
  tousLesResultats[type] = resultats

  const shouldRestoreFocus = searchResultsContainer.matches(':focus-within')
  const shouldRestoreFocusToHref = document.activeElement.href

  searchResultsContainer.setAttribute(`n-${type}s`, resultats.length)

  if (resultats.length > 0) {
    Slots.setListOfLinks(`resultats-${type}s`, resultats.map(({ nom, id }) => ({
      text: nom,
      href: `${type}.html#${id}-${nom}`,
    })))
  } else {
    Slots.setText(`resultats-${type}s`, '')
    Slots.hide(`resultats-${type}s`)
  }

  definirMeilleurResultat()

  if (shouldRestoreFocus) {
    const links = [...searchResultsContainer.querySelectorAll('[href]')]
    const el = links.find(x => x.href === shouldRestoreFocusToHref)
    if (el) {
      el.focus()
    } else {
      search.focus()
    }
  }
}

function definirMeilleurResultat() {
  const type = SEARCH_TYPES.filter(t => tousLesResultats[t]?.length > 0)[0]
  const premier = tousLesResultats[type]?.[0]

  if (premier && search.value.length > 0) {
    searchAutocomplete.innerHTML = `${search.value} — ${premier.nom}`
    meilleurResultat = { ...premier, type }
  } else {
    searchAutocomplete.innerHTML = ''
    meilleurResultat = null

    if (search.value.length > 0) {
      const noResults = Object.values(tousLesResultats).findIndex(x => x.length > 0) === -1
      if (noResults) {
        const isLastQuery = Object.values(pendingPromises).length === 0
        if (isLastQuery) {
          searchAutocomplete.innerHTML = `${search.value} — Aucun résultat`
        } else {
          searchAutocomplete.innerHTML = `${search.value} — Recherche…`
        }
      }
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
  SEARCH_TYPES.forEach(type => Slots.hide(`resultats-${type}`))

  const submitProfil1 = throttle((x) => chercherProfil(x, 1), 50, { leading: false, trailing: true })
  const submitProfil5 = throttle((x) => chercherProfil(x, 5), 50, { leading: false, trailing: true })
  const submitPartis1 = throttle((x) => chercherParti(x, 1), 50, { leading: false, trailing: true })
  const submitPartis5 = throttle((x) => chercherParti(x, 5), 50, { leading: false, trailing: true })

  searchButton.addEventListener('click', goToFirstResult)

  search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      goToFirstResult()
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
    const q = search.value.toLocaleLowerCase()
    if (q.length > 0) {
      searchAutocomplete.innerHTML = `${search.value} — Recherche…`
      submitProfil1(q)
      submitProfil5(q)
      submitPartis1(q)
      submitPartis5(q)
    } else {
      searchAutocomplete.innerHTML = ''
      if (enableAborts) {
        Object.entries(abortControllers).forEach(([k, ac]) => {
          ac.abort()
          delete abortControllers[k]
        })
      }
      Object.keys(tousLesResultats).forEach(type => {
        delete tousLesResultats[type]
        afficherResultats(type, [], { forceSetResults: true })
      })
    }
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
