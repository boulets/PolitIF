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
  return `SELECT ?politician ?NomPoliticien ?DateDeNaissance ?DateDeDeces ?NomLieuDeNaissance ?NomLieuDeDeces ?NomPere ?NomMere ?NomConjoint ?Image WHERE {
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

    FILTER(LANG(?NomPoliticien)='fr' && LANG(?NomLieuDeNaissance)='fr').
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
  }`
}

function requete_profil_description(nomPoliticien) {
  return `SELECT ?Description WHERE {
    ?uri rdfs:label '${nomPoliticien.replace(/'/g, '\\\'')}'@fr .
    OPTIONAL {
      ?uri dbo:abstract ?Description .
      FILTER(LANG(?Description)='fr') .
    }
  } LIMIT 1`
}

function requete_parti_general(idParti) {
  return `SELECT ?nom ?dateCreation ?dateDissolution ?president ?PresidentStartTime ?fondateur ?nombreAdherents ?dateNombreAdherents ?couleur ?positionnement ?siegeNumero ?siegeRue ?siegeCodePostal ?siegeVille ?SiegeStartTime ?imageLogo ?LogoStartTime ?siteWeb WHERE {
    BIND(wd:${idParti} AS ?parti).

    # Nom
    #?parti wdt:P1705 ?nom.
    ?parti rdfs:label ?nom.

    # Président et fondateur
    ?parti wdt:P488 ?President.
    ?parti p:P488 ?PresidentStatement.
    ?PresidentStatement pq:P580 ?PresidentStartTime. # On  considère que le dernier président est celui qui a débuté son mandat en dernier
    ?President rdfs:label ?president.

    ?parti wdt:P112 ?Fondateur.
    ?Fondateur rdfs:label ?fondateur.

    # Dates
    ?parti wdt:P571 ?dateCreation.
    OPTIONAL {
      ?parti wdt:P576 ?dateDissolution.
    }

    # Nombre d'adhérents
    OPTIONAL {
    ?parti p:P2124 ?nombreAdherentsStatement.
    ?nombreAdherentsStatement ps:P2124 ?nombreAdherents.
    ?nombreAdherentsStatement pq:P585 ?dateNombreAdherents.
    }

    # couleur politique (code hexa RGB)
    ?parti wdt:P465 ?couleur.

    # Positionnement politique
    ?parti wdt:P1387/rdfs:label ?positionnement.

    # Siège
    OPTIONAL {?parti p:P159 ?SiegeStatement.}
    OPTIONAL {
      ?SiegeStatement pq:P669/rdfs:label ?siegeRue.
      FILTER(LANG(?siegeRue)='fr').
    }
    OPTIONAL {?SiegeStatement pq:P670 ?siegeNumero.}
    OPTIONAL {?SiegeStatement pq:P281 ?siegeCodePostal.}
    OPTIONAL {
      ?SiegeStatement ps:P159/rdfs:label ?siegeVille.
      FILTER(LANG(?siegeVille)='fr').
    }
    OPTIONAL {?SiegeStatement pq:P580 ?SiegeStartTime.}

    # Logo
    OPTIONAL {
      ?parti p:P154 ?LogoStatement.
      ?LogoStatement ps:P154 ?imageLogo.
      ?LogoStatement pq:P580 ?LogoStartTime.
    }

    # Site Web
    OPTIONAL { ?parti wdt:P856 ?siteWeb. }

    FILTER(LANG(?nom)='fr').
    FILTER(LANG(?fondateur)='fr').
    FILTER(LANG(?president)='fr').
    FILTER(LANG(?positionnement)='fr').
  }
  ORDER BY DESC (?PresidentStartTime) DESC(?dateNombreAdherents) DESC(?SiegeStartTime) DESC(?LogoStartTime)
  LIMIT 1
  `
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
