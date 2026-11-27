// Economy page (#/economy): GDP at current prices and per person, real growth, the sector mix, merchandise trade and
// foreign exchange reserves.

import { barChart, groupedBars, lineChart, rankedBars } from '../charts.js';
import { cite, citeSeries, formatNumber, formatPercent, formatSigned, latestPoint, previousPoint } from '../format.js';
import { chartFigure, chartWidth, grid, note, pageHeader, statRow, statTile } from '../page-blocks.js';
import { fxReserves, gdpNominal, gdpPerCapita, realGrowth, sectorShares, trade } from '../data/economy.js';

const latestTrade = trade.rows[trade.rows.length - 1];

function headlineStats() {
  const gdp = latestPoint(gdpNominal);
  const perCapita = latestPoint(gdpPerCapita);
  const growth = latestPoint(realGrowth);
  return statRow([
    statTile({ label: 'GDP, current prices', value: formatNumber(gdp.value, 1), unit: 'IDR tn', context: `${formatSigned((gdp.value / previousPoint(gdpNominal).value - 1) * 100, 1, '%')} on ${previousPoint(gdpNominal).year}`, source: cite('BPS', gdp.year) }),
    statTile({ label: 'GDP per capita', value: `$${formatNumber(perCapita.value)}`, unit: 'USD', context: `$${formatNumber(gdpPerCapita.points[0].value)} in 2020`, source: cite(gdpPerCapita.source, perCapita.year) }),
    statTile({ label: 'Real GDP growth', value: formatPercent(growth.value, 2), context: `${formatPercent(previousPoint(realGrowth).value, 2)} in ${previousPoint(realGrowth).year}`, source: cite('BPS', growth.year) }),
    statTile({ label: 'Exports', value: `$${formatNumber(latestTrade.exports, 1)}`, unit: 'USD bn', context: `imports $${formatNumber(latestTrade.imports, 1)} bn`, source: cite(trade.source, latestTrade.year) }),
    statTile({ label: 'FX reserves', value: `$${formatNumber(fxReserves.value, 1)}`, unit: 'USD bn', context: 'end of December', source: cite(fxReserves.source, fxReserves.period) }),
  ]);
}

function gdpFigure(ctx) {
  return chartFigure({
    title: 'GDP at current prices, 2020–2024',
    reading: 'Nominal GDP grew by 43% in four years, from IDR 15,443 trillion to IDR 22,139 trillion.',
    chart: barChart(gdpNominal.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'GDP in IDR trillion by year', format: (v) => formatNumber(v, 0), tickFormat: (v) => `${formatNumber(v / 1000, 0)}k`, highlight: (p) => p.year === 2024 }),
    source: citeSeries(gdpNominal),
    note: 'IDR trillion; axis in thousands of trillions',
    table: { columns: [{ label: 'Year' }, { label: 'GDP (IDR trillion)', numeric: true }], rows: gdpNominal.points.map((p) => [p.year, formatNumber(p.value, 1)]) },
  });
}

function growthFigure(ctx) {
  return chartFigure({
    title: 'Real GDP growth, 2020–2024',
    reading: 'After the 2020 contraction of 2.07%, growth has held near 5% for three years.',
    chart: barChart(realGrowth.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'Real GDP growth by year', format: (v) => formatPercent(v, 2), tickFormat: (v) => `${v}%`, highlight: (p) => p.year === 2024 }),
    source: citeSeries(realGrowth),
    table: { columns: [{ label: 'Year' }, { label: 'Real growth', numeric: true }], rows: realGrowth.points.map((p) => [p.year, formatPercent(p.value, 2)]) },
  });
}

function perCapitaFigure(ctx) {
  return chartFigure({
    title: 'GDP per capita in US dollars, 2020–2024',
    reading: 'Income per person rose by about $1,100, with gains slowing since 2022.',
    chart: lineChart(gdpPerCapita.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'GDP per capita in USD by year', format: (v) => `$${formatNumber(v)}`, tickFormat: (v) => `$${formatNumber(v)}`, labelAll: true }),
    source: citeSeries(gdpPerCapita),
    table: { columns: [{ label: 'Year' }, { label: 'GDP per capita (USD)', numeric: true }], rows: gdpPerCapita.points.map((p) => [p.year, formatNumber(p.value)]) },
  });
}

function sectorFigure(ctx) {
  const listed = sectorShares.rows.reduce((sum, r) => sum + r.value, 0);
  return chartFigure({
    title: 'What the economy makes: share of GDP by sector, 2023',
    reading: 'Manufacturing is the largest sector at 18.7% of GDP; trade and agriculture follow.',
    chart: rankedBars(sectorShares.rows, { width: chartWidth(ctx, 'half'), label: 'Share of GDP by sector, 2023', format: (v) => formatPercent(v, 1), labelWidth: 200, highlight: (r) => r.label === 'Manufacturing' }),
    source: cite(sectorShares.source, sectorShares.year),
    note: `the seven sectors shown make up ${formatPercent(listed, 1)}; the other ${formatPercent(100 - listed, 1)} is spread across smaller sectors`,
    table: { columns: [{ label: 'Sector' }, { label: 'Share of GDP', numeric: true }], rows: sectorShares.rows.map((r) => [r.label, formatPercent(r.value, 1)]) },
  });
}

function tradeFigure(ctx) {
  const balances = trade.rows.map((r) => `${r.year}: surplus of $${formatNumber(r.exports - r.imports, 2)} bn`).join('; ');
  return chartFigure({
    title: 'Merchandise trade, 2023 and 2024',
    reading: `Exports exceed imports in both years. ${balances}.`,
    chart: groupedBars(
      trade.rows.map((r) => ({ label: String(r.year), exports: r.exports, imports: r.imports })),
      [
        { key: 'exports', label: 'Exports', className: 'mark' },
        { key: 'imports', label: 'Imports', className: 'mark-accent' },
      ],
      { width: chartWidth(ctx, 'half'), height: 250, label: 'Exports and imports in USD billion', format: (v) => `$${formatNumber(v, 1)}bn` },
    ),
    source: cite(trade.source, '2023–2024'),
    note: 'surplus is exports minus imports',
    table: { columns: [{ label: 'Year' }, { label: 'Exports (USD bn)', numeric: true }, { label: 'Imports (USD bn)', numeric: true }, { label: 'Balance', numeric: true }], rows: trade.rows.map((r) => [r.year, formatNumber(r.exports, 2), formatNumber(r.imports, 2), formatNumber(r.exports - r.imports, 2)]) },
  });
}

function reservesFigure() {
  return `<section class="fig"><h2>Foreign exchange reserves</h2>
  <p class="stat-value">$${formatNumber(fxReserves.value, 1)}<small>USD billion, end of December 2024</small></p>
  <p class="reading">Official reserve assets held by the central bank, which back the rupiah and pay for imports and external debt.</p>
  <p class="stat-value">${formatNumber(fxReserves.value / (latestTrade.imports / 12), 1)}<small>months of 2024 merchandise imports</small></p>
  <p class="reading">Computed as reserves divided by average monthly imports of $${formatNumber(latestTrade.imports / 12, 2)} bn ${cite(trade.source, latestTrade.year)}.</p>
  <p class="fig-source">Source: ${cite(fxReserves.source, fxReserves.period)}</p></section>`;
}

export function render(params, ctx) {
  const gdp = latestPoint(gdpNominal);
  const html = `${pageHeader({
    kicker: 'Economy',
    title: 'The Indonesian economy',
    lede: `GDP reached IDR ${formatNumber(gdp.value, 1)} trillion in ${gdp.year} ${cite('BPS', gdp.year)}, or $${formatNumber(latestPoint(gdpPerCapita).value)} per person ${cite(gdpPerCapita.source, 2024)}. Real growth was ${formatPercent(latestPoint(realGrowth).value, 2)} ${cite('BPS', 2024)}.`,
  })}
${headlineStats()}
${grid(gdpFigure(ctx), growthFigure(ctx))}
${grid(perCapitaFigure(ctx), sectorFigure(ctx))}
${grid(tradeFigure(ctx), reservesFigure())}
${note('GDP growth by sector and provincial GDP per capita are not in this release; see <a href="#/sources">Sources</a> for what is covered.')}`;
  return { title: 'Economy', html };
}
