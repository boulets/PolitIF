/* eslint-disable no-unused-vars */

//import {EMPTY_IMAGE_DATA_URL} from '../constants'
// https://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
const EMPTY_IMAGE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const EMPTY_PLACEHOLDER = '?'

const positionsList = document.getElementById('positionsList')
const partisList = document.getElementById('partisList')

function getSlot(key) {
  const element = document.querySelector(`[data-key=${key}]`)
  if (element !== null) {
    return element
  } else {
    throw new Error(`Élément HTML [data-key=${key}] manquant.`)
  }
}

function hideSlot(key) {
  const container = document.querySelector(`[data-contains-slot=${key}]`)
  if (container) {
    container.setAttribute('hidden', 'hidden')
  } else {
    const slot = document.querySelector(`[data-key=${key}]`)
    slot?.setAttribute('hidden', 'hidden')
  }
}

function showSlot(key) {
  const container = document.querySelector(`[data-contains-slot=${key}]`)
  if (container) {
    container.removeAttribute('hidden')
  } else {
    const slot = document.querySelector(`[data-key=${key}]`)
    slot?.removeAttribute('hidden')
  }
}

function slotSetHtmlOrMissing(key, value) {
  showSlot(key)
  const element = getSlot(key)
  if (value === null || value === undefined) {
    element.innerHTML = EMPTY_PLACEHOLDER
  } else {
    element.innerHTML = value
  }
  element.removeAttribute('loading')
}
function slotSetTextOrMissing(key, value) {
  showSlot(key)
  const element = getSlot(key)
  if (value === null || value === undefined) {
    element.innerHTML = EMPTY_PLACEHOLDER
  } else {
    element.innerText = value
  }
  element.removeAttribute('loading')
}

function slotSetHtml(key, value) {
  showSlot(key)
  if (value === null || value === undefined) {
    return slotSetLoading(value)
  } else {
    const element = getSlot(key)
    element.innerHTML = value
    element.removeAttribute('loading')
  }
}
function slotSetText(key, value) {
  showSlot(key)
  if (value === null || value === undefined) {
    return slotSetLoading(value)
  } else {
    const element = getSlot(key)
    element.innerText = value
    element.removeAttribute('loading')
  }
}
function slotSetAttribute(key, attribute, value) {
  const element = getSlot(key)
  element.setAttribute(attribute, value)
  element.removeAttribute('loading')
}
function slotSetLoading(key) {
  const element = getSlot(key)
  element.innerHTML = ''
  element.setAttribute('loading', 'true')
  element.style.setProperty('--random', Math.random())
}
function slotSetLoaded(key) {
  getSlot(key).removeAttribute('loading')
}

function dateToHtml(/** @type Date */ date) {
  const formatMachine = date.toISOString().slice(0, 10)
  const formatHumain = date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return `<time datetime="${formatMachine}">${formatHumain}</time>`
}

function dateToString(date) {
  const formatHumain = date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return formatHumain
}

function renderLoadingProfil() {
  [
    'nom', 'date-naissance', 'date-deces', 'lieu-naissance', 'lieu-deces',
    'description', 'pere', 'mere', 'fratrie', 'conjoint', 'enfants',
  ].forEach(slotSetLoading)
  slotSetAttribute('image-personne', 'src', EMPTY_IMAGE_DATA_URL)
  slotSetLoading('image-personne')
}

function renderProfilOrEmptySlots(profil) {
  document.title = `Polit'IF – ${profil.nom}`
  slotSetTextOrMissing('nom', profil.nom)
  slotSetHtmlOrMissing('date-naissance', profil.dateNaissance && dateToHtml(profil.dateNaissance))
  slotSetTextOrMissing('lieu-naissance', profil.lieuNaissance)
  if (profil.dateDeces || profil.lieuDeces) {
    slotSetHtmlOrMissing('date-deces', profil.dateDeces && dateToHtml(profil.dateDeces))
    slotSetTextOrMissing('lieu-deces', profil.lieuDeces)
  } else {
    hideSlot('date-deces')
    hideSlot('lieu-deces')
  }
  slotSetTextOrMissing('pere', profil.pere)
  slotSetTextOrMissing('mere', profil.mere)
  slotSetTextOrMissing('fratrie', profil.fratrie)
  slotSetTextOrMissing('conjoint', profil.conjoint)
  slotSetTextOrMissing('enfants', profil.enfants)
  slotSetHtmlOrMissing('description', '<p>' + profil.description.replace(/[^\S\n]+/g, ' ').split('\n\n').join('</p><p>') + '</p>')
  if (profil.image) {
    slotSetAttribute('image-personne', 'src', profil.image)
  } else {
    hideSlot('image-personne')
  }
  if (profil.signature) {
    slotSetAttribute('signature-personne', 'src', profil.signature)
  } else {
    hideSlot('signature-personne')
  }
}
function renderProfilPartial(profil) {
  if (profil === null) {
    renderLoadingProfil()
  } else {
    if (profil.nom) {
      document.title = `Polit'IF – ${profil.nom}`
      slotSetText('nom', profil.nom)
    }
    profil.dateNaissance && slotSetHtml('date-naissance', profil.dateNaissance && dateToHtml(profil.dateNaissance))
    profil.dateDeces && slotSetHtml('date-deces', profil.dateDeces && dateToHtml(profil.dateDeces))
    profil.lieuNaissance && slotSetText('lieu-naissance', profil.lieuNaissance)
    profil.lieuDeces && slotSetText('lieu-deces', profil.lieuDeces)
    profil.pere && slotSetText('pere', profil.pere)
    profil.mere && slotSetText('mere', profil.mere)
    profil.fratrie && slotSetText('fratrie', profil.fratrie)
    profil.conjoint && slotSetText('conjoint', profil.conjoint)
    profil.enfants && slotSetText('enfants', profil.enfants)
    profil.description && slotSetHtml('description', '<p>' + profil.description.replace(/[^\S\n]+/g, ' ').split('\n\n').join('</p><p>') + '</p>')
  }
}

function renderRecherche(search) {
  const entreeRecherche = document.getElementById('search')
  if (entreeRecherche === null) {
    throw new Error('Affichage de la page Recherche impossible: éléments #search manquant')
  }
  entreeRecherche.value = search
}

function renderPositions(positions) {
  positionsList.innerHTML = ''
  positions.forEach(mandat => {
    const { debut, fin, nom } = mandat
    const dateDebut = debut ? dateToString(new Date(debut)) : '?'
    const dateFin = fin ? dateToString(new Date(fin)) : '?'
    const li = document.createElement('li')
    li.innerHTML = `<b>${nom}</b> du ${dateDebut} au ${dateFin}`
    positionsList.appendChild(li)
  })
}

function renderPartis(partis) {
  partisList.innerHTML = ''
  partis.forEach(element => {
    const li = document.createElement('li')
    li.innerText = element.NomParti.value
    partisList.appendChild(li)
  })
}
