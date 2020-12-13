/* eslint-disable no-unused-vars */

function filterRechercheParTexte(recherche, prop) {
  const rech = recherche.toLocaleLowerCase().replace(/"/g, ' ')
  return `filter(contains(lcase(${prop}), "${rech}")).`
  // const segments = rech.split(/\s+/g)
  // return segments.map(s => `filter(contains(lcase(${prop}), "${s}")).`).join('\n')
}

function requete_recherche_politicien(recherche, n = 1) {
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
    ${filterRechercheParTexte(recherche, '?NomPoliticien')}
  } LIMIT ${n}`
}

function requete_recherche_partis(recherche, n = 1) {
  return `SELECT DISTINCT ?parti ?NomParti WHERE {
    # Tous les partis
    ?parti wdt:P31 wd:Q7278; wdt:P17 wd:Q142.

    ?parti wdt:P571 ?DateInception.
    filter(year(?DateInception) > 1789).

    ?parti rdfs:label ?NomParti.
    filter(lang(?NomParti) = 'fr').

    OPTIONAL {
      ${filterRechercheParTexte(recherche, '?NomParti')}
      bind(true as ?matched).
    }

    OPTIONAL {
      ?parti p:P1813 [ ps:P1813 ?NomCourt ].
      filter(lang(?NomCourt) = 'fr').
      ${filterRechercheParTexte(recherche, '?NomCourt')}
      bind(true as ?matched).
    }

    OPTIONAL {
      ?parti p:P1448 [ ps:P1448 ?NomOfficiel ].
      filter(lang(?NomOfficiel) = 'fr').
      ${filterRechercheParTexte(recherche, '?NomOfficiel')}
      bind(true as ?matched).
    }

    FILTER(?matched = true).
  } ORDER BY
    (!bound(?NomCourt)) asc(?NomCourt)
    (!bound(?NomOfficiel)) asc(?NomOfficiel)
  LIMIT ${n}`
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
    OPTIONAL {
      ?parti wdt:P488 ?President.
      ?President rdfs:label ?NomPresident.
      FILTER(LANG(?NomPresident) = 'fr').
    }
    OPTIONAL {
      ?parti p:P488 ?PresidentStatement.
      # On considère que le dernier président est celui qui a débuté son mandat en dernier
      ?PresidentStatement pq:P580 ?PresidentStartTime.
    }

    # Fondateur
    OPTIONAL {
      ?parti wdt:P112 ?Fondateur.
      ?Fondateur rdfs:label ?NomFondateur.
      FILTER(LANG(?NomFondateur) = 'fr').
    }

    # Dates
    OPTIONAL { ?parti wdt:P571 ?DateCreation. }
    OPTIONAL { ?parti wdt:P576 ?DateDissolution. }

    # Nombre d'adhérents
    OPTIONAL {
      ?parti p:P2124 ?NombreAdherentsStatement.
      ?NombreAdherentsStatement ps:P2124 ?NombreAdherents.
      ?NombreAdherentsStatement pq:P585 ?DateNombreAdherents.
    }

    # Couleur politique (code hexa RGB)
    OPTIONAL { ?parti wdt:P465 ?Couleur. }

    # Positionnement politique
    OPTIONAL {
      ?parti wdt:P1387/rdfs:label ?Positionnement.
      FILTER(LANG(?Positionnement) = 'fr').
    }

    # Siège
    OPTIONAL {
      ?parti p:P159 ?SiegeStatement.
      # ?SiegeStatement pq:P669/rdfs:label ?SiegeRue.
      # ?SiegeStatement pq:P670 ?SiegeNumero.
      # ?SiegeStatement pq:P281 ?SiegeCodePostal.
      # ?SiegeStatement pq:P580 ?SiegeStartTime.
      ?SiegeStatement ps:P159/rdfs:label ?SiegeVille.
      FILTER(LANG(?SiegeVille)='fr').
      # FILTER(LANG(?SiegeRue)='fr').
    }

    # Logo
    OPTIONAL {
      ?parti p:P154 ?LogoStatement.
      ?LogoStatement ps:P154 ?ImageLogo.
      ?LogoStatement pq:P580 ?LogoStartTime.
    }

    # Site Web
    OPTIONAL { ?parti wdt:P856 ?SiteWeb. }

    FILTER(LANG(?NomParti)='fr').
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
  return `SELECT ?politicien ?NomPoliticien (?nombreMandats + ?nombreCandidatures AS ?importance) WHERE {
    {
      SELECT ?politicien ?NomPoliticien (COUNT(?mandat) AS ?nombreMandats) WHERE {
        BIND(wd:${idPArti} as ?parti).
        ?politicien wdt:P102 ?parti.
        ?politicien wdt:P1559 ?NomPoliticien.
        OPTIONAL{?politicien wdt:P39 ?mandat.}
      }
      GROUP BY ?politicien ?NomPoliticien
      ORDER BY DESC(?nombreMandats)
    }
    {
      SELECT ?politicien ?NomPoliticien (COUNT(?candidature) AS ?nombreCandidatures) WHERE {
        BIND(wd:${idPArti} as ?parti).
        ?politicien wdt:P102 ?parti.
        ?politicien wdt:P1559 ?NomPoliticien.
        OPTIONAL{?politicien wdt:P3602 ?candidature.}
      }
      GROUP BY ?politicien ?NomPoliticien
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
