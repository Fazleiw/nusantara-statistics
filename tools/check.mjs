// The error check: static rules over app/ (no network, sizes, entries), then every route in headless Chrome at desktop
// and phone widths: no console errors, no empty or broken page, no NaN/undefined, no sideways overflow, every figure
// and stat with a citation and year, every internal link resolving, and the province table's controls working.
//
//   node tools/check.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSite } from './chrome.mjs';
import { provinces } from '../app/data/provinces.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const app = join(root, 'app');
const failures = [];
const fail = (message) => failures.push(message);

// ---- Static rules ----------------------------------------------------------------------------------------------------

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) fail(`symlink in app/: ${relative(root, full)}`);
    return entry.isDirectory() ? [full, ...walk(full)] : [full];
  });
}

const entries = walk(app);
const files = entries.filter((f) => statSync(f).isFile());
const totalBytes = files.reduce((sum, f) => sum + statSync(f).size, 0);
if (entries.length > 993) fail(`app/ has ${entries.length} entries`);
if (totalBytes > 16 * 1024 * 1024) fail(`app/ is ${totalBytes} bytes`);
for (const file of files.filter((f) => /\.(js|css|html)$/.test(f))) {
  const source = readFileSync(file, 'utf8');
  const name = relative(root, file);
  if (/(?:https?|wss?):\/\//i.test(source)) fail(`${name} names an absolute URL`);
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/.test(source)) fail(`${name} uses a network API`);
  if (/(?:src|href)\s*=\s*["']\/\//.test(source)) fail(`${name} has a protocol-relative URL`);
  if (/import\(\s*[^'"\s)]/.test(source)) fail(`${name} has an import() with a computed specifier`);
}
console.log(`static: ${entries.length} entries, ${files.length} files, ${(totalBytes / 1024).toFixed(1)} KiB`);

// ---- Pages in the browser ----------------------------------------------------------------------------------------------

const routes = ['#/', '#/population', '#/economy', '#/regions', '#/prices', '#/labour', '#/sources', ...provinces.map((p) => `#/regions/${p.slug}`)];

const inspectPage = `(() => {
  const main = document.getElementById('main');
  const html = main.innerHTML;
  const uncited = [];
  for (const el of main.querySelectorAll('.stat')) if (!/\\d{4}/.test(el.querySelector('.stat-source')?.textContent ?? '')) uncited.push('stat: ' + el.querySelector('.stat-label').textContent);
  for (const el of main.querySelectorAll('.fig')) if (!/\\d{4}/.test(el.querySelector('.fig-source')?.textContent ?? '')) uncited.push('figure: ' + el.querySelector('h2').textContent);
  for (const el of main.querySelectorAll('.key-figures > div')) if (!/\\d{4}/.test(el.querySelector('dd .cite')?.textContent ?? '')) uncited.push('key figure: ' + el.querySelector('dt').textContent);
  for (const el of main.querySelectorAll('.multiple')) if (!/\\d{4}/.test(el.querySelector('.cite')?.textContent ?? '')) uncited.push('panel: ' + el.querySelector('.multiple-name').textContent);
  const emptyCharts = [...main.querySelectorAll('svg.chart')].filter((svg) => svg.querySelectorAll('text').length < 2 || !svg.querySelector('path, rect, circle')).length;
  return {
    title: document.title,
    textLength: main.textContent.trim().length,
    broken: /NaN|undefined|Infinity|\\[object/.test(html),
    charts: main.querySelectorAll('svg.chart').length,
    emptyCharts,
    uncited,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    links: [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href')),
  };
})()`;

await withSite(async (page) => {
  const links = new Set();
  for (const width of [1280, 390]) {
    for (const route of routes) {
      await page.open(route, { width, height: width < 600 ? 844 : 800 });
      const info = await page.evaluate(inspectPage);
      const where = `${route} @${width}`;
      for (const problem of page.problems) fail(`${where}: ${problem}`);
      if (/not found|went wrong/i.test(info.title)) fail(`${where}: rendered "${info.title}"`);
      if (info.textLength < 300) fail(`${where}: only ${info.textLength} characters of content`);
      if (info.broken) fail(`${where}: NaN, undefined or [object] in the page`);
      if (info.emptyCharts) fail(`${where}: ${info.emptyCharts} chart(s) without marks or labels`);
      if (info.overflow > 0) fail(`${where}: ${info.overflow}px sideways overflow`);
      for (const item of info.uncited) fail(`${where}: no source year on ${item}`);
      info.links.forEach((l) => links.add(l));
      if (width === 1280) console.log(`${route.padEnd(38)} ${String(info.charts).padStart(2)} charts  ${info.textLength} chars`);
    }
  }

  // Every internal link the pages carry must open a real page.
  for (const link of links) {
    await page.open(link);
    const title = await page.evaluate('document.title');
    if (/not found|went wrong/i.test(title)) fail(`link ${link} opens "${title}"`);
  }
  console.log(`links: ${links.size} distinct internal links checked`);

  // An unknown address shows the not-found page rather than breaking.
  await page.open('#/no-such-page');
  if (!/not found/i.test(await page.evaluate('document.title'))) fail('unknown route does not show the not-found page');
  await page.open('#/regions/atlantis');
  if (!/not found/i.test(await page.evaluate('document.title'))) fail('unknown province does not show the not-found page');

  // The province table's controls.
  await page.open('#/regions');
  const rows = () => page.evaluate(`[...document.querySelectorAll('#province-body tr:not(.empty-row)')].map((tr) => tr.querySelector('a').textContent)`);
  const type = (text) => page.evaluate(`(() => { const box = document.getElementById('province-search'); box.value = ${JSON.stringify(text)}; box.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const pick = (value) => page.evaluate(`(() => { const s = document.getElementById('island-filter'); s.value = ${JSON.stringify(value)}; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const sortBy = (key) => page.evaluate(`document.querySelector('button.sort[data-key="${key}"]').click()`);
  const expect = (label, actual, wanted) => {
    if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(`table: ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  };

  expect('default order starts with the most populous', (await rows())[0], 'Jawa Barat');
  expect('38 rows', (await rows()).length, 38);
  await type('papua');
  expect('search "papua" finds the six Papua provinces', (await rows()).length, 6);
  expect('count line follows the search', await page.evaluate(`document.getElementById('result-count').textContent`), 'Showing 6 of 38 provinces');
  await type('medan');
  expect('search by capital', await rows(), ['Sumatera Utara']);
  await type('zzz');
  expect('no match shows the empty row', await page.evaluate(`!!document.querySelector('#province-body .empty-row')`), true);
  await type('');
  await pick('Java');
  expect('island filter Java', (await rows()).length, 6);
  await pick('all');
  await sortBy('hdi');
  expect('sort by HDI, highest first', (await rows())[0], 'DKI Jakarta');
  expect('aria-sort on the HDI header', await page.evaluate(`document.querySelector('th[aria-sort]').textContent.includes('HDI')`), true);
  await sortBy('hdi');
  expect('sort by HDI again, lowest first', (await rows())[0], 'Papua Pegunungan');
  await sortBy('poverty');
  expect('sort by poverty, highest first', (await rows())[0], 'Papua Pegunungan');
  await sortBy('name');
  expect('sort by name', (await rows())[0], 'Aceh');
  await page.open('#/regions?sort=poverty');
  expect('?sort=poverty in the address', (await rows())[0], 'Papua Pegunungan');

  // A "Show the numbers" toggle opens its table.
  await page.open('#/economy');
  const opened = await page.evaluate(`(() => { const d = document.querySelector('.fig-data'); d.querySelector('summary').click(); return d.open && d.querySelector('table').offsetHeight > 0; })()`);
  if (!opened) fail('"Show the numbers" does not open its table');

  // The navigation links route, and the current section is marked.
  await page.evaluate(`document.querySelector('.site-nav a[data-section="labour"]').click()`);
  await page.waitFor(() => page.evaluate(`window.__shotReady && document.title.startsWith('Labour')`), 'nav click');
  if (!(await page.evaluate(`document.querySelector('.site-nav a[aria-current="page"]').dataset.section === 'labour'`))) fail('nav does not mark the current section');

  // The skip link moves focus without leaving the page.
  await page.evaluate(`document.querySelector('.skip').click()`);
  await page.sleep(300);
  if (!(await page.evaluate(`location.hash === '#/labour' && document.title.startsWith('Labour')`))) fail('skip link changes the page');

  // Narrowing the window redraws the charts at the new width without errors.
  page.problems.length = 0;
  await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await page.sleep(700);
  const widest = await page.evaluate(`Math.max(...[...document.querySelectorAll('svg.chart')].map((s) => Number(s.getAttribute('width'))))`);
  if (widest > 390) fail(`after resizing to 390px a chart is still ${widest}px wide`);
  for (const problem of page.problems) fail(`resize: ${problem}`);
});

if (failures.length) {
  console.log(`\n${failures.length} problem(s):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log('\nall checks passed');
}
