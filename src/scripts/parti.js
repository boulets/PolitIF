/* global Slots PolitifCache escapeHtml splitOnce wikidataUrl dbpediaUrl dateToHtml nullableDate ucfirst requete_parti_general requete_parti_description requete_parti_ideologies extractIdFromWikidataUrl requete_parti_personnalites requete_parti_chairpeople wikidataUrlFromId */

function adresseToText({ numero, rue, ville, codePostal }) {
  if (numero && rue && ville && codePostal) {
    return `${numero} ${rue}, ${ville} ${codePostal}`
  } else if (numero && rue && ville) {
    return `${numero} ${rue}, ${ville}`
  } else if (rue && ville) {
    return `${rue}, ${ville}`
  } else if (ville) {
    return ville
  }
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  Slots.setImage('image-logo', '')
  const slots = ['description', 'image-logo', 'president', 'fondateur', 'date-creation', 'date-dissolution', 'nombre-adherents', 'positionnement', 'site-web', 'siege']
  slots.forEach(key => Slots.markLoading(key))

  if (nameWhileLoading) {
    document.title = `Polit'IF – ${nameWhileLoading}`
    Slots.setText('nom', nameWhileLoading)
    Slots.setLink('urlwikidata', wikidataUrlFromId(id), nameWhileLoading)
  } else {
    document.title = 'Polit\'IF'
    Slots.markLoading('nom')
  }

  return Promise.all([
    fetchParti(id).then(renderParti),
    fetchDescriptionParti(id).then(description => {
      description ? Slots.setText('description', description) : Slots.hide('description')
    }),
    fetchPartiIdeologies(id).then(renderPartiIdeologies),
    fetchPartiPersonnalites(id).then(renderPartiPersonnalites),
    fetchPartiChairpeople(id).then(renderPartiChairpeople),
  ])
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}

init()

function renderParti(parti) {
  document.title = `Polit'IF – ${parti.nom}`
  Slots.setText('nom', parti.nom)
  if (parti.dateCreation) {
    Slots.setHtml('date-creation', dateToHtml(parti.dateCreation))
  } else {
    Slots.hide('date-creation')
  }
  if (parti.dateDissolution) {
    Slots.setHtml('date-dissolution', dateToHtml(parti.dateDissolution))
  } else {
    Slots.hide('date-dissolution')
  }

  if (parti.president.id) {
    Slots.setLink('president', `profil.html#${parti.president.id}-${encodeURIComponent(parti.president.nom)}`, parti.president.nom)
  } else {
    Slots.hide('president')
  }
  if (parti.fondateur.id) {
    Slots.setLink('fondateur', `profil.html#${parti.fondateur.id}-${encodeURIComponent(parti.fondateur.nom)}`, parti.fondateur.nom)
  } else {
    Slots.hide('fondateur')
  }

  parti.positionnement ? Slots.setText('positionnement', ucfirst(parti.positionnement)) : Slots.hide('positionnement')
  if (parti.siege) {
    const adr = adresseToText(parti.siege)
    const href = 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(adr).replace(/%20/g, '+')
    if (adr) {
      const html = parti.siege.date
        ? `${ucfirst(escapeHtml(adr))} (depuis le ${dateToHtml(parti.siege.date)})`
        : `${ucfirst(escapeHtml(adr))}`
      Slots.setHtml('siege', `<a target="_blank" rel="noreferrer noopener" title="Ouvrir dans OpenStreetMap" href="${href}">${html}</a>`)
    } else {
      Slots.hide('siege')
    }
  } else {
    Slots.hide('siege')
  }

  const nombreAdherentsStr = nombreAdherentsToHtml(parti.nombreAdherents)
  if (nombreAdherentsStr) {
    Slots.setHtml('nombre-adherents', nombreAdherentsStr)
  } else {
    Slots.hide('nombre-adherents')
  }

  if (parti.logo) {
    Slots.setImage('image-logo', parti.logo, `Logo de ${parti.nom}`)
  } else {
    Slots.hide('image-logo')
  }

  if (parti.couleur) {
    Slots.get('couleur').style.setProperty('--couleur-parti', '#' + parti.couleur)
  }

  if (parti.siteWeb) {
    Slots.setLink('site-web', parti.siteWeb, parti.siteWeb.replace(/^(https?:\/\/)?(www\.)?([^/]+).*$/, '$3'))
  } else {
    Slots.hide('site-web')
  }
}

function formatNumber(x) {
  return new Intl.NumberFormat().format(x)
}

function nombreAdherentsToHtml(nombreAdherents) {
  if (nombreAdherents != null) {
    const {compte, date} = nombreAdherents
    if (compte != null) {
      if (date != null) {
        return `${formatNumber(+compte)} (${dateToHtml(date)})`
      } else {
        return formatNumber(+compte)
      }
    }
  }
}

function renderPartiIdeologies(ideologies) {
  const liens = ideologies.map(({ id, nom }) => ({
    href: `ideologie.html#${id}-${ucfirst(nom)}`,
    text: ucfirst(nom),
  }))
  Slots.setListOfLinks('ideologies', liens)
}

function renderPartiPersonnalites(personnalites) {
  const liens = personnalites.map(({ id, nom }) => ({
    href: `profil.html#${id}-${ucfirst(nom)}`,
    text: ucfirst(nom),
  }))
  Slots.setListOfLinks('membres-importants', liens)
}

function renderPartiChairpeople(chairpeople) {
  const chairpeopleList = Slots.get('tous-les-presidents')
  chairpeopleList.innerHTML = ''

  const ul = document.createElement('ul')
  chairpeopleList.appendChild(ul)

  chairpeople.forEach(chairperson => {
    const { id, nom, debut, fin } = chairperson
    if (!nom) { return } // skip
    const li = document.createElement('li')
    const period = periodToHtml(debut, fin)
    li.innerHTML = `<a href="profil.html#${id}-${ucfirst(nom)}">${escapeHtml(ucfirst(nom))}</a>${period}`
    ul.appendChild(li)
  })
}

function periodToHtml(debut, fin) {
  if (debut && fin) {
    return ` du ${dateToHtml(debut)} au ${dateToHtml(fin)}`
  } else if (debut) {
    return ` à partir du ${dateToHtml(debut)}`
  } else if (fin) {
    return ` jusqu'au ${dateToHtml(fin)}`
  } else {
    return ''
  }
}

async function fetchParti(id) {
  const cacheKey = `parti/${id}`
  const inCache = PolitifCache.get(cacheKey, (x) => {
    x.dateCreation = nullableDate(x.dateCreation)
    x.dateDissolution = nullableDate(x.dateDissolution)
    x.nombreAdherents.date = nullableDate(x.nombreAdherents.date)
    x.siege.date = nullableDate(x.siege.date)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_general(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    nom: donnees?.NomParti?.value,
    logo: donnees?.ImageLogo?.value,
    president: {
      id: extractIdFromWikidataUrl(donnees?.President?.value),
      nom: donnees?.NomPresident?.value,
    },
    fondateur: {
      id: extractIdFromWikidataUrl(donnees?.Fondateur?.value),
      nom: donnees?.NomFondateur?.value,
    },
    dateCreation: nullableDate(donnees?.DateCreation?.value),
    dateDissolution: nullableDate(donnees?.DateDissolution?.value),
    nombreAdherents: {
      compte: donnees?.NombreAdherents?.value,
      date: nullableDate(donnees?.DateNombreAdherents?.value),
    },
    siege: {
      numero: donnees?.SiegeNumero?.value,
      rue: donnees?.SiegeRue?.value,
      codePostal: donnees?.SiegeCodePostal?.value,
      ville: donnees?.SiegeVille?.value,
      date: nullableDate(donnees?.SiegeStartTime?.value),
    },
    couleur: donnees?.Couleur?.value,
    siteWeb: donnees?.SiteWeb?.value,
    positionnement: donnees?.Positionnement?.value,
  }

  PolitifCache.set(cacheKey, res)
  return res
}

async function fetchDescriptionParti(idParti) {
  const cacheKey = `parti/${idParti}/description`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }
  try {
    const req = requete_parti_description(idParti)
    const url = dbpediaUrl(req)
    const reponse = await fetch(url).then(res => res.json())
    const donnees = reponse.results.bindings[0]
    const v = donnees?.Description?.value
    PolitifCache.set(cacheKey, v)
    return v
  } catch (error) {
    return ''
  }
}

async function fetchPartiIdeologies(id) {
  const cacheKey = `parti/${id}/ideologies`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_ideologies(id))
  const reponse = await fetch(url).then(res => res.json())
  const ideologies = reponse.results.bindings
    .map(ideologie => ({
      id: extractIdFromWikidataUrl(ideologie.Ideologie?.value),
      nom: ideologie.NomIdeologie?.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide
  PolitifCache.set(cacheKey, ideologies)
  return ideologies
}

async function fetchPartiPersonnalites(id) {
  const cacheKey = `parti/${id}/personnalites`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_personnalites(id))
  const reponse = await fetch(url).then(res => res.json())
  const personnalites = reponse.results.bindings
    .map(personnalite => ({
      id: extractIdFromWikidataUrl(personnalite.politicien?.value),
      nom: personnalite.NomPoliticien?.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide
  PolitifCache.set(cacheKey, personnalites)
  return personnalites
}

async function fetchPartiChairpeople(id) {
  const cacheKey = `parti/${id}/chairpeople`
  const inCache = PolitifCache.get(cacheKey, (a) => {
    a.forEach(x => {
      x.debut = nullableDate(x.debut)
      x.fin = nullableDate(x.fin)
    })
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_chairpeople(id))
  const reponse = await fetch(url).then(res => res.json())
  const chairpeople = reponse.results.bindings
    .map(chairperson => ({
      id: extractIdFromWikidataUrl(chairperson.politicien?.value),
      nom: chairperson.NomPoliticien?.value,
      debut: nullableDate(chairperson.DateEntreePosition?.value),
      fin: nullableDate(chairperson.DateSortiePosition?.value),
    }))
    .filter(nom => nom) // filtrer null, undefined, vide
  PolitifCache.set(cacheKey, chairpeople)
  return chairpeople
}
