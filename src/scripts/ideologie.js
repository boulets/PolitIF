/* global Slots PolitifCache splitOnce requete_ideologie requete_ideologie_description requete_ideologies_parentes requete_ideologies_derivees wikidataUrl dbpediaUrl */

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  Slots.setImage('image-logo', '')
  const slots = ['description', 'image-logo', 'ideologies-derivees', 'ideologies-parentes']
  slots.forEach(key => Slots.markLoading(key))

  if  (nameWhileLoading) {
    document.title = `Polit'IF – ${nameWhileLoading}`
    Slots.setText('nom', nameWhileLoading)
  } else {
    document.title = 'Polit\'IF'
    Slots.markLoading('nom')
  }

  return Promise.all([
    fetchIdeologie(id).then(renderIdeologie),
    fetchIdeologieDescription(id).then(renderIdeologieDescription),
    fetchIdeologiesDerivees(id).then(listeIdeologiesRenderer('ideologies-derivees')),
    fetchIdeologiesParentes(id).then(listeIdeologiesRenderer('ideologies-parentes')),
  ])
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}

init()

function renderIdeologie(ideologie) {
  document.title = `Polit'IF – ${ucfirst(ideologie.nom)}`
  Slots.setText('nom', ucfirst(ideologie.nom))

  if (ideologie.image) {
    Slots.setImage('image-logo', ideologie.image, `Image représentant l'idéologie ${ideologie.nom}`))
  } else if (ideologie.flag) {
    Slots.setImage('image-logo', ideologie.flag, `Drapeau de l'idéologie ${ideologie.nom}`)
  } else {
    Slots.hide('image-logo')
  }
}

function renderIdeologieDescription(ideologie) {
  ideologie.description ? Slots.setText('description', ideologie.description) : Slots.hide('description')
}

function listeIdeologiesRenderer(slotKey) {
  return (ideologies) => {
    if (Array.isArray(ideologies) && ideologies.length > 0){
      const liens = ideologies.map(({id, nom}) => ({
        href: `ideologie.html#${id}-${ucfirst(nom)}`,
        text: ucfirst(nom),
      }))
      Slots.setListOfLinks(slotKey, liens)
    } else {
      Slots.hide(slotKey)
    }
  }
}

async function fetchIdeologie(id) {
  const cacheKey = `ideologie/${id}`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const req = requete_ideologie(id)
  const url = wikidataUrl(req)
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    nom: donnees?.Nom?.value,
    image: donnees?.image?.value,
    flag: donnees?.flagimage?.value,
  }

  PolitifCache.set(cacheKey, res)
  return res
}

async function fetchIdeologieDescription(id) {
  const cacheKey = `ideologie/${id}/description`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const req = requete_ideologie_description(id)
  const url = dbpediaUrl(req)
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    description: donnees?.Description?.value ?? 'Pas de description',
  }

  PolitifCache.set(cacheKey, res)
  return res
}

async function fetchIdeologiesParentes(id) {
  const cacheKey = `ideologie/${id}/parentes`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) {
    return inCache
  }

  const url = wikidataUrl(requete_ideologies_parentes(id))
  const reponse = await fetch(url).then(res => res.json())

  const res = reponse.results.bindings
    .map(ideologie => ({
      id: extractIdFromWikidataUrl(ideologie?.superClass.value),
      nom: ideologie.superClassLabel.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide

  PolitifCache.set(cacheKey, res)
  return res
}

async function fetchIdeologiesDerivees(id) {
  const cacheKey = `ideologie/${id}/derivees`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) {
    return inCache
  }

  const url = wikidataUrl(requete_ideologies_derivees(id))
  const reponse = await fetch(url).then(res => res.json())

  const res = reponse.results.bindings
    .map(ideologie => ({
      id: extractIdFromWikidataUrl(ideologie.subClass.value),
      nom: ideologie.subClassLabel.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide

  PolitifCache.set(cacheKey, res)
  return res
}
