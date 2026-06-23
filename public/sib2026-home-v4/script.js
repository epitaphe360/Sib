const params = new URLSearchParams(location.search);
const embedded = params.get('embedded') === '1';
if (embedded) {
  document.body.classList.add('app-embedded');
}

const header = document.querySelector('.site-header');
document.querySelectorAll('use[href*="icons.svg#"]').forEach((icon) => {
  icon.setAttribute('href', '#' + icon.getAttribute('href').split('#')[1]);
});

function navigateApp(href) {
  if (!href || href.startsWith('#')) return false;
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) return false;
  const path = href.startsWith('/') ? href : `/${href}`;
  if (embedded && window.parent && window.parent !== window) {
    window.parent.location.assign(path);
    return true;
  }
  window.location.assign(path);
  return true;
}

document.body.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank') return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('assets/')) return;
  if (navigateApp(href)) event.preventDefault();
});

const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.main-nav a').forEach((link) =>
  link.addEventListener('click', () => header.classList.remove('menu-open')),
);
window.addEventListener(
  'scroll',
  () => {
    header?.classList.toggle('scrolled', scrollY > 24);
  },
  { passive: true },
);
