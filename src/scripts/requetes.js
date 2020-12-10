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
    FILTER (LANG(?NomPoliticien)='fr' && YEAR(?DateEntreePosition) > 1789 && CONTAINS(LCASE(?NomPoliticien), "${s}")).
  } LIMIT ${n}`
}


function requete_profil_biographie(idProfil) {
  return `SELECT ?politician ?NomPoliticien ?DateDeNaissance ?DateDeDeces ?NomPere ?NomMere ?NomConjoint WHERE {
    BIND(wd:${idProfil} AS ?politician).

    # Nom prénom
    ?politician rdfs:label ?NomPoliticien.

    # Dates
    ?politician wdt:P569 ?DateDeNaissance.
    OPTIONAL {
      ?politician wdt:P570 ?DateDeDeces.
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

    FILTER(LANG(?NomPoliticien)='fr').
  }`
};

function requete_profil_mandats(idProfil) {
  return `SELECT ?politician ?Position ?DateEntreePosition ?DateSortiePosition WHERE {
    BIND(wd:Q2124 AS ?politician).

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
  }`
};
