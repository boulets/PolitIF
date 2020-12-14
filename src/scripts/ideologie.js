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
    fetchIdeologiesDerivees(id).then(renderIdeologiesDerivees),
    fetchIdeologiesParentes(id).then(renderIdeologiesParentes),
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
  ideologie.description ? Slots.setText('description', ideologie.description) : Slots.hide('description')
}

function formatNumber(x) {
  return new Intl.NumberFormat().format(x)
}

// Mettre la première lettre en majuscule, tout en faisant attention aux caractères accentués
function ucfirst([first, ...rest]) {
  return first.toLocaleUpperCase() + rest.join('')
}

function renderIdeologiesDerivees(ideologies) {
  if(!ideologies || ideologies.length === 0){
    Slots.hide('ideologies-derivees')
  } else {
    const liens = ideologies.map(({id, nom}) => ({
      href: `ideologie.html#${id}-${ucfirst(nom)}`,
      text: ucfirst(nom),
    }))
    Slots.setListOfLinks('ideologies-derivees', liens)
  }
}

function renderIdeologiesParentes(ideologies) {
  if(!ideologies || ideologies.length === 0){
    Slots.hide('ideologies-parentes')
  } else {
    const liens = ideologies.map(({id, nom}) => ({
      href: `ideologie.html#${id}-${ucfirst(nom)}`,
      text: ucfirst(nom),
    }))
    Slots.setListOfLinks('ideologies-parentes', liens)
  }
}
