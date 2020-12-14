/* global Slots dateToHtml fetchParti fetchPartiIdeologies fetchPartiPersonnalites */

function escapeHtml(text) {
  const div = document.createElement('div')
  div.innerText = text
  return div.innerHTML
}

function adresseToText({ numero, rue, ville, codePostal }) {
  if (numero && rue && ville && codePostal) {
    return `${numero} ${rue}, ${ville} ${codePostal}`
  } else if (numero && rue && ville) {
    return `${numero} ${rue}, ${ville}`
  } else if (rue && ville) {
    return `${rue}, ${ville}`
  } if (ville) {
    return ville
  }
}

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  const slots = ['description', 'image-logo', 'president', 'fondateur', 'date-creation', 'date-dissolution', 'nombre-adherents', 'positionnement', 'site-web', 'siege']
  slots.forEach(key => Slots.markLoading(key))
  Slots.setAttr('image-logo', 'src', '')

  if (nameWhileLoading) {
    document.title = `Polit'IF – ${nameWhileLoading}`
    Slots.setText('nom', nameWhileLoading)
  } else {
    document.title = 'Polit\'IF'
    Slots.markLoading('nom')
  }

  return Promise.all([
    fetchParti(id).then(renderParti),
    fetchPartiIdeologies(id).then(renderPartiIdeologies),
    fetchPartiPersonnalites(id).then(renderPartiPersonnalites),
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
  parti.description ? Slots.setText('description', parti.description) : Slots.hide('description')
  parti.president ? Slots.setText('president', parti.president) : Slots.hide('president')
  parti.fondateur ? Slots.setText('fondateur', parti.fondateur) : Slots.hide('fondateur')
  parti.positionnement ? Slots.setText('positionnement', parti.positionnement) : Slots.hide('positionnement')
  if (parti.siege) {
    const adr = adresseToText(parti.siege)
    const href = 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(adr).replace(/%20/g, '+')
    if (adr) {
      const html = parti.siege.date
        ? `${escapeHtml(adr)} (depuis le ${dateToHtml(parti.siege.date)})`
        : `${escapeHtml(adr)}`
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
    Slots.setAttr('image-logo', 'src', parti.logo)
  } else {
    Slots.setAttr('image-logo', 'src', '')
  }

  if (parti.couleur) {
    Slots.get('couleur').style.setProperty('--couleur-parti', '#' + parti.couleur)
  }

  if (parti.siteWeb) {
    Slots.setText('site-web', parti.siteWeb.replace(/^https?:\/\/([^/]+).*$/, '$1'))
    Slots.setAttr('site-web', 'href', parti.siteWeb)
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

// Mettre la première lettre en majuscule, tout en faisant attention aux caractères accentués
function ucfirst([first, ...rest]) {
  return first.toLocaleUpperCase() + rest.join('')
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
