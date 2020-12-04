/* global renderProfil, renderRecherche, fetchProfil */

/**
  * @typedef Route
  * @type {object}
  * @property {string} name - La route actuellement affichée
  * @property {object} params - Les paramètres associés à cette route
  */

/**
  * @typedef AppState
  * @type {object}
  * @property {Route} route - La route actuellement affichée
  */

const getDefaultRoute = () => ({
  name: 'recherche',
  params: { search: '' }
})
const getRouteRecherche = (search) => ({
  name: 'recherche',
  params: { search }
})
const getRouteProfil = (id) => ({
  name: 'profil',
  params: { id }
})

const routeRenderers = {
  profil({ id }) {
    renderProfil(null)
    fetchProfil(id).then(renderProfil)
  },
  recherche({ search }) {
    renderRecherche(search)
  }
}


function routeFromPath(/** @type string[] */ path) {
  if (path.length >= 1) {
    switch (path[0]) {
    case 'recherche':
      return getRouteRecherche(path.length >= 2 ? decodeURIComponent(path[1]) : '')
    case 'profil':
      if (path.length >= 2) {
        return getRouteProfil(path.length > 1 ? decodeURIComponent(path[1]) : '')
      } else {
        return getRouteRecherche('')
      }
    default:
      return getRouteRecherche('')
    }
  }
}

function onStateUpdate(/** @type AppState */ appState) {
  const routes = document.querySelectorAll('[route]')
  routes.forEach(element => {
    const route = element.getAttribute('route')
    if (route === appState.route.name) {
      element.setAttribute('is-current-route', 'true')
    } else {
      element.removeAttribute('is-current-route')
    }
  })

  routeRenderers[appState.route.name](appState.route.params)
}

function updateStateFromUrl(/** @type AppState */ appState) {
  const hash = document.location.hash.slice(1)
  const path = hash.replace(/(^\/|\/$)/, '').split('/')
  appState.route = routeFromPath(path)
  onStateUpdate(appState)
  return appState
}

// Main
const appState = updateStateFromUrl({
  route: getDefaultRoute()
})

window.addEventListener('hashchange', () => {
  updateStateFromUrl(appState)
})


/// TODO mettre ça ailleurs
searchButton.addEventListener('click', () => submitSearch(search.value))
search.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    submitSearch(search.value)
  }
})

function submitSearch(q) {
  document.location.hash = '/recherche/' + q
}
