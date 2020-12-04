/* eslint-disable no-unused-vars */

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
  const slotNom = document.querySelector('[data-key=nom]')
  const slotDateNaissance = document.querySelector('[data-key=date-naissance]')
  const slotDateDeces = document.querySelector('[data-key=date-deces]')
  const slotLieuNaissance = document.querySelector('[data-key=lieu-naissance]')
  const slotLieuDeces = document.querySelector('[data-key=lieu-deces]')
  const slotDescription = document.querySelector('[data-key=description]')
  const imageProfil = document.querySelector('[data-key=personne-image]')

  if ([slotNom, slotDateNaissance, slotDateDeces, slotLieuNaissance, slotLieuDeces, slotDescription, imageProfil].includes(null)) {
    console.error({ slotNom, slotDateNaissance, slotDateDeces, slotLieuNaissance, slotLieuDeces, slotDescription, imageProfil })
    throw new Error('Affichage de la page Profil impossible: certains éléments HTML sont manquants')
  }

  if (profil === null) {
    slotNom.innerText = 'Chargement...'
    slotDateNaissance.innerHTML = 'Chargement...'
    slotDateDeces.innerHTML = 'Chargement...'
    slotLieuNaissance.innerText =  'Chargement...'
    slotLieuDeces.innerText = 'Chargement...'
    slotDescription.innerText = ''
    imageProfil.setAttribute('src', '')
  } else {
    slotNom.innerText = profil.nom
    slotDateNaissance.innerHTML = dateToHtml(profil.dateNaissance)
    slotDateDeces.innerHTML = dateToHtml(profil.dateDeces)
    slotLieuNaissance.innerText = profil.lieuNaissance
    slotLieuDeces.innerText = profil.lieuDeces
    slotDescription.innerText = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Impedit, explicabo dolor! Nostrum facilis blanditiis inventore vero debitis temporibus culpa cupiditate accusantium ipsam? Quam rem inventore delectus amet minus itaque nemo.'.replace(/[^\S\n]+/g, ' ')
    slotDescription.innerHTML = '<p>' + slotDescription.innerHTML.split('\n\n').join('</p><p>') + '</p>'
    imageProfil.setAttribute('src', profil.image)
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
