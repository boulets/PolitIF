/* eslint-disable no-unused-vars */

function requete_recherche(recherche, n = 1) {
  const s = recherche.toLowerCase().replace(/"/g, ' ')
  return `SELECT DISTINCT ?politician ?NomPoliticien WHERE {
    # Tous les politiciens de nationalités françaises
    ?politician wdt:P106 wd:Q82955; wdt:P27 wd:Q142.
    ?politician rdfs:label ?NomPoliticien.

    # Les positions qu'ils ont occuppé
    ?politician p:P39 ?posStat.
    ?posStat pq:P580 ?DateEntreePosition.

    # Filtres
    filter(lang(?NomPoliticien) = 'fr').
    filter(year(?DateEntreePosition) > 1789).
    filter(contains(lcase(?NomPoliticien), "${s}")).
  } LIMIT ${n}`
}


function requete_profil_biographie(idProfil) {
  return `SELECT ?politician ?NomPoliticien ?DateDeNaissance ?DateDeDeces ?NomLieuDeNaissance ?NomLieuDeDeces ?NomPere ?NomMere ?NomConjoint ?Image ?Signature WHERE {
    BIND(wd:${idProfil} AS ?politician).

    # Nom prénom
    ?politician rdfs:label ?NomPoliticien.

    # Dates
    ?politician wdt:P569 ?DateDeNaissance.
    ?politician wdt:P19 ?LieuDeNaissance.
    ?LieuDeNaissance rdfs:label ?NomLieuDeNaissance.
    OPTIONAL {
      ?politician wdt:P18 ?Image.
    }

    OPTIONAL {
      ?politician wdt:P570 ?DateDeDeces.
      ?politician wdt:P20 ?LieuDeDeces.
      ?LieuDeDeces rdfs:label ?NomLieuDeDeces.
      FILTER(LANG(?NomLieuDeDeces)='fr').
    }
    OPTIONAL {
      ?politician wdt:P22 ?Pere.
      ?Pere rdfs:label ?NomPere.
      FILTER(LANG(?NomPere)='fr').
    }
    OPTIONAL {
      ?politician wdt:P25 ?Mere.
      ?Mere rdfs:label ?NomMere.
      FILTER(LANG(?NomMere)='fr').
    }
    OPTIONAL {
      ?politician wdt:P26 ?Conjoint.
      ?Conjoint rdfs:label ?NomConjoint.
      FILTER(LANG(?NomConjoint)='fr').
    }
    OPTIONAL {
      ?politician wdt:P109 ?Signature
    }

    FILTER(LANG(?NomPoliticien)='fr').
    FILTER(LANG(?NomLieuDeNaissance)='fr').
  }`
}

function requete_profil_mandats(idProfil) {
  return `SELECT ?politician ?Position ?DateEntreePosition ?DateSortiePosition WHERE {
    BIND(wd:${idProfil} AS ?politician).

    # Les positions qu'ils ont occuppé
    ?politician p:P39 ?posStat.
    ?posStat ps:P39 ?pos.
    ?pos rdfs:label ?Position.
    OPTIONAL {
      ?posStat pq:P580 ?DateEntreePosition.
    }
    OPTIONAL {
      ?posStat pq:P582 ?DateSortiePosition.
    }

    FILTER(LANG(?Position)='fr').
  }
  ORDER BY DESC (?DateEntreePosition)
  `
}

function requete_profil_description(nomPoliticien) {
  return  `SELECT ?Description WHERE {
    ?uri rdfs:label '${nomPoliticien.replace(/'/g, '\\\'')}'@fr .
    OPTIONAL {
      ?uri dbo:abstract ?Description .
      FILTER(LANG(?Description)='fr') .
    }
  } LIMIT 1`
}

function requete_profil_fratrie(idProfil) {
  return  `SELECT ?nomFratrie WHERE {
    BIND(wd:${idProfil} AS ?politician).

    OPTIONAL {
      ?politician wdt:P3373 ?Fratrie.
      ?Fratrie rdfs:label ?nomFratrie.
      FILTER(LANG(?nomFratrie)='fr').
    }
  }`
}

function requete_profil_enfants(idProfil) {
  return  `SELECT ?nomEnfants WHERE {
    BIND(wd:${idProfil} AS ?politician).

    OPTIONAL {
      ?politician wdt:P40 ?Enfants.
      ?Enfants rdfs:label ?nomEnfants.
      FILTER(LANG(?nomEnfants)='fr').
    }
  }`
}

function requete_ideology(idIdeology) {
  return `SELECT ?ideology ?ideologyDescription ?ideologyLabel ?image ?flagimage WHERE {
    BIND(wd:${idIdeology} AS ?ideology).

    # Opt : image
    OPTIONAL {
      ?ideology wdt:P18 ?image.
    }
    # Opt : flagimage
    OPTIONAL {
      ?ideology wdt:P41 ?flagimage.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" }
  }`
}

function requete_superclass(idIdeology) {
  return `SELECT ?ideology ?subclass ?subclassLabel ?subclassDescription WHERE {
    BIND(wd:${idIdeology} AS ?ideology).

    ?ideology wdt:P279 ?subclass.

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" }
  }`
}

function requete_profil_partiPolitique(idProfil) {
  return `SELECT ?politician ?NomPoliticien ?NomParti WHERE {
    BIND(wd:${idProfil} AS ?politician).
    # Nom prénom
    ?politician rdfs:label ?NomPoliticien.

    # Partis Politiques
    ?politician wdt:P102 ?Parti.
    ?Parti rdfs:label ?NomParti.

    FILTER(LANG(?NomPoliticien)='fr').
    FILTER(LANG(?NomParti)='fr').
  }`
}

function requete_parti_alignement(idParty) {
  return `SELECT ?party ?alignement ?alignementLabel ?alignementDescription ?ideology ?ideologyLabel ?ideologyDescription ?colors WHERE {
    BIND(wd:${idParty} AS ?party).

    OPTIONAL {
      ?party wdt:P1387 ?alignement.
    }
    OPTIONAL {
      ?party wdt:P1142 ?ideology.
    }
    OPTIONAL {
      ?party wdt:P465 ?colors.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" }.
  }`
}
