/* eslint-disable no-unused-vars */

/** Durée de vie en cache (en secondes) */
const CACHE_TTL = 60

const fetchProfil_cache = {}
async function fetchProfil(id) {
  const now = Date.now()
  if (fetchProfil_cache[id] !== undefined) {
    const { timestamp, value } = fetchProfil_cache[id]
    if (timestamp + CACHE_TTL * 1000 > now) {
      console.log(`Fetching ${id} -> returning cached response`)
      return value
    } else {
      console.log(`Staled cache for ${id}`)
    }
  }

  console.log(`Fetching ${id}`)

  await new Promise(x => setTimeout(x, 600))

  const res = {
    nom: 'Valéry Giscard d\'Estaing',
    dateNaissance: new Date('1926-02-02'),
    lieuNaissance: 'Coblence, Allemagne (RFA)',
    dateDeces: new Date('2020-12-02'),
    lieuDeces: 'Loir-et-Cher, France',
    image: '/img/vge.jpg',
  }

  fetchProfil_cache[id] = { timestamp: now, value: res }
  return res
}
