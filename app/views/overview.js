// Overview page (#/): Indonesia at a glance. Six headline series as small multiples, the growth record, the provinces
// with the highest poverty rates, a list of further key figures and a directory of every section.

import { barChart, rankedBars, smallMultiples } from '../charts.js';
import { cite, citeSeries, formatNumber, formatPercent, formatSigned, latestPoint, previousPoint, yearSpan } from '../format.js';
import { chartFigure, chartWidth, grid, keyFigures, pageHeader } from '../page-blocks.js';
import { growthSeries, populationSeries, provinceCount, urbanShare } from '../data/population.js';
import { fxReserves, gdpNominal, gdpPerCapita, realGrowth, trade } from '../data/economy.js';
import { inflation, policyRate } from '../data/prices.js';
import { gini, hdi, lifeExpectancy, poorPeople, povertyRate } from '../data/welfare.js';
import { labourForce, unemploymentRate } from '../data/labour.js';
import { provinces, provinceYears } from '../data/provinces.js';

function changeLine(series, digits, suffix) {
  const change = latestPoint(series).value - previousPoint(series).value;
  return `${formatSigned(change, digits, suffix)} on ${previousPoint(series).year}`;
}

function headlinePanels() {
  const pop = latestPoint(populationSeries);
  const gdp = latestPoint(gdpNominal);
  const gdpChange = (gdp.value / previousPoint(gdpNominal).value - 1) * 100;
  return [
    { name: 'Population', href: '#/population', value: formatNumber(pop.value, 1), unit: 'million', points: populationSeries.points, foot: `${formatSigned(latestPoint(growthSeries).value, 2, '%')} growth in ${latestPoint(growthSeries).year} · ${cite('BPS', yearSpan(populationSeries.points))}` },
    { name: 'GDP, current prices', href: '#/economy', value: formatNumber(gdp.value, 0), unit: 'IDR tn', points: gdpNominal.points, foot: `${formatSigned(gdpChange, 1, '%')} nominal · ${citeSeries(gdpNominal)}` },
    { name: 'Real GDP growth', href: '#/economy', value: formatPercent(latestPoint(realGrowth).value, 2), unit: 'y/y', points: realGrowth.points, foot: `${changeLine(realGrowth, 2, ' pt')} · ${citeSeries(realGrowth)}` },
    { name: 'Inflation, Dec', href: '#/prices', value: formatPercent(latestPoint(inflation).value, 2), unit: 'y/y', points: inflation.points, foot: `${changeLine(inflation, 2, ' pt')} · ${citeSeries(inflation)}` },
    { name: 'Poverty rate, Sep', href: '#/regions?sort=poverty', value: formatPercent(latestPoint(povertyRate).value, 2), unit: 'of people', points: povertyRate.points, foot: `${formatNumber(poorPeople.value, 2)}M people · ${citeSeries(povertyRate)}` },
    { name: 'Human Development', href: '#/regions?sort=hdi', value: formatNumber(latestPoint(hdi).value, 2), unit: 'HDI', points: hdi.points, foot: `${changeLine(hdi, 2, '')} · ${citeSeries(hdi)}` },
  ];
}

function growthFigure(ctx) {
  return chartFigure({
    title: 'Real GDP growth, 2020–2024',
    reading: 'Output shrank in 2020, then grew by about 5% a year from 2022 to 2024.',
    chart: barChart(realGrowth.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'Real GDP growth by year', format: (v) => formatPercent(v, 2), tickFormat: (v) => `${v}%`, highlight: (p) => p.year === 2024 }),
    source: citeSeries(realGrowth),
    table: { columns: [{ label: 'Year' }, { label: 'Real GDP growth', numeric: true }], rows: realGrowth.points.map((p) => [p.year, formatPercent(p.value, 2)]) },
  });
}

function povertyFigure(ctx) {
  const highest = [...provinces].sort((a, b) => b.poverty - a.poverty).slice(0, 8);
  const national = latestPoint(povertyRate).value;
  return chartFigure({
    title: 'Highest poverty rates by province, 2024',
    reading: `The six Papua provinces, Nusa Tenggara Timur and Maluku all sit well above the national rate of ${formatPercent(national, 2)}.`,
    chart: rankedBars(
      highest.map((p) => ({ label: p.name, value: p.poverty, href: `#/regions/${p.slug}` })),
      { width: chartWidth(ctx, 'half'), label: 'Provinces with the highest poverty rate', format: (v) => formatPercent(v, 1), reference: { value: national, label: `Indonesia ${formatPercent(national, 2)}` }, labelWidth: 150, highlight: (r) => r.value === highest[0].poverty, axis: true },
    ),
    source: `${cite('BPS', provinceYears.poverty)}; Papua provinces ${cite('BPS, estimasi', 2023)}`,
    table: { columns: [{ label: 'Province' }, { label: 'Poverty rate', numeric: true }], rows: highest.map((p) => [`<a href="#/regions/${p.slug}">${p.name}</a>`, formatPercent(p.poverty, 1)]) },
  });
}

function moreFigures() {
  const exports2024 = trade.rows[trade.rows.length - 1];
  return keyFigures([
    { label: 'GDP per capita', href: '#/economy', value: `USD ${formatNumber(latestPoint(gdpPerCapita).value)}`, source: cite(gdpPerCapita.source, 2024) },
    { label: 'Unemployment rate, February', href: '#/labour', value: formatPercent(latestPoint(unemploymentRate).value, 2), source: cite('BPS', 2024) },
    { label: 'Labour force', href: '#/labour', value: `${formatNumber(labourForce.value, 1)} million`, source: cite(labourForce.source, labourForce.year) },
    { label: 'Merchandise exports', href: '#/economy', value: `USD ${formatNumber(exports2024.exports, 2)}B`, source: cite(trade.source, exports2024.year) },
    { label: 'Foreign exchange reserves', href: '#/economy', value: `USD ${formatNumber(fxReserves.value, 1)}B`, source: cite(fxReserves.source, fxReserves.period) },
    { label: 'BI policy rate', href: '#/prices', value: formatPercent(policyRate.value, 2), source: cite(policyRate.source, policyRate.period) },
    { label: 'Gini ratio', value: formatNumber(gini.value, 3), source: cite(gini.source, gini.year) },
    { label: 'Life expectancy at birth', value: `${formatNumber(lifeExpectancy.value, 1)} years`, source: cite(lifeExpectancy.source, lifeExpectancy.year) },
    { label: 'Urban share of population', href: '#/population', value: formatPercent(urbanShare.value, 1), source: cite(urbanShare.source, urbanShare.year) },
    { label: 'Provinces', href: '#/regions', value: String(provinceCount.value), source: cite(provinceCount.source, provinceCount.year) },
  ]);
}

const sections = [
  ['#/population', 'Population', 'Census 2020 and estimates to 2024, growth, urbanisation, where people live.'],
  ['#/economy', 'Economy', 'GDP in rupiah and dollars, growth, the sector mix, trade and reserves.'],
  ['#/regions', 'Regions', 'All 38 provinces: population, HDI and poverty, sortable, with a page each.'],
  ['#/prices', 'Prices & cost of living', 'Inflation since 2020, what the CPI basket weighs, the policy rate.'],
  ['#/labour', 'Labour', 'Labour force, employment, unemployment and jobs by sector.'],
  ['#/sources', 'Sources', 'Every publication behind these figures, its years and coverage.'],
];

export function render(params, ctx) {
  const sparkWidth = ctx.width >= 1100 ? Math.floor(ctx.width / 6) - 30 : ctx.width >= 600 ? Math.floor(ctx.width / 3) - 30 : Math.floor(ctx.width / 2) - 22;
  const pop = latestPoint(populationSeries);
  const html = `${pageHeader({
    kicker: 'Indonesia · headline figures, data to 2024',
    title: 'Indonesia at a glance',
    lede: `${formatNumber(pop.value, 1)} million people ${cite('BPS', pop.year)} in ${provinceCount.value} provinces. The economy grew ${formatPercent(latestPoint(realGrowth).value, 2)} in 2024 ${cite('BPS', 2024)}, prices rose ${formatPercent(latestPoint(inflation).value, 2)} over the year to December ${cite('BPS', 2024)}, and ${formatPercent(latestPoint(povertyRate).value, 2)} of people live below the poverty line ${cite('BPS', 2024)}.`,
  })}
${smallMultiples(headlinePanels(), { sparkWidth })}
<div class="spacer"></div>
${grid(growthFigure(ctx), povertyFigure(ctx))}
<h2 class="section-title">More key figures</h2>
${moreFigures()}
<h2 class="section-title">Explore by section</h2>
<nav class="directory" aria-label="All sections">${sections.map(([href, name, text]) => `<a href="${href}"><h3>${name}</h3><p>${text}</p></a>`).join('')}</nav>`;
  return { title: 'Indonesia at a glance', html };
}
