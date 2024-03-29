/* eslint-disable no-unused-vars */

const classesIdeologies = ['wd:Q12909644', 'wd:Q179805'].join(' ')

function filterRechercheParTexte(recherche, prop) {
  const rech = recherche.replace(/"/g, ' ').toLocaleLowerCase()
  return `FILTER(contains(lcase(${prop}), "${rech}")).`
}
function serviceEntitySearch(recherche, prop) {
  const rech = recherche.replace(/"/g, ' ').toLocaleLowerCase()
  return `SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "www.wikidata.org";
                      wikibase:api "EntitySearch";
                      mwapi:search "${rech}";
                      mwapi:language "fr".
      ${prop} wikibase:apiOutputItem mwapi:item.
    }`
}
function serviceEntitySearch2(recherche, prop, precision = 10) {
  const rech = recherche.replace(/"/g, ' ').toLocaleLowerCase()
  return `SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "fr.wikipedia.org";
                      wikibase:api "Search";
                      wikibase:limit ${precision};
                      mwapi:srsearch "${rech}".
      ?pageTitle wikibase:apiOutput mwapi:title.
    }
    SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "www.wikidata.org";
                      wikibase:api "EntitySearch";
                      mwapi:search ?pageTitle;
                      mwapi:language "fr".
      ${prop} wikibase:apiOutputItem mwapi:item.
    }`
}

function requete_recherche_politiciens(recherche, n = 1) {
  return `SELECT DISTINCT ?politician ?NomPoliticien WHERE {
    # Tous les politiciens de nationalités françaises
    ?politician wdt:P106/wdt:P279? wd:Q82955.
    ?politician wdt:P27 wd:Q142.
    ?politician wdt:P569 ?DateNaissance.
    FILTER(year(?DateNaissance) > 1700)
    ?politician rdfs:label ?NomPoliticien.
    FILTER(LANG(?NomPoliticien) = 'fr')
    ${filterRechercheParTexte(recherche, '?NomPoliticien')}
  } LIMIT ${n}`
}

function requete_recherche_politicien_rapide(recherche, n = 1) {
  return `SELECT DISTINCT ?politician ?NomPoliticien WHERE {
    # Tous les politiciens de nationalités françaises
    ?politician wdt:P106/wdt:P279? wd:Q82955.
    ?politician wdt:P27 wd:Q142.
    ?politician wdt:P569 ?DateNaissance.
    FILTER(year(?DateNaissance) > 1700)
    ${serviceEntitySearch2(recherche, '?politician', 1 + (n - 1) * 2)}
    ?politician rdfs:label ?NomPoliticien.
    FILTER(LANG(?NomPoliticien) = 'fr')
    #${filterRechercheParTexte(recherche, '?NomPoliticien')}
  } LIMIT ${n}`
}

function requete_recherche_partis(recherche, n = 1) {
  return `SELECT DISTINCT ?parti ?NomParti WHERE {
    {
      ?parti wdt:P31 wd:Q7278; wdt:P17 wd:Q142; wdt:P571 ?DateInception.
      FILTER(year(?DateInception) > 1789)
      ${serviceEntitySearch(recherche, '?parti')}
      ?parti rdfs:label ?NomParti.
      FILTER(lang(?NomParti) = 'fr')
    } UNION {
      ?parti wdt:P31 wd:Q7278; wdt:P17 wd:Q142; wdt:P571 ?DateInception.
      FILTER(year(?DateInception) > 1789)
      ?parti rdfs:label ?NomParti.
      FILTER(lang(?NomParti) = 'fr')
      ${filterRechercheParTexte(recherche, '?NomParti')}
    } UNION {
      ?parti wdt:P31 wd:Q7278; wdt:P17 wd:Q142; wdt:P571 ?DateInception.
      FILTER(year(?DateInception) > 1789)
      ?parti rdfs:label ?NomParti.
      FILTER(lang(?NomParti) = 'fr')
      ?parti p:P1813 [ ps:P1813 ?NomCourt ].
      FILTER(lang(?NomCourt) = 'fr')
      ${filterRechercheParTexte(recherche, '?NomCourt')}
    }
  }
  LIMIT ${n}`
}

function requete_recherche_ideologies_rapide(recherche, n = 1) {
  return `SELECT ?ideologie ?NomIdeologie WHERE {
    ?ideologie wdt:P31 ?c. VALUES ?c { ${classesIdeologies} }
    ${serviceEntitySearch(recherche, '?ideologie')}
    ?ideologie rdfs:label ?NomIdeologie.
    FILTER(LANG(?NomIdeologie) = 'fr')
  } LIMIT ${n}`
}

function requete_recherche_ideologies(recherche, n = 1) {
  return `SELECT ?ideologie ?NomIdeologie WHERE {
    ?ideologie wdt:P31 ?c. VALUES ?c { ${classesIdeologies} }
    ?ideologie rdfs:label ?NomIdeologie.
    FILTER(LANG(?NomIdeologie) = 'fr')
    ${filterRechercheParTexte(recherche, '?NomIdeologie')}
  } LIMIT ${n}`
}


function requete_profil_biographie(idProfil) {
  return `SELECT ?politician ?NomPoliticien ?DateDeNaissance ?DateDeDeces ?NomLieuDeNaissance ?NomLieuDeDeces
    ?NomPere ?Pere ?IsPerePolitician
    ?NomMere ?Mere ?IsMerePolitician
    ?NomConjoint ?Conjoint ?IsConjointPolitician
    ?Image ?Signature ?Genre WHERE {
    BIND(wd:${idProfil} AS ?politician)

    # Nom prénom
    ?politician rdfs:label ?NomPoliticien.
    FILTER(lang(?NomPoliticien) = 'fr')

    ?politician wdt:P21 ?Genre.

    OPTIONAL {
      ?politician wdt:P569 ?DateDeNaissance.
      ?politician wdt:P19 ?LieuDeNaissance.
      ?LieuDeNaissance rdfs:label ?NomLieuDeNaissance.
      FILTER(lang(?NomLieuDeNaissance) = 'fr')
    }
    OPTIONAL {
      ?politician wdt:P570 ?DateDeDeces.
      ?politician wdt:P20 ?LieuDeDeces.
      ?LieuDeDeces rdfs:label ?NomLieuDeDeces.
      FILTER(lang(?NomLieuDeDeces) = 'fr')
    }
    OPTIONAL {
      ?politician wdt:P22 ?Pere.
      ?Pere rdfs:label ?NomPere.
      FILTER(lang(?NomPere) = 'fr')
      OPTIONAL {
        ?Pere wdt:P106/wdt:P279? wd:Q82955.
        BIND(true as ?IsPerePolitician).
      }
    }
    OPTIONAL {
      ?politician wdt:P25 ?Mere.
      ?Mere rdfs:label ?NomMere.
      FILTER(lang(?NomMere) = 'fr')
      OPTIONAL {
        ?Mere wdt:P106/wdt:P279? wd:Q82955.
        BIND(true as ?IsMerePolitician).
      }
    }
    OPTIONAL {
      ?politician wdt:P26 ?Conjoint.
      ?Conjoint rdfs:label ?NomConjoint.
      FILTER(lang(?NomConjoint) = 'fr')
      OPTIONAL {
        ?Conjoint wdt:P106/wdt:P279? wd:Q82955.
        BIND(true as ?IsConjointPolitician).
      }
    }

    OPTIONAL { ?politician wdt:P18 ?Image. }

    OPTIONAL { ?politician wdt:P109 ?Signature }
  } LIMIT 1`
}

function requete_profil_mandats(idProfil) {
  return `SELECT ?Position ?DateEntreePosition ?DateSortiePosition ?of WHERE {
    BIND(wd:${idProfil} AS ?politician).

    # Les positions qu'ils ont occuppé
    ?politician p:P39 ?posStat.
    ?posStat ps:P39 ?pos.
    ?pos rdfs:label ?Position.
    OPTIONAL { ?posStat pq:P580 ?DateEntreePosition. }
    OPTIONAL { ?posStat pq:P582 ?DateSortiePosition. }
    OPTIONAL {
      ?posStat pq:P642/rdfs:label ?of. # President OF Communauté de communes de XXX
      FILTER(lang(?of) = 'fr')
    }
    FILTER(lang(?Position) = 'fr')
  }
  ORDER BY DESC(?DateEntreePosition)
  `
}

function requete_profil_description(idPoliticien) {
  return `SELECT ?Description WHERE {
    ?politicien rdf:type dbo:Person.
    ?politicien dbo:party ?parti.
    ?politicien owl:sameAs ?wikidata.
    FILTER(str(?wikidata) = 'http://www.wikidata.org/entity/${idPoliticien}')
    OPTIONAL {
      ?politicien dbo:abstract ?Description.
      FILTER(lang(?Description) = 'fr')
    }
  } LIMIT 1`
}

function requete_parti_general(idParti) {
  return `SELECT ?NomParti ?DateCreation ?DateDissolution ?President ?NomPresident ?PresidentStartTime ?Fondateur ?NomFondateur ?NombreAdherents ?DateNombreAdherents ?Couleur ?Positionnement ?SiegeNumero ?SiegeRue ?SiegeCodePostal ?SiegeVille ?SiegeStartTime ?ImageLogo ?LogoStartTime ?SiteWeb WHERE {
    BIND(wd:${idParti} AS ?parti)

    # Nom
    #?parti wdt:P1705 ?NomParti.
    ?parti rdfs:label ?NomParti.

    # Président
    OPTIONAL {
      ?parti wdt:P488 ?President.
      ?President rdfs:label ?NomPresident.
      FILTER(lang(?NomPresident) = 'fr')
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
      FILTER(lang(?NomFondateur) = 'fr')
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
      FILTER(lang(?Positionnement) = 'fr')
    }

    # Siège
    OPTIONAL {
      ?parti p:P159 ?SiegeStatement.
      OPTIONAL {
        ?SiegeStatement pq:P669/rdfs:label ?SiegeRue.
        FILTER(lang(?SiegeRue) = 'fr')
      }
      OPTIONAL { ?SiegeStatement pq:P670 ?SiegeNumero. }
      OPTIONAL { ?SiegeStatement pq:P281 ?SiegeCodePostal. }
      OPTIONAL { ?SiegeStatement pq:P580 ?SiegeStartTime. }
      OPTIONAL {
        ?SiegeStatement ps:P159/rdfs:label ?SiegeVille.
        FILTER(lang(?SiegeVille) = 'fr')
      }
    }

    # Logo
    OPTIONAL { ?parti p:P154 [ ps:P154 ?ImageLogo; pq:P580 ?LogoStartTime ]. }
    OPTIONAL { ?parti p:P154 [ ps:P154 ?ImageLogo ]. }
    OPTIONAL { ?parti p:P18 [ ps:P18 ?ImageLogo ]. }

    # Site Web
    OPTIONAL { ?parti wdt:P856 ?SiteWeb. }

    FILTER(lang(?NomParti) = 'fr')
  }
  ORDER BY DESC(?PresidentStartTime) DESC(?DateNombreAdherents) DESC(?SiegeStartTime) DESC(?LogoStartTime) (!bound(?LogoStartTime))
  LIMIT 1
  `
}

function requete_parti_description(idParti) {
  return `SELECT ?Description WHERE {
    ?uri rdf:type dbo:PoliticalParty.
    ?uri owl:sameAs ?wikidata.
    FILTER(str(?wikidata) = 'http://www.wikidata.org/entity/${idParti}')
    OPTIONAL {
      ?uri dbo:abstract ?Description.
      FILTER(lang(?Description) = 'fr').
    }
  } LIMIT 1`
}

function requete_parti_ideologies(idParti) {
  return `SELECT ?Ideologie ?NomIdeologie WHERE {
    BIND(wd:${idParti} AS ?parti)

    ?parti wdt:P1142 ?Ideologie.
    ?Ideologie rdfs:label ?NomIdeologie.

    FILTER(lang(?NomIdeologie) = 'fr')
  }`
}

function requete_parti_personnalites(idPArti) {
  return `SELECT ?politicien ?NomPoliticien (COUNT(*) as ?importance) WHERE {
    BIND(wd:${idPArti} AS ?parti)
    ?politicien wdt:P102 ?parti.
    ?politicien rdfs:label ?NomPoliticien.
    FILTER(lang(?NomPoliticien) = 'fr')
    { ?politicien p:P3602 []. } UNION { ?politicien p:P39 []. }
  }
  GROUP BY ?politicien ?NomPoliticien
  ORDER BY DESC(?importance)
  LIMIT 5`
}
function requete_parti_chairpeople(idParti) {
  return `SELECT ?politicien ?NomPoliticien ?DateEntreePosition ?DateSortiePosition WHERE {
    BIND(wd:${idParti} AS ?parti)
    ?parti p:P488 ?polStat.
    ?polStat ps:P488 ?politicien.
    ?politicien rdfs:label ?NomPoliticien.
    FILTER(lang(?NomPoliticien) = 'fr')
    OPTIONAL { ?polStat pq:P580 ?DateEntreePosition. }
    OPTIONAL { ?polStat pq:P582 ?DateSortiePosition. }
  } ORDER BY DESC(?DateEntreePosition)`
}

function requete_profil_fratrie(idProfil) {
  return `SELECT ?id ?nom ?isPolitician WHERE {
    BIND(wd:${idProfil} AS ?politician)
    ?politician wdt:P3373 ?id.
    OPTIONAL {
      ?id wdt:P106/wdt:P279? wd:Q82955.
      BIND(true as ?isPolitician).
    }
    ?id rdfs:label ?nom.
    FILTER(lang(?nom) = 'fr')
  }`
}

function requete_profil_enfants(idProfil) {
  return `SELECT ?id ?nom ?isPolitician WHERE {
    BIND(wd:${idProfil} AS ?politician)
    ?politician wdt:P40 ?id.
    OPTIONAL {
      ?id wdt:P106/wdt:P279? wd:Q82955.
      BIND(true as ?isPolitician).
    }
    ?id rdfs:label ?nom.
    FILTER(lang(?nom) = 'fr')
  }`
}

function requete_ideologie(idIdeologie) {
  return `SELECT ?Nom ?image ?flagimage WHERE {
    BIND(wd:${idIdeologie} AS ?ideology)

    ?ideology rdfs:label ?Nom
    FILTER(lang(?Nom) = 'fr')
    OPTIONAL { ?ideology wdt:P18 ?image. }
    OPTIONAL { ?ideology wdt:P41 ?flagimage. }
  }`
}

function requete_ideologie_description(idIdeologie) {
  return `SELECT ?Description WHERE {
    ?movement rdf:type dbo:Organisation.
    ?movement dbo:ideology ?ideology.
    ?ideology owl:sameAs ?wikidata.
    FILTER(str(?wikidata) = 'http://www.wikidata.org/entity/${idIdeologie}')
    OPTIONAL {
      ?ideology dbo:abstract ?Description.
      FILTER(lang(?Description) = 'fr').
    }
  }
  LIMIT 1`
}

function requete_ideologies_parentes(idIdeologie) {
  return `SELECT DISTINCT ?superClass ?superClassLabel WHERE {
    BIND(wd:${idIdeologie} AS ?ideology)
    ?ideology wdt:P279 ?superClass.
    ?superClass wdt:P31 ?c. VALUES ?c { ${classesIdeologies} }
    ?superClass rdfs:label ?superClassLabel.
    FILTER(lang(?superClassLabel) = 'fr')
  }`
}

function requete_ideologies_derivees(idIdeologie) {
  return `SELECT DISTINCT ?subClass ?subClassLabel WHERE {
    BIND(wd:${idIdeologie} AS ?ideology)
    ?subClass wdt:P279 ?ideology.
    ?subClass wdt:P31 ?c. VALUES ?c { ${classesIdeologies} }
    ?subClass rdfs:label ?subClassLabel.
    FILTER(lang(?subClassLabel) = 'fr')
  }`
}

function requete_profil_partiPolitique(idProfil) {
  return `SELECT ?Parti ?NomParti ?DateDebut ?DateFin WHERE {
    BIND(wd:${idProfil} AS ?politician)

    # Partis Politiques
    ?politician p:P102 ?PartiStatement.
    ?PartiStatement ps:P102 ?Parti.

    ?Parti rdfs:label ?NomParti.
    FILTER(lang(?NomParti) = 'fr')

    OPTIONAL { ?PartiStatement pq:P580 ?DateDebut. }
    OPTIONAL { ?PartiStatement pq:P582 ?DateFin. }
  } ORDER BY DESC(?DateDebut) (!bound(?DateDebut))`
}

function requete_parti_alignement(idParti) {
  return `SELECT ?parti ?alignement ?alignementLabel ?alignementDescription ?ideology ?ideologyLabel ?ideologyDescription ?colors WHERE {
    BIND(wd:${idParti} AS ?parti)

    OPTIONAL {
      ?parti wdt:P1387 ?alignement.
    }
    OPTIONAL {
      ?parti wdt:P1142 ?ideology.
    }
    OPTIONAL {
      ?parti wdt:P465 ?colors.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" }
  }`
}

function requete_presidents() {
  return `SELECT DISTINCT ?President ?PresidentLabel ?DateEntreePosition ?DateSortiePosition WHERE {
    wd:Q142 p:P35 ?chefDetatStat.
    ?chefDetatStat ps:P35 ?President.
    OPTIONAL { ?chefDetatStat pq:P580 ?DateEntreePosition. }
    OPTIONAL { ?chefDetatStat pq:P582 ?DateSortiePosition. }

    ?President rdfs:label ?PresidentLabel.
    FILTER(lang(?PresidentLabel) = 'fr')
  } ORDER BY DESC(?DateEntreePosition)`
}

function requete_presidents_image(idPresident) {
  return `SELECT ?Image WHERE {
    OPTIONAL { wd:${idPresident} wdt:P18 ?Image. }
  } LIMIT 1`
}

function requete_president_actuel() {
  return `SELECT DISTINCT ?president ?presidentLabel ?positionLabel ?startTime WHERE {
    # Récupération du statement "officeholder président français"
    BIND (wd:Q191954 AS ?position).
    ?position p:P1308 ?presidentStatement.

    # Récupération des infos du statement
    ?presidentStatement ps:P1308 ?president.
    OPTIONAL {
      ?presidentStatement pq:P580 ?startTime.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
  }`
}

function requete_premier_ministre_actuel() {
  return `SELECT DISTINCT ?primeMinister ?primeMinisterLabel ?positionLabel ?startTime WHERE {
    # Récupération du statement "officeholder premier ministre français"
    BIND (wd:Q1587677 AS ?position).
    ?position p:P1308 ?primeMinisterStatement.

    # Récupération des infos du statement
    ?primeMinisterStatement ps:P1308 ?primeMinister.
    OPTIONAL {
      ?primeMinisterStatement pq:P580 ?startTime.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
  }`
}

function requete_ministres_actuels() {
  return `SELECT DISTINCT ?minister ?ministerLabel ?positionLabel ?startTime WHERE {
    # Tous les ministres français
    {
      ?minister wdt:P39/wdt:P2389?/wdt:P31+ wd:Q14037025.
    } UNION {
      ?minister wdt:P39 ?position1.
      ?position1 wdt:P279+ wd:Q83307.
      ?position1 wdt:P1001 wd:Q142.
    }

    # Récupération de leurs positions de ministres
    ?minister p:P39 ?positionStat.
    ?positionStat ps:P39 ?position.
    {
      ?position wdt:P2389?/wdt:P31+ wd:Q14037025.
    } UNION {
      ?position wdt:P279+ wd:Q83307.
      ?position wdt:P1001 wd:Q142.
    }

    #Seulement ceux avec un start time
    ?positionStat pq:P580 ?startTime.

    # Mais sans end time
    FILTER NOT EXISTS {
      ?positionStat pq:P582 ?endTime.
    }

    # Et qui ne sont pas chef.fe de gouvernement
    FILTER NOT EXISTS {
      ?positionStat ps:P39/wdt:P279* wd:Q15135541.
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
  }`
}

function requete_profil_scolarite(id) {
  return `SELECT ?NomEcole ?DateEntree ?DateSortie WHERE {
    wd:${id} p:P69 ?EcoleStatement.
    ?EcoleStatement ps:P69/rdfs:label ?NomEcole.
    FILTER(lang(?NomEcole) = 'fr')
    OPTIONAL { ?EcoleStatement pq:P580 ?DateEntree. }
    OPTIONAL { ?EcoleStatement pq:P582 ?DateSortie. }
  } ORDER BY DESC(?DateEntree)`
}
