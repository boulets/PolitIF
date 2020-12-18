/* global Slots setLinkPoliticianOrHide ucfirst dateToString PolitifCache nullableDate wikidataUrl requete_president_actuel extractIdFromWikidataUrl requete_premier_ministre_actuel requete_ministres_actuels dateToHtml */

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

function renderMinistres(ministres) {
  if (ministres.length > 0) {
    const slot = Slots.get('liste-ministres')
    slot.innerHTML = ''
    const ul = document.createElement('ul')
    slot.appendChild(ul)
    ministres.forEach(m => {
      const a = document.createElement('a')
      a.classList.add('nom')
      a.innerText = m.nom
      a.href = `profil.html#${m.id}-${m.nom}`

      const infos = document.createElement('div')
      infos.innerHTML = `${ucfirst(m.position)} depuis le ${dateToHtml(m.debut)}`

      const lienExt = document.createElement('a')
      lienExt.href = `profil.html#${m.id}-${m.nom}`
      lienExt.appendChild(a)
      lienExt.appendChild(infos)

      const li = document.createElement('li')
      li.appendChild(lienExt)
      ul.appendChild(li)
    })
  } else {
    Slots.setText('liste-ministres', 'Pas de ministres')
    // Slots.hide('liste-ministres')
  }
}

// Fetching informations

async function fetchPresidentActuel() {
  const cacheKey = 'gouvernement/president'
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

  PolitifCache.set(cacheKey, president)
  return president
}

async function fetchPremierMinistreActuel() {
  const cacheKey = 'gouvernement/premier-ministre'
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

  PolitifCache.set(cacheKey, premierMinistre)
  return premierMinistre
}

async function fetchListeMinistresActuels() {
  const cacheKey = 'gouvernement/ministres'
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

  PolitifCache.set(cacheKey, ministres)
  return ministres
}
