async function fetchPresidents() {
  const url = wikidataUrl(requete_presidents())
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings
  const presidents = donnees.map((x) => ({
    id: extractIdFromWikidataUrl(x.President?.value),
    nom: x.PresidentLabel?.value,
    dateEntree: nullableDate(x.DateEntreePosition?.value),
    dateSortie: nullableDate(x.DateSortiePosition?.value),
  }))
  await Promise.all(presidents.map(async (x) => {
    const url = wikidataUrl(requete_presidents_image(x.id))
    const reponse = await fetch(url).then(res => res.json())
    const image = reponse.results.bindings[0].Image?.value
    x.image = image
  }))
  console.log(presidents)
  return presidents
}

async function init() {
  renderTimeline(await fetchPresidents())
}
init()

function renderTimeline(presidents) {
  const timeline = document.getElementById('timeline')
  timeline.innerHTML = ''

  let previousDate = null
  let isFirst = true
  for (const president of presidents) {
    const anneeDebut = president.dateEntree?.getFullYear()
    const anneeFin = president.dateSortie?.getFullYear()
    const collapseWithPrev = (previousDate === anneeFin)
    const texteFin = isFirst ? (anneeFin ? anneeFin : 'en mandat') : (collapseWithPrev ? '' : anneeFin)
    const card = createElementFromHtml(`
      <li class="timeline-element">
        <a class="card" href="profil.html#${president.id}-${president.nom}">
          <img src="${president.image}?width=200px" />
          <div class="title">${president.nom}</div>
        </a>
        <span class="number">
          <span class="date-fin" ${collapseWithPrev ? 'hidden="true"' : ''}>${texteFin}</span>
          <span class="date-debut">${anneeDebut}</span>
        </span>
      </li>`)

    timeline.append(card)
    isFirst = false
    previousDate = anneeDebut
  }
}
