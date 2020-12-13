function Slots_getSlot(key) {
  const element = document.querySelector(`[data-key=${key}]`)
  if (element !== null) {
    return element
  } else {
    throw new Error(`Élément HTML [data-key=${key}] manquant.`)
  }
}

function Slots_hide(key) {
  const container = document.querySelector(`[data-contains-slot=${key}]`)
  if (container) {
    container.setAttribute('hidden', 'hidden')
  } else {
    const slot = document.querySelector(`[data-key=${key}]`)
    slot?.setAttribute('hidden', 'hidden')
  }
}

function Slots_showSlot(key) {
  const container = document.querySelector(`[data-contains-slot=${key}]`)
  if (container) {
    container.removeAttribute('hidden')
  } else {
    const slot = document.querySelector(`[data-key=${key}]`)
    slot?.removeAttribute('hidden')
  }
}

function Slots_setHtmlOrMissing(key, value) {
  Slots_showSlot(key)
  const element = Slots_getSlot(key)
  if (value === null || value === undefined) {
    element.innerHTML = EMPTY_PLACEHOLDER
  } else {
    element.innerHTML = value
  }
  element.removeAttribute('loading')
}

function Slots_setTextOrMissing(key, value) {
  Slots_showSlot(key)
  const element = Slots_getSlot(key)
  if (value === null || value === undefined) {
    element.innerHTML = EMPTY_PLACEHOLDER
  } else {
    element.innerText = value
  }
  element.removeAttribute('loading')
}

function Slots_setListOrMissing(key, values, type = 'ul') {
  Slots_showSlot(key)
  const element = Slots_getSlot(key)
  if (values === null || values === undefined || !Array.isArray(values)) {
    element.innerHTML = EMPTY_PLACEHOLDER
  } else {
    element.innerHTML = ''
    const listEl = document.createElement(type)
    for (const x of values) {
      const li = document.createElement('li')
      li.innerText = x
      listEl.appendChild(li)
    }
    element.appendChild(listEl)
  }
  element.removeAttribute('loading')
}

function Slots_setHtml(key, value) {
  Slots_showSlot(key)
  if (value === null || value === undefined) {
    return Slots_markLoading(value)
  } else {
    const element = Slots_getSlot(key)
    element.innerHTML = value
    element.removeAttribute('loading')
  }
}

function Slots_setText(key, value) {
  Slots_showSlot(key)
  if (value === null || value === undefined) {
    return Slots_markLoading(value)
  } else {
    const element = Slots_getSlot(key)
    element.innerText = value
    element.removeAttribute('loading')
  }
}

function Slots_setAttr(key, attribute, value) {
  const element = Slots_getSlot(key)
  element.setAttribute(attribute, value)
  element.removeAttribute('loading')
}

function Slots_markLoading(key) {
  const element = Slots_getSlot(key)
  element.innerHTML = ''
  element.setAttribute('loading', 'true')
  element.style.setProperty('--random', Math.random())
}

function Slots_markLoaded(key) {
  Slots_getSlot(key).removeAttribute('loading')
}

const Slots = {
  get: (key) => Slots_getSlot(key),

  setHtml: (key, html) => Slots_setHtmlOrMissing(key, html),
  setText: (key, text) => Slots_setTextOrMissing(key, text),
  setList: (key, list) => Slots_setListOrMissing(key, list),
  setAttr: (key, attr, value) => Slots_setAttr(key, attr, value),

  markLoading: (key) => Slots_markLoading(key),
  markLoaded: (key) => Slots_markLoaded(key),

  hide: (key) => Slots_hide(key),
  show: (key) => Slots_showSlot(key),
}
this.Slots = Slots
