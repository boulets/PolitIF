/* eslint-disable no-unused-vars */

//import {API_URL} from '../constants'
const API_URL = 'https://query.wikidata.org/sparql'
const DBPEDIA_URL = 'https://dbpedia.org/sparql'
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

  var resultats1

  console.log(`Fetching ${id}`)
  const req1 = requete_profil_biographie(id);
  const url1 = API_URL + '?format=json&query=' + encodeURIComponent(req1)
  await fetch(url1)
    .then(res => res.json())
    .then((resultats) => {
      resultats1 = resultats
    })
    console.log(resultats1)

  var resultats2
  const nomPoliticien = resultats1.results.bindings[0].NomPoliticien.value.replace(" ", "_")
  const reqDesc = requete_profil_description(nomPoliticien)
  const urlDesc = DBPEDIA_URL + '?format=json&query=' + encodeURIComponent(reqDesc)
  await fetch(urlDesc)
    .then(res => res.json())
    .then((resultats) => {
      resultats2 = resultats
    })
  console.log(resultats2)

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
    conjoint : resultats1.results.bindings[0].NomConjoint === undefined ? "" : resultats1.results.bindings[0].NomConjoint.value,
    enfants: 'TODO',
    description : resultats2.results.bindings[0].Description === undefined ? "Pas de description" : resultats2.results.bindings[0].Description.value
  }



  localStorage.setItem(id, JSON.stringify({ timestamp: now, value: res }))
  return res
}

async function fetchPositions(id) {
  var resultats
  const req = requete_profil_mandats(id);
  const url = API_URL + '?format=json&query=' + encodeURIComponent(req)
  await fetch(url)
    .then(res => res.json())
    .then((results) => {
      resultats = results
    })
  var mandats = []
  resultats.results.bindings.forEach(element =>(mandats.push(element)))
  console.log(mandats)
  return mandats
}

async function fetchPartis(id) {
  var resultats
  const req=requete_profil_partiPolitique(id);
  const url = API_URL + '?format=json&query=' + encodeURIComponent(req)
  await fetch(url)
    .then(res => res.json())
    .then((results) => {
      resultats = results
    })
  var partis = []
  resultats.results.bindings.forEach(element =>(partis.push(element)))
  console.log(partis)
  return partis
}

