/* eslint-disable no-unused-vars */

//import {EMPTY_IMAGE_DATA_URL} from '../constants'
// https://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
const EMPTY_IMAGE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const EMPTY_PLACEHOLDER = "-"

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

function slotSetHtml(key, value) {
  const element = getSlot(key)
  element.innerHTML = value
  element.removeAttribute('loading')
}
function slotSetText(key, value) {
  const element = getSlot(key)
  element.innerText = value
  element.removeAttribute('loading')
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
    'description', 'pere', 'mere', 'fratrie', 'conjoint', 'enfants'
  ].forEach(slotSetLoading)
  slotSetAttribute('image-personne', 'src', EMPTY_IMAGE_DATA_URL)
  slotSetLoading('image-personne')
}
function renderProfil(profil) {
  document.title = `Polit'IF – ${profil.nom}`
  profil.nom !== "" ? slotSetText('nom', profil.nom) : slotSetText('nom', "-")
  profil.dateNaissance !== "" ? slotSetHtml('date-naissance', dateToHtml(profil.dateNaissance)) : slotSetText('date-naissance', EMPTY_PLACEHOLDER)
  profil.dateDeces !== "" ? slotSetHtml('date-deces', dateToHtml(profil.dateDeces)) : slotSetHtml('date-deces', "-")
  profil.lieuNaissance !== "" ? slotSetText('lieu-naissance', profil.lieuNaissance) : slotSetHtml('lieu-naissance', "-")
  profil.lieuDeces !== "" ? slotSetText('lieu-deces', profil.lieuDeces) : slotSetHtml('lieu-deces',"-")
  profil.pere !== "" ? slotSetText('pere', profil.pere) : slotSetText('pere', EMPTY_PLACEHOLDER)
  profil.mere !== "" ? slotSetText('mere', profil.mere) : slotSetText('mere', EMPTY_PLACEHOLDER)
  profil.fratrie !== "" ? slotSetText('fratrie', profil.fratrie) : slotSetText('fratrie', EMPTY_PLACEHOLDER)
  profil.conjoint !== "" ? slotSetText('conjoint', profil.conjoint) : slotSetText('fratrie', EMPTY_PLACEHOLDER)
  profil.enfants !== "" ? slotSetText('enfants', profil.enfants) : slotSetText('enfants', EMPTY_PLACEHOLDER)
  slotSetHtml('description', '<p>' + profil.description.replace(/[^\S\n]+/g, ' ').split('\n\n').join('</p><p>') + '</p>')
  slotSetAttribute('image-personne', 'src', profil.image)
}
function renderProfilOrLoading(profil) {
  if (profil === null) {
    renderLoadingProfil()
  } else {
    renderProfil(profil)
  }
}
function renderProfilPartial({ nom }) {
  slotSetText('nom', nom)
  document.title = `Polit'IF – ${nom}`
}

function renderRecherche(search) {
  console.log('renderRecherche')
  const entreeRecherche = document.getElementById('search')
  if (entreeRecherche === null) {
    throw new Error('Affichage de la page Recherche impossible: éléments #search manquant')
  }
  entreeRecherche.value = search
}

function renderPositions(positions) {

  positionsList.innerHTML = ''
  positions.forEach(element => {
    const dateDebut = element.DateEntreePosition === undefined ? "Non connu" : dateToString(new Date(element.DateEntreePosition.value));
    const dateFin = element.DateSortiePosition === undefined ? "Non Connu" : dateToString(new Date(element.DateSortiePosition.value))
    const li = document.createElement('li')
    li.innerHTML = "<b>" + element.Position.value + "</b>" + " du " + dateDebut + " au " + dateFin;
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
