// Opens every route the site advertises and reports what actually rendered: heading, text length, chart and table
// counts, dead links, NaN in markup, and any console error or failed request. Used by the Stage 4 error check.
//
//   node tools/routecheck.mjs

import { withSite } from './chrome.mjs';

const routes = ['#/', '#/population', '#/economy', '#/regions', '#/prices', '#/labour', '#/sources', '#/regions/jawa-barat', '#/regions/papua-pegunungan', '#/nope'];
// The last route must render the site's own "not found" page, so it is held to a different bar.
const notFoundRoute = '#/nope';

const probe = `(() => {
  const main = document.querySelector('main') || document.body;
  const heading = main.querySelector('h1');
  return {
    heading: heading ? heading.textContent.trim() : null,
    chars: main.innerText.replace(/\\s+/g, ' ').trim().length,
    charts: main.querySelectorAll('svg.chart').length,
    tables: main.querySelectorAll('table').length,
    dead: main.querySelectorAll('a[href="#"]').length,
    nan: main.innerHTML.includes('NaN'),
  };
})()`;

await withSite(async (page) => {
  let failures = 0;
  for (const route of routes) {
    await page.open(route);
    const seen = await page.evaluate(probe);
    const problems = page.problems.slice();
    const isNotFound = route === notFoundRoute;
    const bad = isNotFound
      ? !seen.heading || seen.chars < 40 || problems.length > 0
      : !seen.heading || seen.chars < 200 || seen.dead > 0 || seen.nan || problems.length > 0;
    if (bad) failures += 1;
    console.log(`${bad ? 'FAIL' : 'ok  '} ${route.padEnd(26)} h1=${JSON.stringify(seen.heading)} chars=${seen.chars} charts=${seen.charts} tables=${seen.tables} dead=${seen.dead}${seen.nan ? ' NaN!' : ''}${problems.length ? ` problems=${JSON.stringify(problems)}` : ''}`);
  }
  console.log(failures === 0 ? '\nALL ROUTES PASS' : `\n${failures} ROUTE(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
});
