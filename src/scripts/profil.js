/* global renderProfilOrEmptySlots, renderProfilPartial, renderPositions, fetchProfil, fetchPositions */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  renderProfilPartial(null)
  if (nameWhileLoading) {
    renderProfilPartial({ nom: nameWhileLoading })
  }

  let profilComplet = {}
  Promise.all([
    fetchProfil(id)
      .then(async profil => {
        profilComplet = { ...profilComplet, ...profil }
        renderProfilOrHide(profilComplet)
        const description = await fetchDescription(profil.nom)
        profilComplet = { ...profilComplet, description }
        description && Slots.setText('description', description)
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
