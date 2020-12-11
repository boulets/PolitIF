/* global getSlot hideSlot showSlot slotSetHtmlOrMissing slotSetTextOrMissing slotSetHtml slotSetText slotSetAttribute slotSetLoading slotSetLoaded dateToHtml dateToString renderLoadingProfil renderProfilOrEmptySlots renderProfilPartial renderRecherche renderPositions slotSetListOrMissing */

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on)
  return [first, rest.length > 0 ? rest.join(on) : null]
}

function update() {
  const hash = document.location.hash.slice(1)
  const p = splitOnce(decodeURIComponent(hash), '-')
  const id = p.length > 0 ? p[0] : ''
  const nameWhileLoading = p.length > 1 ? p[1] : ''

  console.log({id, nameWhileLoading})

  renderParti(null)
  renderParti({ nom: nameWhileLoading })

  setTimeout(() => {
    renderParti({
      nom: 'La République en marche !',
      membresImportants: ['Emmanuel Macron', 'Catherine Barbaroux', 'Christophe Castaner', 'Stanislas Guerini'],
      description: 'La République en marche (abrégée en LREM ou LaREM, parfois REM, voire LRM) — également appelée par sa première dénomination En marche (EM) — est un parti politique français lancé en avril 2016 par Emmanuel Macron. Après avoir été élu président de la République en 2017, Emmanuel Macron démissionne de la présidence du mouvement qu\'il a fondé. Le parti remporte une majorité absolue aux élections législatives qui suivent. Son actuel délégué général est Stanislas Guerini. Le parti est classé du centre gauche au centre droit de l\'échiquier politique français et parfois présenté comme un parti attrape-tout.',
      president: 'Stanislas Guerini',
      fondateur: 'Emmanuel Macron',
      dateCreation: new Date('2016-04-06'),
      dateDissolution: null,
      positionnement: 'Centre',
      ideologies: ['Social-libéralisme', 'Progressisme', 'Troisième Voie', 'Europhilie', 'Transpartisianisme', 'Écologisme'],
      siteWeb: 'https://en-marche.fr/index.html',
    })
  }, 900)

  // renderProfilOrLoading(null)
  // if (nameWhileLoading) {
  //   renderProfilPartial({ nom: nameWhileLoading })
  // }
  // fetchProfil(id).then(renderProfilOrLoading)
  // fetchPositions(id).then(renderPositions)
}

function init() {
  update()
  window.addEventListener('hashchange', () => update())
}
init()

function renderParti(parti) {
  if (parti === null) {
    const slots = ['nom', 'description', 'membres-importants', 'image-logo', 'president', 'fondateur', 'date-creation', 'date-dissolution', 'nombre-adherents', 'positionnement', 'ideologies', 'site-web', 'siege']
    slots.forEach(key => slotSetLoading(key))
  } else {
    document.title = `Polit'IF – ${parti.nom}`
    slotSetTextOrMissing('nom', parti.nom)
    if (parti.dateCreation) {
      slotSetHtml('date-creation', dateToHtml(parti.dateCreation))
    } else {
      hideSlot('date-creation')
    }
    if (parti.dateDissolution) {
      slotSetHtml('date-dissolution', dateToHtml(parti.dateDissolution))
    } else {
      hideSlot('date-dissolution')
    }
    slotSetListOrMissing('membres-importants', parti.membresImportants)
    slotSetTextOrMissing('description', parti.description)
    slotSetTextOrMissing('president', parti.president)
    slotSetTextOrMissing('fondateur', parti.fondateur)
    slotSetTextOrMissing('positionnement', parti.positionnement)
    // slotSetTextOrMissing('siege', parti.siege)
    slotSetListOrMissing('ideologies', parti.ideologies)

    if (parti.siteWeb) {
      slotSetTextOrMissing('site-web', parti.siteWeb.replace(/^https?:\/\/([^/]+).+$/, '$1'))
      slotSetAttribute('site-web', 'href', parti.siteWeb)
    } else {
      hideSlot('site-web')
    }
  }
}
