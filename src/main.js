import Reveal from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js';

document.querySelectorAll('.reveal .slides > section').forEach((slide, slideIndex) => {
  const ambience = document.createElement('div');
  ambience.className = 'nature-ambience';
  ambience.setAttribute('aria-hidden', 'true');
  ambience.innerHTML = `
    <i class="nature-sun"></i>
    <i class="nature-cloud cloud-two"></i>
    <i class="drifting-leaf leaf-one">◆</i>
    <i class="drifting-leaf leaf-two">◆</i>
    <i class="drifting-leaf leaf-three">◆</i>
    <i class="firefly fly-one"></i>
    <i class="firefly fly-two"></i>
    <i class="firefly fly-three"></i>`;
  ambience.style.setProperty('--slide-delay', `${slideIndex * -0.7}s`);
  slide.prepend(ambience);

  if (slide.classList.contains('warm') || slide.classList.contains('frost')) {
    const weather = document.createElement('div');
    const weatherType = slide.classList.contains('warm') ? 'gentle-rain' : 'gentle-snow';
    weather.className = `question-weather ${weatherType}`;
    weather.setAttribute('aria-hidden', 'true');
    weather.innerHTML = Array.from({ length: 24 }, (_, index) =>
      `<i style="--weather-x:${(index * 43) % 100}%;--weather-delay:${(index % 8) * -0.65}s;--weather-speed:${5.5 + (index % 5) * 0.65}s"></i>`
    ).join('');
    slide.prepend(weather);
  }
});

const deck = new Reveal({
  hash: true,
  controls: true,
  progress: true,
  center: false,
  transition: 'slide',
  backgroundTransition: 'fade',
  width: 1600,
  height: 900,
  margin: 0,
  minScale: 0.2,
  maxScale: 1.5
});
deck.initialize();

const habitats = [
  { name: 'Lake', category: 'freshwater', image: 'slide-10-image-02.png' },
  { name: 'Pond', category: 'freshwater', image: 'slide-10-image-03.png' },
  { name: 'River / Stream', category: 'freshwater', image: 'slide-10-image-04.png' },
  { name: 'Wetland', category: 'freshwater', image: 'slide-10-image-05.png' },
  { name: 'Ocean', category: 'marine', image: 'slide-10-image-06.png' },
  { name: 'Sea', category: 'marine', image: 'slide-10-image-07.png' },
  { name: 'Coral Reef', category: 'marine', image: 'slide-10-image-08.png' },
  { name: 'Estuary', category: 'marine', image: 'slide-10-image-09.png' }
];

const pool = document.querySelector('#card-pool');
const status = document.querySelector('#game-status');
const winScreen = document.querySelector('#win-screen');
let selected = null;
let gameLocked = false;

const shuffled = values => [...values].sort(() => Math.random() - 0.5);

function makeCard(habitat) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'habitat-card';
  card.draggable = true;
  card.dataset.category = habitat.category;
  card.dataset.name = habitat.name;
  card.innerHTML = `<img src="./public/assets/${habitat.image}" alt=""><span>${habitat.name}</span>`;
  card.addEventListener('click', event => {
    event.stopPropagation();
    selectCard(card);
  });
  card.addEventListener('dragstart', event => {
    if (gameLocked) {
      event.preventDefault();
      return;
    }
    selected = card;
    event.dataTransfer.setData('text/plain', habitat.name);
    card.classList.add('selected');
  });
  card.addEventListener('dragend', () => card.classList.remove('selected'));
  return card;
}

function selectCard(card) {
  if (gameLocked) return;
  document.querySelectorAll('.habitat-card.selected').forEach(item => item.classList.remove('selected'));
  selected = card;
  card.classList.add('selected');
  status.textContent = `${card.dataset.name} selected. Choose Freshwater or Marine.`;
}

function placeCard(zone) {
  if (!selected || gameLocked) return;
  const card = selected;
  card.classList.remove('selected');
  card.classList.remove('incorrect');
  card.classList.add('assigned');
  card.dataset.assigned = zone.dataset.category;
  zone.querySelector('.placed').append(card);
  selected = null;
  updateProgress();
}

function updateProgress() {
  const placed = document.querySelectorAll('.habitat-card[data-assigned]').length;
  if (placed === habitats.length) {
    gameLocked = true;
    status.textContent = 'Checking your classifications…';
    setTimeout(checkGame, 350);
    return;
  }
  status.textContent = `${habitats.length - placed} habitat${habitats.length - placed === 1 ? '' : 's'} left to sort.`;
}

function checkGame() {
  const cards = [...document.querySelectorAll('.habitat-card')];
  const incorrect = cards.filter(card => card.dataset.assigned !== card.dataset.category);
  cards.forEach(card => card.classList.toggle('incorrect', incorrect.includes(card)));

  if (incorrect.length === 0) {
    status.textContent = '8 out of 8 correct!';
    winScreen.hidden = false;
    return;
  }

  gameLocked = false;
  status.textContent = `${incorrect.length} ${incorrect.length === 1 ? 'habitat is' : 'habitats are'} in the wrong bin. Move the highlighted ${incorrect.length === 1 ? 'card' : 'cards'} and try again.`;
}

document.querySelectorAll('.drop-zone').forEach(zone => {
  zone.addEventListener('click', () => placeCard(zone));
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('over'); placeCard(zone); });
});

function resetBoard({ hideWin = true, message = 'Sort all 8 habitats.' } = {}) {
  selected = null;
  gameLocked = false;
  status.textContent = message;
  if (hideWin) winScreen.hidden = true;
  pool.replaceChildren(...shuffled(habitats).map(makeCard));
}

function resetGame() {
  resetBoard();
}

document.querySelector('#reset-game').addEventListener('click', resetGame);
document.querySelector('#play-again').addEventListener('click', resetGame);
resetGame();
