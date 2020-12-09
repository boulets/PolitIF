/* eslint-disable no-unused-vars */

//import {API_URL} from '../constants'
const API_URL = 'https://query.wikidata.org/sparql'
/** Durée de vie en cache (en secondes) */
const CACHE_TTL = 0

async function fetchProfil(id) {
  const now = Date.now()
  const item = localStorage.getItem(id)
  if (item !== undefined) {
    try {
      const { timestamp, value } = JSON.parse(item)
      if (timestamp + CACHE_TTL * 1000 > now) {
        console.log(`Fetching ${id} -> returning cached response`)
        value.dateNaissance = new Date(value.dateNaissance)
        value.dateDeces = new Date(value.dateDeces)
        return value
      } else {
        console.log(`Staled cache for ${id}`)
      }
    } catch (error) {
      console.log(`Invalid cache for ${id}`)
    }
  }

  var resultats1, resultats2;

  console.log(`Fetching ${id}`)
  const req1 = requete_profil_biographie(id);
  const url1 = API_URL + '?format=json&query=' + encodeURIComponent(req1)
  await fetch(url1)
    .then(res => res.json())
    .then((resultats) => {
      resultats1 = resultats
    })
    console.log(resultats1)

  console.log(`Fetching ${id}`)
  const req2 = requete_profil_mandats(id);
  const url2 = API_URL + '?format=json&query=' + encodeURIComponent(req2)
  await fetch(url2)
    .then(res => res.json())
    .then((resultats) => {
      resultats2 = resultats
    })

  const res = {
    nom: resultats1.results.bindings[0].NomPoliticien.value,
    //dateNaissance : resultats1.results.bindings[0].DateDeNaissance.value,
    dateNaissance: new Date('1926-02-02'),
    lieuNaissance: 'Coblence, Allemagne (RFA)',
    dateDeces: new Date('2020-12-02'),
    lieuDeces: 'Loir-et-Cher, France',
    image: 'img/vge.jpg',
    pere: 'Edmond Giscard d\'Estaing',
    mere: 'May Bardoux',
    fratrie: 'Olivier Giscard d\'Estaing, Sylvie Giscard d\'Estaing',
    conjoint : 'Anne-Aymone Giscard d\'Estaing',
    enfants: 'Louis, Valérie-Anne, Henri, Jacinthe'
  }

  localStorage.setItem(id, JSON.stringify({ timestamp: now, value: res }))
  return res
}
