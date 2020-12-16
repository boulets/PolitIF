/* eslint-disable no-unused-vars */

// Constants
const DBPEDIA_API = 'https://dbpedia.org/sparql'
const WIKIDATA_API = 'https://query.wikidata.org/sparql'

/** Durée de vie en cache (en secondes) */
let CACHE_TTL = 0 // 5 * 60
const CACHE_PREFIX = 'politif_cache__'

if (CACHE_TTL > 0) {
  console.log('%c%s', 'background-color: #511; color: white; padding: 3px 6px; border-radius: 3px', `Attention: Le cache est activé (ttl=${CACHE_TTL}s)`)
} else {
  console.log('%c%s', 'background-color: #313; color: white; padding: 3px 6px; border-radius: 3px', 'Le cache est désactivé')
}

const PolitifCache = {
  get: Cache_get,
  set: Cache_set,
}

// Initial clean-up
Object.keys(localStorage)
  .filter(id => id.startsWith(CACHE_PREFIX))
  .forEach(id => {
    const now = Date.now()
    const timestamp = localStorage[id]?.timestamp
    if (!timestamp || (timestamp > now)) {
      // Stale cache
      delete localStorage[id]
    }
  })

/**
 * @return {object | undefined}
 * @param {string} id
 * @param {(value: object) => void} fixer
 */
function Cache_get(id, fixer) {
  const now = Date.now()
  const item = localStorage.getItem(CACHE_PREFIX + id)
  if (item !== undefined && item !== null) {
    try {
      const { timestamp, value } = JSON.parse(item)
      if (timestamp > now) {
        // Valid cache
        fixer?.(value) // custom deserialize function (e.g. for Dates)
        return value
      } else {
        // Stale cache
        delete localStorage[id]
      }
    } catch (error) {
      console.error(`Invalid cache for ${id}:`)
      console.dir(localStorage[id])
      console.error(error)
      delete localStorage[id]
    }
  }
}

/**
 * @param {string} id
 * @param {object} value
 */
function Cache_set(id, value) {
  const now = Date.now()
  localStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ timestamp: now + CACHE_TTL * 1000, value }))
}

function nullableDate(string) {
  return string === null || string === undefined ? null : new Date(string)
}

function wikidataUrl(req) {
  return WIKIDATA_API + '?format=json&query=' + encodeURIComponent(req)
}

function dbpediaUrl(req) {
  return DBPEDIA_API + '?format=json&query=' + encodeURIComponent(req)
}

function extractIdFromWikidataUrl(url) {
  return url.match(/entity\/(Q\d+)$/)?.[1]
}

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.innerText = text
  return div.innerHTML
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

// Mettre la première lettre en majuscule, tout en faisant attention aux caractères accentués
function ucfirst([first, ...rest]) {
  return first.toLocaleUpperCase() + rest.join('')
}

function createElementFromHtml(template) {
  const div = document.createElement('div')
  div.innerHTML = template
  return div.children[0]
}
