/* global Slots, fetchProfil, fetchPositions, fetchDescription, fetchEnfantsOfProfil, fetchFratrieOfProfil, fetchPartisOfProfil, dateToHtml */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

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
    fetchProfil(id)
      .then(async profil => {
        profilComplet = { ...profilComplet, ...profil }
        renderProfilOrHide(profilComplet)
        try {
          const description = await fetchDescription(id)
          profilComplet = { ...profilComplet, description }
          description ? Slots.setText('description', description) : Slots.hide('description')
        } catch (error) {
          Slots.hide('description')
        }
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
    fetchPositions(id).then(renderPositions),
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
    const { debut, fin, nom } = mandat
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

    li.querySelector('b').innerText = nom
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
