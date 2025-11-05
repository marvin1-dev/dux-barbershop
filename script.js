/* =========================
   DÜX Underground – Interactions & Portfolio
   ========================= */

const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

/* Year */
const y = qs('#year'); if (y) y.textContent = new Date().getFullYear();

/* Burger / Mobile Nav */
const burger = qs('.burger');
const nav = qs('.nav');
function toggleMenu() {
  const open = burger.classList.toggle('active');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
}
if (burger) {
  burger.addEventListener('click', toggleMenu);
  qsa('.nav a').forEach(a => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) toggleMenu();
  }));
}

const baAfter = document.querySelector('.ba-after');
const baBrush = document.querySelector('.ba-brush');
document.querySelector('.ba-range')?.addEventListener('input', (e) => {
  const v = e.target.value + '%';
  if (baAfter) baAfter.style.setProperty('--clip', v);
  if (baBrush) baBrush.style.setProperty('--clip', v);
});


/* Smooth scroll */
qsa('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = qs(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Scroll Reveal */
const revealEls = qsa('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
revealEls.forEach(el => observer.observe(el));

/* Barber Bio Modal (native <dialog>) */
const modal = qs('.modal');
const closeBtn = qs('.modal__close');
const modalImg = qs('.modal__img');
const modalName = qs('.modal__name');
const modalNameInline = qs('.modal__name-inline');
const modalBio = qs('.modal__bio');

qsa('.barber').forEach(card => {
  const btn = qs('.barber__bio-btn', card);
  const img = qs('.barber__img', card);
  const name = qs('.barber__name', card).textContent.trim();
  const bio = card.getAttribute('data-bio') || 'A mystery wrapped in a fade.';
  btn.addEventListener('click', () => {
    modalImg.src = img.src;
    modalImg.alt = `Photo of ${name}`;
    modalName.textContent = name;
    if (modalNameInline) modalNameInline.textContent = name;
    modalBio.textContent = bio;
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  });
});
if (closeBtn) closeBtn.addEventListener('click', () => modal.close());
if (modal) modal.addEventListener('click', (e) => {
  const rect = modal.querySelector('.modal__content').getBoundingClientRect();
  const inDialog = (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom);
  if (!inDialog) modal.close();
});

/* ===== Portfolio: auto-inject grid + carousel ===== */
/* ===== Portfolio: auto-inject grid + carousel + item modal ===== */
const wall = document.querySelector('#wall');
const poleBtn = document.querySelector('#openPole');
const poleCta = document.querySelector('#openPoleCta');

const pModal = document.querySelector('#portfolioModal');
const pClose = pModal?.querySelector('.modal__close');
const carTrack = document.querySelector('#carTrack');

const itemModal = document.querySelector('#itemModal');
const itemClose = itemModal?.querySelector('.modal__close');
const itemImg = document.querySelector('#itemImg');
const itemTitle = document.querySelector('#itemTitle');
const itemSummary = document.querySelector('#itemSummary');
const itemDetails = document.querySelector('#itemDetails');
const itemTags = document.querySelector('#itemTags');

let PORTFOLIO = []; // normalized as objects

async function loadPortfolio(){
  try{
    const res = await fetch('portfolio.json', { cache: 'no-store' });
    const raw = await res.json();
    PORTFOLIO = raw.map((r, i) => {
      if (typeof r === 'string') {
        return { src: r, title: `Cut #${i+1}`, summary:'', details:'', tags:[] };
      }
      return {
        src: r.src,
        title: r.title || `Cut #${i+1}`,
        summary: r.summary || '',
        details: r.details || '',
        tags: Array.isArray(r.tags) ? r.tags : []
      };
    });
  } catch(err){
    // fallback to numbered files
    PORTFOLIO = Array.from({length:6}, (_,i)=>({ src:`portfolio/${i+1}.jpg`, title:`Cut #${i+1}`, summary:'', details:'', tags:[] }));
  }
  renderWall(PORTFOLIO);
  seedCarousel(PORTFOLIO);
}

function renderWall(items){
  if (!wall) return;
  wall.innerHTML = '';
  items.forEach((it, idx) => {
    const card = document.createElement('article');
    card.className = 'wall-item';
    card.dataset.index = idx;
    card.innerHTML = `
      <img src="${it.src}" loading="lazy" class="wall-img" alt="${it.title}">
      <span class="wall-tag">#${String(idx+1).padStart(2,'0')}</span>
      <div class="wall-overlay">
        ${it.title}
        ${it.summary ? `<small>${it.summary}</small>` : ''}
      </div>
    `;
    card.addEventListener('click', () => openItem(idx));
    wall.appendChild(card);
  });
}

function seedCarousel(items){
  if (!carTrack) return;
  carTrack.innerHTML = '';
  items.forEach(it => {
    const slide = document.createElement('div');
    slide.className = 'car-slide';
    slide.innerHTML = `<img src="${it.src}" alt="${it.title}">`;
    carTrack.appendChild(slide);
  });
}

let carIndex = 0;
function go(dir){
  const slides = [...document.querySelectorAll('.car-slide', carTrack)];
  if (!slides.length) return;
  carIndex = (carIndex + dir + slides.length) % slides.length;
  const x = slides[0].clientWidth * carIndex;
  carTrack.scrollTo({ left: x, behavior: 'smooth' });
}
document.querySelector('.car-btn--prev')?.addEventListener('click', ()=>go(-1));
document.querySelector('.car-btn--next')?.addEventListener('click', ()=>go(+1));
poleBtn?.addEventListener('click', ()=> pModal?.showModal());
poleCta?.addEventListener('click', ()=> pModal?.showModal()); // <- new

pClose?.addEventListener('click', ()=> pModal?.close());
pModal?.addEventListener('click', (e) => {
  const box = pModal.querySelector('.modal__content').getBoundingClientRect();
  if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) pModal.close();
});

/* Item modal */
function openItem(i){
  const it = PORTFOLIO[i];
  if (!it) return;
  itemImg.src = it.src;
  itemImg.alt = it.title;
  itemTitle.textContent = it.title;
  itemSummary.textContent = it.summary || '';
  itemDetails.textContent = it.details || '';
  itemTags.innerHTML = '';
  (it.tags || []).forEach(tag => {
    const a = document.createElement('span');
    a.textContent = tag;
    a.className = 'btn btn--ghost';
    a.style.marginRight = '.4rem';
    itemTags.appendChild(a);
  });
  itemModal?.showModal();
}
itemClose?.addEventListener('click', ()=> itemModal?.close());
itemModal?.addEventListener('click', (e) => {
  const box = itemModal.querySelector('.modal__content').getBoundingClientRect();
  if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) itemModal.close();
});

loadPortfolio();

// Start hero reveal once the page finishes loading critical assets
window.addEventListener('load', () => {
  document.body.classList.add('hero-ready');
});



