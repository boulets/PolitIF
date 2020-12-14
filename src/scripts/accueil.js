/* global createElementFromHtml */

function homecard({ title = '', subtitle = '', titleHref = '', subtitleHref = '', icon = '' }) {
  const card = createElementFromHtml(`
          <article class= "home-card" >
            <img src="" alt="" class="home-card__icon" />
            <a href="" class="home-card__title"></a>
            <a href="" class="home-card__subtitle"></a>
          </article>`)
  card.querySelector('.home-card__title').innerText = title
  card.querySelector('.home-card__subtitle').innerText = subtitle
  card.querySelector('a.home-card__title').href = titleHref
  card.querySelector('a.home-card__subtitle').href = subtitleHref
  card.querySelector('img.home-card__icon').src = icon
  return card
}

// eslint-disable-next-line no-unused-vars
function homecards(cardsData) {
  const el = document.querySelector('.home-cards')
  el.innerHTML = ''
  el.append(...cardsData.map(homecard))
}

// eslint-disable-next-line no-unused-vars
function featuredTopic(id1, str1, type1, id2, str2, type2, icon) {
  return {
    title: str1,
    titleHref: `${type1}.html#${id1}-${encodeURIComponent(str1)}`,
    subtitle: str2,
    subtitleHref: `${type2}.html#${id2}-${encodeURIComponent(str2)}`,
    icon: icon,
  }
}
