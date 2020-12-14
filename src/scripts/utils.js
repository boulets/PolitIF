/* eslint-disable no-unused-vars */

// Constants
const DBPEDIA_API = 'https://dbpedia.org/sparql'
const WIKIDATA_API = 'https://query.wikidata.org/sparql'

/** Durée de vie en cache (en secondes) */
let CACHE_TTL = 0 // 5 * 60

// const checkDevToolsOpen = document.createElement('ignorez_ça')
// let ignoreCheck = false
// Object.defineProperty(checkDevToolsOpen, 'id', {
//   get: function() {
//     if (!ignoreCheck) {
//       CACHE_TTL = 0
//       console.log('%c%s', 'background-color: #313; color: white; padding: 3px 6px; border-radius: 3px', 'La console est ouverte donc le cache a été désactivé')
//     }
//     throw new Error('')
//   }
// })
// console.log(checkDevToolsOpen)
// ignoreCheck = true

if (CACHE_TTL > 0) {
  console.log('%c%s', 'background-color: #511; color: white; padding: 3px 6px; border-radius: 3px', `Attention: Le cache est activé (ttl=${CACHE_TTL}s)`)
}

const PolitifCache = {
  get: Cache_get,
  set: Cache_set,
}

/**
 * @return {object | undefined}
 * @param {string} id
 * @param {(value: object) => void} fixer
 */
function Cache_get(id, fixer) {
  const now = Date.now()
  const item = localStorage.getItem('politif_cache__' + id)
  if (item !== undefined) {
    try {
      const { timestamp, value } = JSON.parse(item)
      if (timestamp + CACHE_TTL * 1000 > now) {
        // console.log(`Fetching ${id} -> returning cached response`)
        fixer?.(value)
        return value
      } else {
        // console.log(`Staled cache for ${id}`)
      }
    } catch (error) {
      // console.log(`Invalid cache for ${id}`)
      // console.error(error)
    }
  }
}

/**
 * @param {string} id
 * @param {object} value
 */
function Cache_set(id, value) {
  const now = Date.now()
  localStorage.setItem('politif_cache__' + id, JSON.stringify({ timestamp: now, value }))
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
