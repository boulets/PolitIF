/* global requete_recherche_partis, requete_recherche_politicien, wikidataUrl */

let meilleurResultat = null

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResultsContainer = document.getElementById('searchResultsContainer')
const searchResultsPersonnalites = document.getElementById('searchResultsPersonnalites')
const searchResultsPartis = document.getElementById('searchResultsPartis')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')

function submitSearchPersonnalites(q, n = 1) {
  if (q === '') {
    return rechercheAfficherResultatsPersonnalites([])
  }
  const url = wikidataUrl(requete_recherche_politicien(q, n))
  fetch(url).then(async r => {
    if (r.ok) {
      if (search.value.includes(q)) {
        const res = await r.json()
        const resultats = res.results.bindings.map((x) => ({
          nom: x.NomPoliticien.value,
          id: x.politician.value.match(/\/entity\/(.+)$/)?.[1]
        }))
        rechercheAfficherResultatsPersonnalites(resultats)
      }
    } else {
      console.error(await r.text())
    }
  })
}

function submitSearchPartis(q, n = 1) {
  if (q === '') {
    return rechercheAfficherResultatsPartis([])
  }
  const url = wikidataUrl(requete_recherche_partis(q, n))
  fetch(url).then(async r => {
    if (r.ok) {
      if (search.value.includes(q)) {
        const res = await r.json()
        const resultats = res.results.bindings.map((x) => ({
          nom: x.NomParti.value,
          id: x.parti.value.match(/\/entity\/(.+)$/)?.[1]
        }))
        rechercheAfficherResultatsPartis(resultats)
      }
    } else {
      console.error(await r.text())
    }
  })
}

function makeAnchorListItem(text, href) {
  const li = document.createElement('li')
  const a = document.createElement('a')
  a.innerText = text
  a.href = href
  li.appendChild(a)
  return li
}

function rechercheAfficherResultatsPersonnalites(resultats) {
  searchResultsPersonnalites.innerHTML = ''
  searchResultsContainer.setAttribute('n-personnalites', resultats.length)

  for (const {nom, id} of resultats) {
    searchResultsPersonnalites.appendChild(makeAnchorListItem(nom, `profil.html#${id}-${nom}`))
  }

  if (resultats.length > 0) {
    const premier = resultats[0]
    if (search.value.length > 0) {
      searchAutocomplete.innerHTML = search.value + ' — ' + premier.nom
      meilleurResultat = { ...premier, type: 'profil' }
    }
  } else {
    searchAutocomplete.innerHTML = ''
  }
}

function rechercheAfficherResultatsPartis(resultats) {
  searchResultsPartis.innerHTML = ''
  searchResultsContainer.setAttribute('n-partis', resultats.length)
  for (const {nom, id} of resultats) {
    searchResultsPartis.appendChild(makeAnchorListItem(nom, `parti.html#${id}-${nom}`))
  }

  if (resultats.length > 0) {
    const premier = resultats[0]
    if (search.value.length > 0) {
      searchAutocomplete.innerHTML = search.value + ' — ' + premier.nom
      meilleurResultat = { ...premier, type: 'parti' }
    }
  } else {
    searchAutocomplete.innerHTML = ''
  }
}

function goToFirstResult() {
  if (meilleurResultat) {
    location.assign(`${meilleurResultat.type}.html#${meilleurResultat.id}-${meilleurResultat.nom}`)
  }
}

function update() {
  // renderRecherche('')
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())

  const submit1 = throttle((x) => submitSearchPersonnalites(x, 1), 500, { leading: false, trailing: true })
  const submit5 = throttle((x) => submitSearchPersonnalites(x, 5), 1500, { leading: false, trailing: true })

  const submitPartis1 = throttle((x) => submitSearchPartis(x, 1), 500, { leading: false, trailing: true })
  const submitPartis5 = throttle((x) => submitSearchPartis(x, 5), 1500, { leading: false, trailing: true })

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
    // submit5(search.value)
    submitPartis1(search.value)
    // submitPartis5(search.value)
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
