/* eslint-disable no-unused-vars */

// https://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
const EMPTY_IMAGE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

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
  slotSetText('nom', profil.nom)
  slotSetHtml('date-naissance', dateToHtml(profil.dateNaissance))
  slotSetHtml('date-deces', dateToHtml(profil.dateDeces))
  slotSetText('lieu-naissance', profil.lieuNaissance)
  slotSetText('lieu-deces', profil.lieuDeces)
  slotSetText('pere', profil.pere)
  slotSetText('mere', profil.mere)
  slotSetText('fratrie', profil.fratrie)
  slotSetText('conjoint', profil.conjoint)
  slotSetText('enfants', profil.enfants)
  slotSetHtml('description', '<p>' + 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Impedit, explicabo dolor! Nostrum facilis blanditiis inventore vero debitis temporibus culpa cupiditate accusantium ipsam? Quam rem inventore delectus amet minus itaque nemo.'.replace(/[^\S\n]+/g, ' ').split('\n\n').join('</p><p>') + '</p>')
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
