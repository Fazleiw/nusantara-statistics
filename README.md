# Nusantara Statistics

A national statistics site for Indonesia that runs from static files in a browser, on a desktop
and on a phone. No build step, no framework, no network request: every figure, chart and page here
comes from the files in `app/`.

[![make.fun national statistics site](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/Fazleiw/nusantara-statistics/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/Fazleiw/nusantara-statistics/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

## What it is

Eight pages reachable from the masthead, each one a real page with its own charts, tables and text:

| Page | What it answers |
| --- | --- |
| Overview | The country in six numbers, then the growth record and the poorest provinces |
| Population | 281.6 million people: growth, the 2020 census, urban share, age structure |
| Economy | GDP, real growth, GDP per capita, trade, foreign reserves |
| Regions | All 38 provinces in one sortable table, plus poverty and HDI rankings |
| Prices | Consumer inflation since 2020, the policy rate, and what moved the index |
| Labour | The labour force, employment, unemployment, and where the jobs are |
| Sources | Every publication behind every figure, with its coverage and reference period |
| Province detail | One page per province, reached from the table or from a ranking bar |

Every figure carries its publisher and year next to it (`BPS, 2024`). Nothing is interpolated and
presented as measured: where a series has a gap or a province figure is an estimate, the page says
so. The Sources page lists what the release does *not* cover, so an absent series is never read as
a zero.

## How it is built

```
app/
  index.html          the shell: masthead, one <main>, and the router's mount point
  site.css            the design tokens and every rule, one file
  router.js           hash routing, literal import() per section
  charts.js           hand-written SVG: bars, columns, lines, ranked bars, sparklines
  format.js           number, percent and citation formatting
  page-blocks.js      the page header, chart figure, stat tile and table blocks
  data/               one module per topic, each series carrying source and year
  views/              one module per page
tools/
  chrome.mjs          serves the site and drives headless Chrome over the DevTools protocol
  shot.mjs            takes the screenshots listed in shots.json
  routecheck.mjs      opens every route and reports what actually rendered
main.ts               copies app/ and screenshots/ to the output and writes dossier.json
```

The first load is three files: `index.html`, `site.css` and `router.js`. Every page after that is
fetched by a literal `import()`, so a visitor who only reads the overview never downloads the
province table. The dossier records both figures:

```
First load: 3 files, 20923 bytes raw, 6492 bytes gzip-9
Loaded later by import(): 18 files, 88368 bytes raw, 29263 bytes gzip-9
```

Charts are SVG written by `charts.js`, drawn at 1:1 pixel scale so axis text keeps its size on a
phone instead of shrinking with a viewBox. Each mark carries a `<title>` for a tooltip, and every
chart has a "Show the numbers" disclosure that prints the same series as a table.

## Running it

```sh
node serve.ts                      # then open http://localhost:8080
node tools/shot.mjs                # re-take the screenshots in shots.json
node tools/routecheck.mjs          # open every route, report console errors and dead links
MAKEFUN_OUTPUT_DIR=out node main.ts # build the hand-in bundle in out/
```

`main.ts` needs Node 22 or later. It refuses an entry the scorer would refuse: fewer than three or
more than four screenshots, one over 256 KiB, or an `app/` past the file and byte caps, and it
says which limit was hit rather than writing a bundle that would fail the gate.

## Data

All figures are from Statistics Indonesia (BPS), Bank Indonesia and the World Bank, for 2020 to
2024. The 2020 population is the census; later years are BPS estimates, and the pages label them
that way. Province poverty rates for the six Papua provinces are 2023 estimates, marked in the
chart source line. This is a demonstration site built for a bounty; it is not an official
publication and should not be cited as one.

## License

MIT. See [LICENSE](LICENSE).
