/* global Slots PolitifCache wikidataUrl dbpediaUrl dateToHtml */

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  renderLoadingProfil() // set loading

  if (nameWhileLoading) {
    document.title = `Polit'IF – ${nameWhileLoading}`
    Slots.setText('nom', nameWhileLoading)
  } else {
    document.title = 'Polit\'IF'
    Slots.markLoading('nom')
  }

  let profilComplet = {}
  Promise.all([
    fetchProfil(id).then(profil => {
      profilComplet = { ...profilComplet, ...profil }
      renderProfilOrHide(profilComplet)
    }),
    fetchDescription(id).then(description => {
      profilComplet = { ...profilComplet, description }
      description ? Slots.setText('description', description) : Slots.hide('description')
    }),
    fetchEnfantsOfProfil(id).then(enfants => {
      profilComplet = { ...profilComplet, enfants }
      if (enfants && enfants.length > 0) {
        Slots.setText('enfants', enfants.join(', '))
      } else {
        Slots.hide('enfants')
      }
    }),
    fetchFratrieOfProfil(id).then(fratrie => {
      profilComplet = { ...profilComplet, fratrie }
      if (fratrie && fratrie.length > 0) {
        Slots.setText('fratrie', fratrie.join(', '))
      } else {
        Slots.hide('fratrie')
      }
    }),
    fetchMandatsProfil(id).then(renderPositions),
    fetchPartisOfProfil(id).then(renderPartis)
  ]).then(() => {
    console.log(profilComplet)
  })
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()

function renderLoadingProfil() {
  [
    'nom', 'date-naissance', 'date-deces', 'lieu-naissance', 'lieu-deces',
    'description', 'pere', 'mere', 'fratrie', 'conjoint', 'enfants',
  ].forEach(Slots.markLoading)
  Slots.setAttr('image-personne', 'src', '')
  Slots.markLoading('image-personne')
}

function renderProfilOrHide(profil) {
  document.title = `Polit'IF – ${profil.nom}`

  profil.nom ? Slots.setText('nom', profil.nom) : Slots.setText('nom', '—')

  profil.dateNaissance
    ? Slots.setHtml('date-naissance', dateToHtml(profil.dateNaissance))
    : Slots.hide('date-naissance')

  profil.lieuNaissance
    ? Slots.setText('lieu-naissance', profil.lieuNaissance)
    : Slots.hide('lieu-naissance')

  profil.dateDeces
    ? Slots.setHtml('date-deces', dateToHtml(profil.dateDeces))
    : Slots.hide('date-deces')

  profil.lieuDeces ? Slots.setText('lieu-deces', profil.lieuDeces) : Slots.hide('lieu-deces')

  profil.pere ? Slots.setText('pere', profil.pere) : Slots.hide('pere')
  profil.mere ? Slots.setText('mere', profil.mere) : Slots.hide('mere')
  profil.conjoint ? Slots.setText('conjoint', profil.conjoint) : Slots.hide('conjoint')

  profil.image
    ? Slots.setAttr('image-personne', 'src', profil.image)
    : Slots.hide('image-personne')

  profil.signature
    ? Slots.setAttr('signature-personne', 'src', profil.signature)
    : Slots.hide('signature-personne')
}

function renderPositions(positions) {
  const positionsList = Slots.get('positions-list')
  positionsList.innerHTML = ''

  const ul = document.createElement('ul')
  positionsList.appendChild(ul)

  positions.forEach(mandat => {
    const { debut, fin, nom, of } = mandat
    if (!nom) { return } // skip

    const li = document.createElement('li')

    if (debut && fin) {
      li.innerHTML = `<b></b> du ${dateToHtml(debut)} au ${dateToHtml(fin)}`
    } else if (debut) {
      li.innerHTML = `<b></b> à partir du ${dateToHtml(debut)}`
    } else if (fin) {
      li.innerHTML = `<b></b> jusqu'au ${dateToHtml(fin)}`
    } else {
      li.innerHTML = '<b></b>'
    }

    li.querySelector('b').innerText = ucfirst(nom) + (of ? ` de ${of}` : '')
    ul.appendChild(li)
  })
}

function renderPartis(partis) {
  if (partis && Array.isArray(partis) && partis.length > 0) {
    const liens = partis.map(({ id, nom }) => ({
      href: `parti.html#${id}-${nom}`,
      text: nom,
    }))
    Slots.setListOfLinks('profil-liste-partis', liens)
  } else {
    Slots.hide('profil-liste-partis')
  }
}

async function fetchProfil(id) {
  const cacheKey = `profil/${id}`
  const inCache = PolitifCache.get(cacheKey, (value) => {
    value.dateNaissance = nullableDate(value.dateNaissance)
    value.dateDeces = nullableDate(value.dateDeces)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_biographie(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    nom: donnees?.NomPoliticien?.value,
    dateNaissance: nullableDate(donnees?.DateDeNaissance?.value),
    lieuNaissance: donnees?.NomLieuDeNaissance?.value,
    dateDeces: nullableDate(donnees?.DateDeDeces?.value),
    lieuDeces: donnees?.NomLieuDeDeces?.value,
    image: donnees?.Image?.value,
    pere: donnees?.NomPere?.value,
    mere: donnees?.NomMere?.value,
    conjoint: donnees?.NomConjoint?.value,
    signature: donnees?.Signature?.value
  }

  PolitifCache.set(cacheKey, res)
  return res
}

async function fetchDescription(idPoliticien) {
  const cacheKey = `profil/${idPoliticien}/description`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }
  try {
    const req = requete_profil_description(idPoliticien)
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

async function fetchMandatsProfil(id) {
  const cacheKey = `profil/${id}/positions`
  const inCache = PolitifCache.get(cacheKey, (a) => {
    a.forEach(x => {
      x.debut = nullableDate(x.debut)
      x.fin = nullableDate(x.fin)
    })
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_mandats(id))
  const reponse = await fetch(url).then(res => res.json())
  const mandats = reponse.results.bindings.map(element => ({
    nom: element.Position?.value,
    debut: nullableDate(element.DateEntreePosition?.value),
    fin: nullableDate(element.DateSortiePosition?.value),
    of: element?.of?.value,
  }))
  PolitifCache.set(cacheKey, mandats)
  return mandats
}

async function fetchPartisOfProfil(id) {
  const cacheKey = `profil/${id}/partis`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_partiPolitique(id))
  const reponse = await fetch(url).then(res => res.json())
  const partis = reponse.results.bindings.map(parti => ({
    id: extractIdFromWikidataUrl(parti.Parti?.value),
    nom: parti.NomParti?.value,
  }))
  PolitifCache.set(cacheKey, partis)
  return partis
}

async function fetchEnfantsOfProfil(id) {
  const cacheKey = `profil/${id}/enfants`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_enfants(id))
  const reponse = await fetch(url).then(res => res.json())
  const v = reponse.results.bindings.map(x => x.nomEnfants?.value).filter(x => x)
  PolitifCache.set(cacheKey, v)
  return v
}

async function fetchFratrieOfProfil(id) {
  const cacheKey = `profil/${id}/fratrie`
  const inCache = PolitifCache.get(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_fratrie(id))
  const reponse = await fetch(url).then(res => res.json())
  const v = reponse.results.bindings.map(x => x.nomFratrie?.value).filter(x => x)
  PolitifCache.set(cacheKey, v)
  return v
}
