function update() {
  renderLoadingGouvernement()

  return Promise.all([
    fetchPresidentActuel().then(renderPresident),
    fetchPremierMinistreActuel().then(renderPremierMinistre),
    fetchListeMinistresActuels().then(renderMinistres)
  ])
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()

// Rendering

function renderLoadingGouvernement() {
  const slots = [
    'president-lien', 'president-info', 'premier-ministre-lien', 'premier-ministre-info',
    'liste-ministres'
  ]
  slots.forEach(Slots.markLoading)
}

function renderPresident(president) {
  if (president.id) {
    setLinkPoliticianOrHide('president-lien', {...president, isPolitician: true})
    const position = ucfirst(president.position)
    const date = dateToString(president.debut)
    Slots.setText('president-info', `${position} depuis le ${date}`)
  } else {
    Slots.hide('president-lien')
  }
}

function renderPremierMinistre(premierMinistre) {
  if (premierMinistre.id) {
    setLinkPoliticianOrHide('premier-ministre-lien', {...premierMinistre, isPolitician: true})
    const position = ucfirst(premierMinistre.position)
    const date = dateToString(premierMinistre.debut)
    Slots.setText('premier-ministre-info', `${position} depuis le ${date}`)
  } else {
    Slots.hide('premier-ministre-lien')
  }
}

function renderMinistres() {

}

// Fetching informations

async function fetchPresidentActuel() {
  const cacheKey = "gouvernement/president"
  const inCache = PolitifCache.get(cacheKey, (x) => {
    x.debut = nullableDate(x.debut)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_president_actuel())
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const president = {
    id: extractIdFromWikidataUrl(donnees?.president?.value),
    nom: donnees?.presidentLabel?.value,
    position: donnees?.positionLabel?.value,
    debut: nullableDate(donnees?.startTime?.value)
  }

  PolitifCache.set(president)
  return president
}

async function fetchPremierMinistreActuel() {
  const cacheKey = "gouvernement/premier-ministre"
  const inCache = PolitifCache.get(cacheKey, (x) => {
    x.debut = nullableDate(x.debut)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_premier_ministre_actuel())
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const premierMinistre = {
    id: extractIdFromWikidataUrl(donnees?.primeMinister?.value),
    nom: donnees?.primeMinisterLabel?.value,
    position: donnees?.positionLabel?.value,
    debut: nullableDate(donnees?.startTime?.value)
  }

  PolitifCache.set(premierMinistre)
  return premierMinistre
}

async function fetchListeMinistresActuels() {
  const cacheKey = "gouvernement/ministres"
  const inCache = PolitifCache.get(cacheKey, (a) => {
    a.forEach(x => {
      x.debut = nullableDate(x.debut)
    })
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_ministres_actuels())
  const reponse = await fetch(url).then(res => res.json())
  const ministres = reponse.results.bindings.map(element => ({
    id: extractIdFromWikidataUrl(element?.minister?.value),
    nom: element.ministerLabel?.value,
    position: element.positionLabel?.value,
    debut: nullableDate(element.startTime?.value)
  }))

  PolitifCache.set(ministres)
  return ministres
}
