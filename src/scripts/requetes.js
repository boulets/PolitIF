/* eslint-disable no-unused-vars */

function requete_recherche_politicien(recherche, n = 1) {
  const segments = recherche.toLowerCase().replace(/"/g, ' ').split(/\s+/g)
  return `SELECT DISTINCT ?politician ?NomPoliticien {
    # Tous les politiciens de nationalités françaises
    # ?politician wdt:P106 wd:Q82955.
    ?politician wdt:P27 wd:Q142.
    ?politician rdfs:label ?NomPoliticien.

    # Les positions qu'ils ont occuppé
    ?politician p:P39 ?posStat.
    ?posStat pq:P580 ?DateEntreePosition.

    # Filtres
    filter(langMatches(lang(?NomPoliticien), 'fr')).
    filter(year(?DateEntreePosition) > 1789).
    ${segments.map(s => `filter(contains(lcase(?NomPoliticien), "${s}")).`).join('\n')}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" }
  } LIMIT ${n}`
}

function requete_recherche_parti(recherche, n = 1) {
  const s = recherche.toLowerCase().replace(/"/g, ' ')
  return `SELECT DISTINCT ?parti ?NomParti WHERE {
    # Tous les partis
    ?parti rdfs:label ?NomParti.
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
  return `SELECT ?Description WHERE {
    ?uri rdfs:label '${nomPoliticien.replace(/'/g, '\\\'')}'@fr .
    OPTIONAL {
      ?uri dbo:abstract ?Description .
      FILTER(LANG(?Description)='fr') .
    }
  } LIMIT 1`
}

function requete_parti_general(idParti) {
  return `SELECT ?NomParti ?DateCreation ?DateDissolution ?NomPresident ?PresidentStartTime ?NomFondateur ?NombreAdherents ?DateNombreAdherents ?Couleur ?Positionnement ?SiegeNumero ?SiegeRue ?SiegeCodePostal ?SiegeVille ?SiegeStartTime ?ImageLogo ?LogoStartTime ?SiteWeb WHERE {
    BIND(wd:${idParti} AS ?parti).

    # Nom
    #?parti wdt:P1705 ?NomParti.
    ?parti rdfs:label ?NomParti.

    # Président
    ?parti wdt:P488 ?President.
    ?parti p:P488 ?PresidentStatement.
    OPTIONAL{?PresidentStatement pq:P580 ?PresidentStartTime.} # On  considère que le dernier président est celui qui a débuté son mandat en dernier
    ?President rdfs:label ?NomPresident.

    # Fondateur
    OPTIONAL {
      ?parti wdt:P112 ?Fondateur.
      ?Fondateur rdfs:label ?NomFondateur.
      FILTER(LANG(?NomFondateur)='fr').
    }

    # Dates
    ?parti wdt:P571 ?DateCreation.
    OPTIONAL {
      ?parti wdt:P576 ?DateDissolution.
    }

    # Nombre d'adhérents
    OPTIONAL {
      ?parti p:P2124 ?NombreAdherentsStatement.
      ?NombreAdherentsStatement ps:P2124 ?NombreAdherents.
      ?NombreAdherentsStatement pq:P585 ?DateNombreAdherents.
    }

    # Couleur politique (code hexa RGB)
    ?parti wdt:P465 ?Couleur.

    # Positionnement politique
    OPTIONAL {
      ?parti wdt:P1387/rdfs:label ?Positionnement.
      FILTER(LANG(?Positionnement)='fr').
    }

    # Siège
    OPTIONAL {?parti p:P159 ?SiegeStatement.}
    OPTIONAL {
      ?SiegeStatement pq:P669/rdfs:label ?SiegeRue.
      FILTER(LANG(?SiegeRue)='fr').
    }
    OPTIONAL {?SiegeStatement pq:P670 ?SiegeNumero.}
    OPTIONAL {?SiegeStatement pq:P281 ?SiegeCodePostal.}
    OPTIONAL {
      ?SiegeStatement ps:P159/rdfs:label ?SiegeVille.
      FILTER(LANG(?SiegeVille)='fr').
    }
    OPTIONAL {?SiegeStatement pq:P580 ?SiegeStartTime.}

    # Logo
    OPTIONAL {
      ?parti p:P154 ?LogoStatement.
      ?LogoStatement ps:P154 ?ImageLogo.
      ?LogoStatement pq:P580 ?LogoStartTime.
    }

    # Site Web
    OPTIONAL { ?parti wdt:P856 ?SiteWeb. }

    FILTER(LANG(?NomParti)='fr').
    FILTER(LANG(?NomPresident)='fr').
  }
  ORDER BY DESC (?PresidentStartTime) DESC(?DateNombreAdherents) DESC(?SiegeStartTime) DESC(?LogoStartTime)
  LIMIT 1
  `
}

function requete_parti_description(idParti) {
  return `SELECT ?Description WHERE {
    ?uri rdf:type dbo:PoliticalParty.
    ?uri owl:sameAs ?wikidata.
    FILTER(str(?wikidata)='http://www.wikidata.org/entity/${idParti}').
    OPTIONAL {
      ?uri dbo:abstract ?Description .
      FILTER(LANG(?Description)='fr') .
    }
  } LIMIT 1`
}

function requete_parti_ideologies(idParti) {
  return `SELECT ?Ideologie ?NomIdeologie WHERE {
    BIND(wd:${idParti} AS ?parti).

    ?parti wdt:P1142 ?Ideologie.
    ?Ideologie rdfs:label ?NomIdeologie.

    FILTER(LANG(?NomIdeologie)='fr').
  }`
}

function requete_parti_personnalites(idPArti) {
  return `SELECT ?NomPoliticien (?nombreMandats + ?nombreCandidatures AS ?importance) WHERE {
    {
      SELECT ?NomPoliticien (COUNT(?mandat) AS ?nombreMandats) WHERE {
        BIND(wd:${idPArti} as ?parti).
        ?politicien wdt:P102 ?parti.
        ?politicien wdt:P1559 ?NomPoliticien.
        OPTIONAL{?politicien wdt:P39 ?mandat.}
      }
      GROUP BY ?NomPoliticien
      ORDER BY DESC(?nombreMandats)
    }
    {
      SELECT ?NomPoliticien (COUNT(?candidature) AS ?nombreCandidatures) WHERE {
        BIND(wd:${idPArti} as ?parti).
        ?politicien wdt:P102 ?parti.
        ?politicien wdt:P1559 ?NomPoliticien.
        OPTIONAL{?politicien wdt:P3602 ?candidature.}
      }
      GROUP BY ?NomPoliticien
      ORDER BY DESC(?nombreCandidatures)
    }
  }
  ORDER BY DESC(?importance)
  LIMIT 5`
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
