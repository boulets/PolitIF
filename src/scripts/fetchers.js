/* eslint-disable no-unused-vars */
/* global requete_profil_biographie, requete_profil_mandats, requete_profil_description */

//import {API_URL} from '../constants'
const DBPEDIA_URL = 'https://dbpedia.org/sparql'
const WIKIDATA_API = 'https://query.wikidata.org/sparql'
/** Durée de vie en cache (en secondes) */
const CACHE_TTL = 0

function nullableDate(string) {
  return string === null || string === undefined ? null : new Date(string)
}

function wikidataUrl(req) {
  return WIKIDATA_API + '?format=json&query=' + encodeURIComponent(req)
}

async function fetchProfil(id) {
  // const now = Date.now()
  // const item = localStorage.getItem(id)
  // if (item !== undefined) {
  //   try {
  //     const { timestamp, value } = JSON.parse(item)
  //     if (timestamp + CACHE_TTL * 1000 > now) {
  //       console.log(`Fetching ${id} -> returning cached response`)
  //       value.dateNaissance = new Date(value.dateNaissance)
  //       value.dateDeces = new Date(value.dateDeces)
  //       return value
  //     } else {
  //       console.log(`Staled cache for ${id}`)
  //     }
  //   } catch (error) {
  //     console.log(`Invalid cache for ${id}`)
  //   }
  // }

  // console.log(`Fetching ${id}`)
  const url = wikidataUrl(requete_profil_biographie(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const nomPoliticien = donnees.NomPoliticien.value
  const description = await fetchDescription(nomPoliticien)

  const res = {
    nom: donnees?.NomPoliticien?.value,
    dateNaissance : nullableDate(donnees?.DateDeNaissance?.value),
    lieuNaissance: donnees?.NomLieuDeNaissance?.value,
    dateDeces: nullableDate(donnees?.DateDeDeces?.value),
    lieuDeces: donnees?.NomLieuDeDeces?.value,
    image: donnees?.Image?.value,
    pere: donnees?.NomPere?.value,
    mere: donnees?.NomMere?.value,
    fratrie: 'TODO',
    conjoint : donnees?.NomConjoint?.value,
    enfants: 'TODO',
    description : description === undefined ? 'Pas de description' : description
  }

  // localStorage.setItem(id, JSON.stringify({ timestamp: now, value: res }))
  return res
}

async function fetchDescription(nomPoliticien) {
  const req = requete_profil_description(nomPoliticien)
  const url = DBPEDIA_URL + '?format=json&query=' + encodeURIComponent(req)
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]
  return donnees?.Description?.value
}

async function fetchPositions(id) {
  const url = wikidataUrl(requete_profil_mandats(id))
  const reponse = await fetch(url).then(res => res.json())
  const mandats = reponse.results.bindings.map(element => ({
    nom: element.Position?.value,
    debut: element.DateEntreePosition?.value,
    fin: element.DateSortiePosition?.value,
  }))
  return mandats
}

async function fetchParti(id) {
  // const now = Date.now()
  // const item = localStorage.getItem(id)
  // if (item !== undefined) {
  //   try {
  //     const { timestamp, value } = JSON.parse(item)
  //     if (timestamp + CACHE_TTL * 1000 > now) {
  //       console.log(`Fetching ${id} -> returning cached response`)
  //       value.dateNaissance = new Date(value.dateNaissance)
  //       value.dateDeces = new Date(value.dateDeces)
  //       return value
  //     } else {
  //       console.log(`Staled cache for ${id}`)
  //     }
  //   } catch (error) {
  //     console.log(`Invalid cache for ${id}`)
  //   }
  // }

  // console.log(`Fetching ${id}`)
  const url = wikidataUrl(requete_parti_general(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  console.log(donnees);

  const nomParti = donnees.NomParti.value
  const description = undefined // = await fetchDescription(nomPoliticien)

  const res = {
    nom: donnees?.NomParti?.value,
    logo: donnees?.ImageLogo?.value,
    president: donnees?.NomPresident?.value,
    fondateur: donnees?.NomFondateur?.value,
    dateCreation : nullableDate(donnees?.DateCreation?.value),
    dateDissolution: nullableDate(donnees?.DateDissolution?.value),
    nombreAdherents: donnees?.NombreAdherents?.value + " (" + dateToString(nullableDate(donnees?.DateNombreAdherents?.value)) + ")",
    siege: donnees?.SiegeVille?.value,
    couleur: donnees?.Couleur?.value,
    siteWeb: donnees?.SiteWeb?.value,
    positionnement: donnees?.Positionnement?.value,

    description : description === undefined ? 'Pas de description' : description
  }
  console.log(res)

  // localStorage.setItem(id, JSON.stringify({ timestamp: now, value: res }))
  return res
}
