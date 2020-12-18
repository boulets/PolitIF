const EMPTY_PLACEHOLDER = '?'

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
    const slot = Slots_getSlot(key)
    slot?.setAttribute('hidden', 'hidden')
  }
}

function Slots_showSlot(key) {
  const container = document.querySelector(`[data-contains-slot=${key}]`)
  if (container) {
    container.removeAttribute('hidden')
  } else {
    const slot = Slots_getSlot(key)
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
    for (const v of values) {
      const li = document.createElement('li')
      listEl.appendChild(li)
      if (typeof v === 'string') {
        li.innerText = v
      } else {
        const { text, htmlAfter = '', htmlBefore = '' } = v
        li.innerText = text
        li.innerHTML = htmlBefore + li.innerHTML + htmlAfter
      }
    }
    element.appendChild(listEl)
  }
  element.removeAttribute('loading')
}

function Slots_setLink(key, href, text) {
  Slots_showSlot(key)
  const element = Slots_getSlot(key)
  element.innerHTML = ''
  const a = document.createElement('a')
  a.href = href
  a.innerText = text
  element.appendChild(a)
  element.removeAttribute('loading')
}

/**
 * @param {String} key
 * @param {Array<Record<'href' | 'text', string>>} values
 * @param {'ul' | 'ol'} type
 */
function Slots_setListOfLinks(key, values, { type = 'ul' } = {}) {
  if (values !== null && values !== undefined && Array.isArray(values)) {
    Slots_showSlot(key)
    const element = Slots_getSlot(key)
    element.removeAttribute('loading')
    element.innerHTML = ''
    const listEl = document.createElement(type)
    for (const v of values) {
      const { href, text } = v
      const { after = '', before = '' } = v
      const { htmlAfter = '', htmlBefore = '' } = v

      const t = before + text + after
      const li = document.createElement('li')
      if (href === null || href === undefined) {
        li.innerText = t
      } else {
        const a = document.createElement('a')
        a.href = href
        a.innerText = t
        li.appendChild(a)
      }
      li.innerHTML = htmlBefore + li.innerHTML + htmlAfter
      listEl.appendChild(li)
    }
    element.appendChild(listEl)
  }
}

function Slots_setAttr(key, attribute, value) {
  const element = Slots_getSlot(key)
  element.setAttribute(attribute, value)
  element.removeAttribute('loading')
}

function Slots_setImage(key, src, alt = '') {
  const element = Slots_getSlot(key)
  if (src === '') {
    // alors on veut plutôt une image vide qu'une icone "image cassée"
    const EMPTY_GIF_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    element.setAttribute('src', EMPTY_GIF_DATA_URL)
    element.setAttribute('alt', alt)
    element.setAttribute('loading', 'true')
  } else {
    element.setAttribute('src', src)
    element.setAttribute('alt', alt)
    element.addEventListener('load', () => {
      const t = getComputedStyle(element).transitionDuration
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.removeAttribute('loading')

      setTimeout(() => {
        element.style.transition = t
        element.style.opacity = '1'
      }, 0)
    })
  }
}

function Slots_markLoading(key) {
  const element = Slots_getSlot(key)
  Slots_showSlot(key)
  element.innerHTML = ''
  element.setAttribute('loading', 'true')
  element.style.setProperty('--random', Math.random())
}

function Slots_markLoaded(key) {
  const element = Slots_getSlot(key)
  element.setAttribute('loading', 'true')
  element.style.removeProperty('--random')
}

const Slots = {
  get: (key) => Slots_getSlot(key),

  setHtml: (key, html) => Slots_setHtmlOrMissing(key, html),
  setText: (key, text) => Slots_setTextOrMissing(key, text),
  setList: (key, list) => Slots_setListOrMissing(key, list),
  setListOfLinks: Slots_setListOfLinks,
  setAttr: (key, attr, value) => Slots_setAttr(key, attr, value),
  setImage: (key, src, alt = '') => Slots_setImage(key, src, alt),
  setLink: (key, href, text) => Slots_setLink(key, href, text),

  markLoading: (key) => Slots_markLoading(key),
  markLoaded: (key) => Slots_markLoaded(key),

  hide: (key) => Slots_hide(key),
  show: (key) => Slots_showSlot(key),
}
this.Slots = Slots
