/* Progressive enhancements. The projects, evidence, and engineering details are HTML. */
const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeSelect = document.querySelector('#theme-select');
let themePreference = root.dataset.themePreference || 'system';

function applyTheme() {
  const theme = themePreference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : themePreference;
  root.dataset.theme = theme;
  root.dataset.themePreference = themePreference;
  themeSelect.value = themePreference;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#151815' : '#f8f7f3';
}
applyTheme();
themeSelect.addEventListener('change', () => {
  themePreference = themeSelect.value;
  try { localStorage.setItem('siddh-theme', themePreference); } catch (_) { /* Storage is optional. */ }
  applyTheme();
});
systemTheme.addEventListener('change', () => { if (themePreference === 'system') applyTheme(); });

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
let motionPaused = false;
function applyMotion() {
  const off = motionPaused || motionPreference.matches;
  root.classList.toggle('motion-off', off);
  motionButton.setAttribute('aria-pressed', String(off));
  motionButton.setAttribute('aria-label', motionPreference.matches
    ? 'Reduced motion follows your system preference'
    : (off ? 'Enable motion' : 'Pause motion'));
  motionButton.textContent = motionPreference.matches ? 'Reduced motion' : (off ? 'Motion off' : 'Motion on');
  motionButton.disabled = motionPreference.matches;
}
applyMotion();
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; applyMotion(); });
motionPreference.addEventListener('change', applyMotion);

// Screenshots always have a working full-size link, even without dialogs or JS.
const screenshots = {
  search: {src: 'assets/rit-search-results', alt: 'ResearchIT: a plain-English research question and relevant paper results', caption: 'Search the research corpus in plain English.'},
  feed: {src: 'assets/rit-feed', alt: 'ResearchIT reading feed with papers labeled by the interest they serve', caption: 'A reading feed shaped by the papers you save.'},
  why: {src: 'assets/rit-feed-why', alt: 'ResearchIT explains which saved-paper interest led to a recommendation', caption: 'Inspect why a paper appeared in your recommendations.'}
};
const shot = document.querySelector('#research-shot');
document.querySelectorAll('[data-shot]').forEach(button => {
  button.addEventListener('click', () => {
    const item = screenshots[button.dataset.shot];
    shot.closest('picture').querySelector('source').srcset = `${item.src}.webp`;
    shot.src = `${item.src}.jpg`;
    shot.alt = item.alt;
    document.querySelector('#research-full-image').href = `${item.src}.webp`;
    document.querySelector('#research-shot-caption').textContent = item.caption;
    document.querySelectorAll('[data-shot]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  });
});

const imageDialog = document.querySelector('#image-dialog');
let imageOpener;
document.querySelectorAll('[data-enlarge]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof imageDialog.showModal !== 'function') return;
    const image = document.getElementById(link.dataset.enlarge);
    const enlarged = document.querySelector('#enlarged-image');
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    document.querySelector('#image-caption').textContent = image.alt;
    imageDialog.showModal();
    event.preventDefault();
    imageOpener = link;
    document.body.classList.add('modal-open');
  });
});
imageDialog.querySelector('.dialog-close').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', event => {
  if (event.target !== imageDialog) return;
  const bounds = imageDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) imageDialog.close();
});
imageDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  imageOpener?.focus({preventScroll: true});
});

// An illustrative design principle, not a simulated result from the production service.
const paperCards = [...document.querySelectorAll('.paper-cards li')];
document.querySelectorAll('[data-feed]').forEach(button => {
  button.addEventListener('click', () => {
    const balanced = button.dataset.feed === 'balanced';
    paperCards.forEach((card, index) => {
      const robotics = balanced && index % 2 === 1;
      card.dataset.topic = robotics ? 'robotics' : 'ai';
      card.querySelector('b').textContent = robotics ? 'Robotics' : 'AI';
    });
    document.querySelector('#feed-explanation').textContent = balanced
      ? '5 AI papers. 5 robotics papers. Both interests get a place.'
      : '10 AI papers. 0 robotics papers. One interest disappears.';
    document.querySelectorAll('[data-feed]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  });
});

// Ordinary anchors are shareable. Open native disclosures before scrolling to them.
function openAnchor(hash, scroll = true) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
  const aliases = {'project-research': 'researchit', 'project-memory': 'prompt-memory', 'project-space': 'researchit-space'};
  const target = document.getElementById(aliases[id] || id);
  if (!target) return;
  let ancestor = target;
  while (ancestor) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    ancestor = ancestor.parentElement;
  }
  if (scroll) requestAnimationFrame(() => target.scrollIntoView({behavior: 'auto', block: 'start'}));
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => openAnchor(link.getAttribute('href'), false));
});
window.addEventListener('hashchange', () => openAnchor(location.hash));
if (location.hash) openAnchor(location.hash);

const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const chapters = chapterLinks.map(link => document.querySelector(link.getAttribute('href')));
const chapterNames = ['About', 'Selected work', 'Experience', 'Offscreen', 'Contact'];
let activeChapter = -1;
function updateChapter() {
  let index = 0;
  const marker = window.innerHeight * .3;
  chapters.forEach((section, i) => { if (section.getBoundingClientRect().top <= marker) index = i; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) index = chapters.length - 1;
  if (index === activeChapter) return;
  activeChapter = index;
  chapterLinks.forEach((link, i) => {
    link.classList.toggle('current', i === index);
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  document.querySelector('#chapter-readout').textContent = `${String(index + 1).padStart(2, '0')} / ${chapterNames[index]}`;
  const previous = document.querySelector('#previous-chapter');
  const next = document.querySelector('#next-chapter');
  previous.href = chapterLinks[Math.max(0, index - 1)].getAttribute('href');
  next.href = chapterLinks[Math.min(chapters.length - 1, index + 1)].getAttribute('href');
  previous.setAttribute('aria-label', index === 0 ? 'Back to about' : `Previous chapter: ${chapterNames[index - 1]}`);
  next.setAttribute('aria-label', index === chapters.length - 1 ? 'Back to contact' : `Next chapter: ${chapterNames[index + 1]}`);
}
let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => { updateChapter(); scrollPending = false; });
}, {passive: true});
window.addEventListener('resize', updateChapter);
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', updateChapter));

const copyStatus = document.querySelector('.copy-status');
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    copyStatus.textContent = 'Email address copied.';
  } catch (_) {
    copyStatus.textContent = 'Select the email address above to copy it, or click it to open your email app.';
  }
}));

// Reveal controls only after their event handlers are ready.
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });
updateChapter();
