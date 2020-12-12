/* global getSlot hideSlot slotSetTextOrMissing slotSetHtml slotSetAttribute slotSetLoading dateToHtml slotSetListOrMissing fetchParti fetchPartiIdeologies */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  console.log({id, nameWhileLoading})

  renderParti(null)
  renderParti({ nom: nameWhileLoading })

  return Promise.all([
    fetchParti(id).then(renderParti),
    fetchPartiIdeologies(id).then(renderPartiIdeologies),
  ])
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()

function renderParti(parti) {
  if (parti === null) {
    const slots = ['nom', 'description', 'membres-importants', 'image-logo', 'president', 'fondateur', 'date-creation', 'date-dissolution', 'nombre-adherents', 'positionnement', 'ideologies', 'site-web', 'siege']
    slots.forEach(key => slotSetLoading(key))
    slotSetAttribute('image-logo', 'src', '')
  } else {
    document.title = `Polit'IF – ${parti.nom}`
    slotSetTextOrMissing('nom', parti.nom)
    if (parti.dateCreation) {
      slotSetHtml('date-creation', dateToHtml(parti.dateCreation))
    } else {
      hideSlot('date-creation')
    }
    if (parti.dateDissolution) {
      slotSetHtml('date-dissolution', dateToHtml(parti.dateDissolution))
    } else {
      hideSlot('date-dissolution')
    }
    slotSetListOrMissing('membres-importants', parti.membresImportants)
    slotSetTextOrMissing('description', parti.description)
    slotSetTextOrMissing('president', parti.president)
    slotSetTextOrMissing('fondateur', parti.fondateur)
    slotSetTextOrMissing('positionnement', parti.positionnement)
    slotSetTextOrMissing('siege', parti.siege)

    const nombreAdherentsStr = nombreAdherentsToHtml(parti.nombreAdherents)
    if (nombreAdherentsStr) {
      slotSetHtmlOrMissing('nombre-adherents', nombreAdherentsStr)
    } else {
      hideSlot('nombre-adherents')
    }

    if (parti.logo) {
      slotSetAttribute('image-logo', 'src', parti.logo)
    } else {
      slotSetAttribute('image-logo', 'src', '')
    }

    if (parti.couleur) {
      getSlot('couleur').style.setProperty('--couleur-parti', '#' + parti.couleur)
    }

    if (parti.siteWeb) {
      slotSetTextOrMissing('site-web', parti.siteWeb.replace(/^https?:\/\/([^/]+).+$/, '$1'))
      slotSetAttribute('site-web', 'href', parti.siteWeb)
    } else {
      hideSlot('site-web')
    }
  }
}

function formatNumber(x) {
  return new Intl.NumberFormat().format(x)
}

function nombreAdherentsToHtml(nombreAdherents) {
  if (nombreAdherents != null) {
    const { compte, date } = nombreAdherents
    if (compte != null) {
      if (date != null) {
        return `${formatNumber(+compte)} (${dateToHtml(date)})`
      } else {
        return formatNumber(+compte)
      }
    }
  }
}

// Mettre la première lettre en majuscule, tout en faisant attention aux caractères accentués
function ucfirst([first, ...rest]) {
  return first.toLocaleUpperCase() + rest.join('')
}

function renderPartiIdeologies(ideologies){
  slotSetListOrMissing('ideologies', ideologies.map(ucfirst))
}
