/* eslint-disable no-unused-vars */
/* global requete_profil_biographie, requete_profil_mandats, requete_profil_description, requete_parti_description, requete_parti_general, requete_parti_ideologies, requete_parti_personnalites, requete_profil_partiPolitique, requete_profil_enfants, requete_profil_fratrie */

//import {API_URL} from '../constants'
const DBPEDIA_URL = 'https://dbpedia.org/sparql'
const WIKIDATA_API = 'https://query.wikidata.org/sparql'

/** Durée de vie en cache (en secondes) */
let CACHE_TTL = 0 //5 * 60

const checkDevToolsOpen = document.createElement('ignorez_ça')
let ignoreCheck = false
Object.defineProperty(checkDevToolsOpen, 'id', {
  get: function() {
    if (!ignoreCheck) {
      CACHE_TTL = 0
      console.log('%c%s', 'background-color: #313; color: white; padding: 3px 6px; border-radius: 3px', 'La console est ouverte donc le cache a été désactivé')
    }
    throw new Error('')
  }
})
console.log(checkDevToolsOpen)
ignoreCheck = true

if (CACHE_TTL > 0) {
  console.log('%c%s', 'background-color: #511; color: white; padding: 3px 6px; border-radius: 3px', `Attention: Le cache est activé (ttl=${CACHE_TTL}s)`)
}

function nullableDate(string) {
  return string === null || string === undefined ? null : new Date(string)
}

function wikidataUrl(req) {
  return WIKIDATA_API + '?format=json&query=' + encodeURIComponent(req)
}

/**
 * @return {object | undefined}
 * @param {string} id
 * @param {(value: object) => void} fixer
 */
function cached(id, fixer) {
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
function storeInCache(id, value) {
  const now = Date.now()
  localStorage.setItem('politif_cache__' + id, JSON.stringify({ timestamp: now, value }))
}

async function fetchProfil(id) {
  const cacheKey = `profil/${id}`
  const inCache = cached(cacheKey, (value) => {
    value.dateNaissance = nullableDate(value.dateNaissance)
    value.dateDeces = nullableDate(value.dateDeces)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_biographie(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    nom: donnees?.NomPoliticien?.value,
    dateNaissance : nullableDate(donnees?.DateDeNaissance?.value),
    lieuNaissance: donnees?.NomLieuDeNaissance?.value,
    dateDeces: nullableDate(donnees?.DateDeDeces?.value),
    lieuDeces: donnees?.NomLieuDeDeces?.value,
    image: donnees?.Image?.value,
    pere: donnees?.NomPere?.value,
    mere: donnees?.NomMere?.value,
    conjoint : donnees?.NomConjoint?.value,
    signature : donnees?.Signature?.value
  }

  storeInCache(cacheKey, res)
  return res
}

async function fetchDescription(nomPoliticien) {
  const cacheKey = `profil/${nomPoliticien}/description`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }
  try {
    const req = requete_profil_description(nomPoliticien)
    const url = DBPEDIA_URL + '?format=json&query=' + encodeURIComponent(req)
    const reponse = await fetch(url).then(res => res.json())
    const donnees = reponse.results.bindings[0]
    const v = donnees?.Description?.value
    storeInCache(cacheKey, v)
    return v
  } catch (error) {
    return ''
  }
}

async function fetchPositions(id) {
  const cacheKey = `profil/${id}/positions`
  const inCache = cached(cacheKey, (a) => {
    a.forEach(x => {
      x.debut = nullableDate(x.debut)
      x.fin = nullableDate(x.fin)
    })
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_mandats(id))
  const reponse = await fetch(url).then(res => res.json())
  const mandats = reponse.results.bindings.map(element => ({
    nom: element.Position?.value,
    debut: nullableDate(element.DateEntreePosition?.value),
    fin: nullableDate(element.DateSortiePosition?.value),
  }))
  storeInCache(cacheKey, mandats)
  return mandats
}

async function fetchParti(id) {
  const cacheKey = `parti/${id}`
  const inCache = cached(cacheKey, (x) => {
    x.dateCreation = nullableDate(x.dateCreation)
    x.dateDissolution = nullableDate(x.dateDissolution)
    x.nombreAdherents.date = nullableDate(x.nombreAdherents.date)
  })
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_general(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const description = await fetchDescriptionParti(id)

  const res = {
    nom: donnees?.NomParti?.value,
    logo: donnees?.ImageLogo?.value,
    president: donnees?.NomPresident?.value,
    fondateur: donnees?.NomFondateur?.value,
    dateCreation : nullableDate(donnees?.DateCreation?.value),
    dateDissolution: nullableDate(donnees?.DateDissolution?.value),
    nombreAdherents: {
      compte: donnees?.NombreAdherents?.value,
      date: nullableDate(donnees?.DateNombreAdherents?.value),
    },
    siege: donnees?.SiegeVille?.value,
    couleur: donnees?.Couleur?.value,
    siteWeb: donnees?.SiteWeb?.value,
    positionnement: donnees?.Positionnement?.value,
    description: description ?? 'Pas de description',
  }

  storeInCache(cacheKey, res)
  return res
}

async function fetchDescriptionParti(idParti) {
  const cacheKey = `parti/${idParti}/description`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }
  try {
    const req = requete_parti_description(idParti)
    const url = DBPEDIA_URL + '?format=json&query=' + encodeURIComponent(req)
    const reponse = await fetch(url).then(res => res.json())
    const donnees = reponse.results.bindings[0]
    const v = donnees?.Description?.value
    storeInCache(cacheKey, v)
    return v
  } catch (error) {
    return ''
  }
}

async function fetchPartiIdeologies(id) {
  const cacheKey = `parti/${id}/ideologies`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_ideologies(id))
  const reponse = await fetch(url).then(res => res.json())
  const ideologies = reponse.results.bindings
    .map(ideologie => ({
      id: extractIdFromWikidataUrl(ideologie.Ideologie?.value),
      nom: ideologie.NomIdeologie?.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide
  storeInCache(cacheKey, ideologies)
  return ideologies
}

async function fetchPartiPersonnalites(id) {
  const cacheKey = `parti/${id}/personnalites`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_parti_personnalites(id))
  const reponse = await fetch(url).then(res => res.json())
  const personnalites = reponse.results.bindings
    .map(personnalite => ({
      id: extractIdFromWikidataUrl(personnalite.politicien?.value),
      nom: personnalite.NomPoliticien?.value,
    }))
    .filter(nom => nom) // filtrer null, undefined, vide
  storeInCache(cacheKey, personnalites)
  return personnalites
}

async function fetchPartisOfProfil(id) {
  const cacheKey = `profil/${id}/partis`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_partiPolitique(id))
  const reponse = await fetch(url).then(res => res.json())
  const partis = reponse.results.bindings.map(parti => ({
    id: extractIdFromWikidataUrl(parti.Parti?.value),
    nom: parti.NomParti?.value,
  }))
  storeInCache(cacheKey, partis)
  return partis
}

async function fetchEnfantsOfProfil(id) {
  const cacheKey = `profil/${id}/enfants`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_enfants(id))
  const reponse = await fetch(url).then(res => res.json())
  const v = reponse.results.bindings.map(x => x.nomEnfants?.value).filter(x => x)
  storeInCache(cacheKey, v)
  return v
}

async function fetchFratrieOfProfil(id) {
  const cacheKey = `profil/${id}/enfants`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_profil_fratrie(id))
  const reponse = await fetch(url).then(res => res.json())
  const v = reponse.results.bindings.map(x => x.nomFratrie?.value).filter(x => x)
  storeInCache(cacheKey, v)
  return v
}

function extractIdFromWikidataUrl(url) {
  return url.match(/entity\/(Q\d+)$/)?.[1]
}

async function fetchIdeologie(id) {
  const cacheKey = `ideologie/${id}`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const url = wikidataUrl(requete_ideologie_images(id))
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    nom: donnees?.Nom?.value,
    image: donnees?.image?.value,
    flag: donnees?.flagimage?.value,
  }
  console.log(res)

  storeInCache(cacheKey, res)
  return res
}

async function fetchIdeologieDescription(id) {
  const cacheKey = `ideologie-description/${id}`
  const inCache = cached(cacheKey)
  if (inCache) { return inCache }

  const req = requete_ideologie_description(id)
  const url = DBPEDIA_URL + '?format=json&query=' + encodeURIComponent(req)
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings[0]

  const res = {
    description: donnees?.Description?.value ?? 'Pas de description',
  }

  storeInCache(cacheKey, res)
  return res
}
