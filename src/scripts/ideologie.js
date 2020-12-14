/* global Slots fetchIdeologie fetchIdeologieDescription */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  const slots = ['description', 'image-logo', 'ideologies-derivees', 'ideologies-parentes']
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
    fetchIdeologie(id).then(renderIdeologie),
    fetchIdeologieDescription(id).then(renderIdeologieDescription),
  ])
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}

init()

function renderIdeologie(ideologie) {
  document.title = `Polit'IF – ${ucfirst(ideologie.nom)}`
  Slots.setText('nom', ucfirst(ideologie.nom))

  if (ideologie.image) {
    Slots.setAttr('image-logo', 'src', ideologie.image)
  } else if(ideologie.flag) {
    Slots.setAttr('image-logo', 'src', ideologie.flag)
  } else {
    Slots.setAttr('image-logo', 'src', '')
  }

}

function renderIdeologieDescription(ideologie) {
  console.log(ideologie.description)
  ideologie.description ? Slots.setText('description', ideologie.description) : Slots.hide('description')
}

function formatNumber(x) {
  return new Intl.NumberFormat().format(x)
}

// Mettre la première lettre en majuscule, tout en faisant attention aux caractères accentués
function ucfirst([first, ...rest]) {
  return first.toLocaleUpperCase() + rest.join('')
}

function renderPartiPersonnalites(personnalites) {
  const liens = personnalites.map(({ id, nom }) => ({
    href: `profil.html#${id}-${ucfirst(nom)}`,
    text: ucfirst(nom),
  }))
  Slots.setListOfLinks('membres-importants', liens)
}
