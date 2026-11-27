// Prices page (#/prices): December inflation since 2020, the price level that inflation adds up to, what the CPI
// basket weighs, and the Bank Indonesia policy rate.

import { barChart, lineChart, rankedBars } from '../charts.js';
import { cite, citeSeries, formatNumber, formatPercent, latestPoint } from '../format.js';
import { chartFigure, chartWidth, grid, note, pageHeader, statRow, statTile } from '../page-blocks.js';
import { cpiWeights, inflation, policyRate } from '../data/prices.js';

// December price level with December 2020 = 100, chaining each later year's December inflation.
function priceLevel() {
  let level = 100;
  return inflation.points.map((p, i) => {
    if (i > 0) level *= 1 + p.value / 100;
    return { year: p.year, value: level };
  });
}

function headlineStats(level) {
  const latest = latestPoint(inflation);
  const peak = inflation.points.reduce((a, b) => (b.value > a.value ? b : a));
  return statRow([
    statTile({ label: 'Inflation, Dec 2024', value: formatPercent(latest.value, 2), context: 'consumer prices, year on year', source: cite('BPS', latest.year) }),
    statTile({ label: 'Peak since 2020', value: formatPercent(peak.value, 2), context: `December ${peak.year}`, source: cite('BPS', peak.year) }),
    statTile({ label: 'Prices since Dec 2020', value: `+${formatPercent(level[level.length - 1].value - 100, 1)}`, context: 'computed from the yearly rates', source: cite('BPS', '2021–2024') }),
    statTile({ label: 'BI policy rate', value: formatPercent(policyRate.value, 2), context: '7-day reverse repo rate', source: cite(policyRate.source, policyRate.period) }),
    statTile({ label: 'Rate above inflation', value: `${formatNumber(policyRate.value - latest.value, 2)}`, unit: 'pt', context: 'policy rate minus Dec inflation', source: cite('BI; BPS', 'Dec 2024') }),
  ]);
}

function inflationFigure(ctx) {
  return chartFigure({
    title: 'Consumer price inflation, December, 2020–2024',
    reading: 'Inflation jumped to 5.51% in 2022 and fell back to 1.57% by the end of 2024.',
    chart: lineChart(inflation.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'December year-on-year CPI inflation', format: (v) => formatPercent(v, 2), tickFormat: (v) => `${v}%`, zero: true, labelAll: true }),
    source: citeSeries(inflation),
    note: 'year on year, December of each year',
    table: { columns: [{ label: 'Year' }, { label: 'Inflation, Dec y/y', numeric: true }], rows: inflation.points.map((p) => [p.year, formatPercent(p.value, 2)]) },
  });
}

function levelFigure(ctx, level) {
  const last = level[level.length - 1];
  return chartFigure({
    title: 'Price level, December 2020 = 100',
    reading: `A basket that cost IDR 100,000 in December 2020 cost about IDR ${formatNumber(last.value * 1000)} in December 2024.`,
    chart: barChart(level, { width: chartWidth(ctx, 'half'), height: 250, label: 'Consumer price level indexed to December 2020', format: (v) => formatNumber(v, 1), tickFormat: (v) => formatNumber(v, 0), highlight: (p) => p.year === last.year }),
    source: citeSeries(inflation),
    note: 'computed by chaining the December rates',
    table: { columns: [{ label: 'December' }, { label: 'Index (2020 = 100)', numeric: true }], rows: level.map((p) => [p.year, formatNumber(p.value, 1)]) },
  });
}

function weightsFigure(ctx) {
  const listed = cpiWeights.rows.reduce((sum, r) => sum + r.value, 0);
  const rows = [...cpiWeights.rows, { label: 'All other groups', value: 100 - listed }];
  return chartFigure({
    title: 'What the CPI basket weighs, 2023',
    reading: 'Food and drink is about a quarter of household spending in the index, so food prices move inflation most.',
    chart: rankedBars(rows, { width: chartWidth(ctx, 'half'), label: 'CPI group weights, 2023', format: (v) => `~${formatNumber(v, 0)}%`, labelWidth: 160, highlight: (r) => r.label === 'Food & beverages' }),
    source: cite(cpiWeights.source, cpiWeights.year),
    note: 'approximate weights; “all other groups” is the remainder',
  });
}

function policyFigure() {
  return `<section class="fig"><h2>Bank Indonesia policy rate</h2>
  <p class="stat-value">${formatPercent(policyRate.value, 2)}<small>BI 7-day reverse repo rate, December 2024</small></p>
  <p class="reading">The rate banks pay to borrow from the central bank, which sets the floor for loan and deposit rates. In December 2024 it stood ${formatNumber(policyRate.value - latestPoint(inflation).value, 2)} points above inflation of ${formatPercent(latestPoint(inflation).value, 2)}.</p>
  <p class="fig-source">Source: ${cite(policyRate.source, policyRate.period)}; inflation ${cite('BPS', 2024)}</p></section>`;
}

export function render(params, ctx) {
  const level = priceLevel();
  const html = `${pageHeader({
    kicker: 'Prices & cost of living',
    title: 'Prices and inflation',
    lede: `Consumer prices rose ${formatPercent(latestPoint(inflation).value, 2)} in the year to December 2024 ${cite('BPS', 2024)}, the lowest in five years. Over four years, prices rose about ${formatPercent(level[level.length - 1].value - 100, 0)} in total.`,
  })}
${headlineStats(level)}
${grid(inflationFigure(ctx), levelFigure(ctx, level))}
${grid(weightsFigure(ctx), policyFigure())}
${note('Retail prices of individual foods are not in this release; see <a href="#/sources">Sources</a>.')}`;
  return { title: 'Prices & cost of living', html };
}
