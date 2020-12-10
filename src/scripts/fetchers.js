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
    nom: resultats1.results.bindings[0].NomPoliticien === undefined ? "" : resultats1.results.bindings[0].NomPoliticien.value,
    dateNaissance : resultats1.results.bindings[0].DateDeNaissance === undefined ? "" : new Date(resultats1.results.bindings[0].DateDeNaissance.value),
    lieuNaissance: resultats1.results.bindings[0].NomLieuDeNaissance === undefined ? "" : resultats1.results.bindings[0].NomLieuDeNaissance.value,
    dateDeces: resultats1.results.bindings[0].DateDeDeces === undefined ? "" : new Date(resultats1.results.bindings[0].DateDeDeces.value),
    lieuDeces: resultats1.results.bindings[0].NomLieuDeDeces === undefined ? "" : resultats1.results.bindings[0].NomLieuDeDeces.value,
    image: resultats1.results.bindings[0].Image.value,
    pere: resultats1.results.bindings[0].NomPere === undefined ? "" : resultats1.results.bindings[0].NomPere.value,
    mere: resultats1.results.bindings[0].NomMere === undefined ? "" : resultats1.results.bindings[0].NomMere.value,
    fratrie: 'TODO',
    conjoint : resultats1.results.bindings[0].NomConjoint.value === undefined ? "" : resultats1.results.bindings[0].NomConjoint.value,
    enfants: 'TODO'
  }

  localStorage.setItem(id, JSON.stringify({ timestamp: now, value: res }))
  return res
}

function isUndefined(value) {
  if(value === undefined) {
    return "";
  } else {
    return value;
  }
}
