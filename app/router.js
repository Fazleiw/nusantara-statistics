// The site's entry point: a hash router. It matches location.hash to a route, loads that section's view with a
// literal import() (so no view is part of the first load), renders it into <main>, and marks the current section in
// the navigation. A view module exports render(params, ctx) → { title, html } or null, and optionally mount().
//
//   #/                 overview        #/regions/<slug>   one province
//   #/population       population      #/prices           prices & cost of living
//   #/economy          economy         #/labour           labour market
//   #/regions          province table  #/sources          sources
//
// window.__shotReady is false while a page renders and true once it is on screen, for the screenshot script.

const routes = [
  { pattern: /^$/, section: 'overview', load: () => import('./views/overview.js') },
  { pattern: /^population$/, section: 'population', load: () => import('./views/population.js') },
  { pattern: /^economy$/, section: 'economy', load: () => import('./views/economy.js') },
  { pattern: /^regions$/, section: 'regions', load: () => import('./views/regions.js') },
  { pattern: /^regions\/([a-z-]+)$/, section: 'regions', load: () => import('./views/province.js') },
  { pattern: /^prices$/, section: 'prices', load: () => import('./views/prices.js') },
  { pattern: /^labour$/, section: 'labour', load: () => import('./views/labour.js') },
  { pattern: /^sources$/, section: 'sources', load: () => import('./views/sources.js') },
];

const main = document.getElementById('main');
const SITE = 'Nusantara Statistics';
let renderCount = 0;
let lastPath = null;
let lastWidth = 0;

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { path: path.replace(/\/+$/, ''), query: new URLSearchParams(query) };
}

function contentWidth() {
  const style = getComputedStyle(main);
  return main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
}

function markCurrentSection(section) {
  for (const link of document.querySelectorAll('.site-nav a')) {
    if (link.dataset.section === section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function notFoundPage() {
  return {
    title: 'Page not found',
    html: `<header class="page-head"><p class="kicker">404</p><h1>That page is not here</h1><p class="lede">The address may be mistyped, or the page may have moved. Every section is linked in the bar above; start from the <a href="#/">overview</a> or the <a href="#/regions">province table</a>.</p></header>`,
  };
}

async function render() {
  window.__shotReady = false;
  const thisRender = ++renderCount;
  const { path, query } = parseHash();
  const route = routes.find((r) => r.pattern.test(path));
  markCurrentSection(route ? route.section : null);
  const ctx = { width: contentWidth(), query };
  let page = notFoundPage();
  let view = null;
  if (route) {
    try {
      view = await route.load();
      if (thisRender !== renderCount) return;
      const params = path.match(route.pattern).slice(1);
      page = view.render(params, ctx) ?? notFoundPage();
    } catch (error) {
      console.error(error);
      page = { title: 'Something went wrong', html: `<header class="page-head"><h1>This page could not be shown</h1><p class="lede">Reload the page, or go back to the <a href="#/">overview</a>.</p></header>` };
      view = null;
    }
  }
  document.title = `${page.title} · ${SITE}`;
  main.innerHTML = page.html;
  if (view && view.mount) view.mount(main, ctx);
  if (path !== lastPath) {
    window.scrollTo(0, 0);
    if (lastPath !== null) main.focus({ preventScroll: true });
  }
  lastPath = path;
  lastWidth = ctx.width;
  window.__shotReady = true;
}

// Charts are drawn at the column's pixel width, so redraw when the column width changes noticeably.
let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (Math.abs(contentWidth() - lastWidth) > 24) render();
  }, 200);
});

// In-page anchors such as the skip link (#main) are not routes: move focus there and keep the current page's address.
function onHashChange() {
  if (location.hash.startsWith('#/') || location.hash === '') {
    render();
    return;
  }
  const target = document.getElementById(location.hash.slice(1));
  history.replaceState(null, '', `#/${lastPath ?? ''}`);
  if (lastPath === null) render();
  if (target) target.focus();
}

window.addEventListener('hashchange', onHashChange);
onHashChange();
