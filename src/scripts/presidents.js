async function fetchPresidents() {
  var presidents = [];
  const url = wikidataUrl(requete_presidents())
  const reponse = await fetch(url).then(res => res.json())
  const donnees = reponse.results.bindings
  console.log(donnees)
  donnees.forEach((data) => {
    presidents.push({
      id : data.President.value.substr(data.President.value.lastIndexOf("/")+1),
      title : data.PresidentLabel.value,
      dateEntree: new Date(data.DateEntreePosition.value),
      dateSortie: new Date(data.DateSortiePosition?.value)
    })
  })
  presidents.forEach(async (data) => {
    const url2 = wikidataUrl(requete_presidents_image(data.id))
    const reponse2 = await fetch(url2).then(res => res.json())
    const image = reponse2.results.bindings[0].Image?.value
    Object.defineProperty(data, "image", {value: image})
  })
  return presidents
}

async function init() {
  renderTimeline(await fetchPresidents())
}
init()


function renderTimeline(presidents) {
  var previousDate = 0;
  const timeline = document.getElementById("timeline");
  var card;
  presidents.forEach((president) => {
    if(previousDate !== 1900 + president.dateEntree?.getYear())
    {
      card = createElementFromHtml(`
        <li>
          <div class="title"><a href='profil.html#${president.id}-${president.title}'>${president.title}</a></div>
          <span class="number">
                <span>${1900 + president.dateEntree?.getYear()}</span>
                <span>${1900 + president.dateSortie?.getYear()}</span>
          </span>
        </li>
        `)
    } else {
      card = createElementFromHtml(`
        <li>
          <div class="title"><a href='profil.html#${president.id}-${president.title}'>${president.title}</a></div>
          <span class="number">
                <span></span>
                <span>${1900 + president.dateSortie?.getYear()}</span>
          </span>
        </li>
        `)
    }

    previousDate=1900 + president.dateSortie?.getYear()
    timeline.append(card)
  })
}
