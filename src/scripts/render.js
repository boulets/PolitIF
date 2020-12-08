/* eslint-disable no-unused-vars */

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

function renderProfil(profil) {
  if (profil === null) {
    slotSetLoading('nom')
    slotSetLoading('date-naissance')
    slotSetLoading('date-deces')
    slotSetLoading('lieu-naissance')
    slotSetLoading('lieu-deces')
    slotSetLoading('description')
    slotSetLoading('pere')
    slotSetLoading('mere')
    slotSetLoading('fratrie')
    slotSetLoading('conjoint')
    slotSetLoading('enfants')
    slotSetAttribute('image-personne', 'src', '')
    slotSetLoading('image-personne')
  } else {
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
}

function renderRecherche(search) {
  console.log('renderRecherche')
  const entreeRecherche = document.getElementById('search')
  if (entreeRecherche === null) {
    console.error({ entreeRecherche })
    throw new Error('Affichage de la page Recherche impossible: certains éléments HTML sont manquants')
  }
  entreeRecherche.value = search
}
