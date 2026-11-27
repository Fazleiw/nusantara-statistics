// Labour page (#/labour): the labour force and employment, the February unemployment rate since 2020, jobs by
// sector, and how each sector's share of jobs compares with its share of GDP.

import { barChart, groupedBars, rankedBars } from '../charts.js';
import { cite, citeSeries, formatNumber, formatPercent, latestPoint } from '../format.js';
import { chartFigure, chartWidth, grid, note, pageHeader, statRow, statTile } from '../page-blocks.js';
import { employed, employmentBySector, labourForce, unemploymentRate } from '../data/labour.js';
import { sectorShares } from '../data/economy.js';

function headlineStats() {
  const latest = latestPoint(unemploymentRate);
  return statRow([
    statTile({ label: 'Labour force', value: formatNumber(labourForce.value, 1), unit: 'million', context: 'working or looking for work', source: cite(labourForce.source, labourForce.year) }),
    statTile({ label: 'Employed', value: formatNumber(employed.value, 1), unit: 'million', context: 'people in work', source: cite(employed.source, employed.year) }),
    statTile({ label: 'Unemployment, Feb', value: formatPercent(latest.value, 2), context: 'lowest of 2020–2024', source: cite('BPS', latest.year) }),
    statTile({ label: 'Jobs in agriculture', value: formatPercent(employmentBySector.rows[0].value, 1), context: 'the largest employer', source: cite('BPS', employmentBySector.year) }),
  ]);
}

function unemploymentFigure(ctx) {
  return chartFigure({
    title: 'Open unemployment rate, February, 2020–2024',
    reading: 'Unemployment rose to 6.26% in 2021 after the 2020 downturn, then fell each year to 4.82%.',
    chart: barChart(unemploymentRate.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'February unemployment rate by year', format: (v) => formatPercent(v, 2), tickFormat: (v) => `${v}%`, highlight: (p) => p.year === 2024 }),
    source: citeSeries(unemploymentRate),
    table: { columns: [{ label: 'Year' }, { label: 'Unemployment, Feb', numeric: true }], rows: unemploymentRate.points.map((p) => [p.year, formatPercent(p.value, 2)]) },
  });
}

function sectorFigure(ctx) {
  const listed = employmentBySector.rows.reduce((sum, r) => sum + r.value, 0);
  return chartFigure({
    title: 'Where people work: employment by sector, 2024',
    reading: 'More than one in four workers is in agriculture; trade is second.',
    chart: rankedBars(employmentBySector.rows, { width: chartWidth(ctx, 'half'), label: 'Share of employment by sector, 2024', format: (v) => formatPercent(v, 1), labelWidth: 130, highlight: (r) => r.label === 'Agriculture' }),
    source: cite(employmentBySector.source, employmentBySector.year),
    note: `the five sectors shown employ ${formatPercent(listed, 1)}; the rest work in other sectors`,
    table: { columns: [{ label: 'Sector' }, { label: 'Share of employed', numeric: true }], rows: employmentBySector.rows.map((r) => [r.label, formatPercent(r.value, 1)]) },
  });
}

// Sectors named in both the jobs and the GDP tables.
const pairedSectors = [
  ['Agriculture', 'Agriculture, forestry & fishing'],
  ['Trade', 'Wholesale & retail trade'],
  ['Manufacturing', 'Manufacturing'],
  ['Construction', 'Construction'],
];

function jobsVersusOutputFigure(ctx) {
  const groups = pairedSectors.map(([jobsName, gdpName]) => ({
    label: jobsName,
    jobs: employmentBySector.rows.find((r) => r.label === jobsName).value,
    output: sectorShares.rows.find((r) => r.label === gdpName).value,
  }));
  return chartFigure({
    title: 'Share of jobs and share of GDP, by sector',
    reading: 'Agriculture holds 28.2% of jobs but 12.5% of GDP, so output per worker there is low; manufacturing is the reverse.',
    chart: groupedBars(
      groups,
      [
        { key: 'jobs', label: 'Jobs', className: 'mark' },
        { key: 'output', label: 'GDP', className: 'mark-accent' },
      ],
      { width: chartWidth(ctx), height: 260, label: 'Share of jobs and share of GDP by sector', format: (v) => formatPercent(v, 1) },
    ),
    source: `jobs ${cite(employmentBySector.source, employmentBySector.year)}; GDP ${cite(sectorShares.source, sectorShares.year)}`,
    note: 'different years, so read as a broad comparison',
    table: { columns: [{ label: 'Sector' }, { label: 'Jobs, 2024', numeric: true }, { label: 'GDP, 2023', numeric: true }], rows: groups.map((g) => [g.label, formatPercent(g.jobs, 1), formatPercent(g.output, 1)]) },
  });
}

export function render(params, ctx) {
  const html = `${pageHeader({
    kicker: 'Labour',
    title: 'Work and jobs',
    lede: `${formatNumber(labourForce.value, 1)} million people were in the labour force in 2024 and ${formatNumber(employed.value, 1)} million were employed ${cite('BPS, Sakernas', 2024)}. Unemployment in February 2024 was ${formatPercent(latestPoint(unemploymentRate).value, 2)} ${cite('BPS', 2024)}.`,
  })}
${headlineStats()}
${grid(unemploymentFigure(ctx), sectorFigure(ctx))}
${jobsVersusOutputFigure(ctx)}
${note('The labour force participation rate is not in this release. Unemployment is the February survey round; the labour force and employment totals are for 2024. See <a href="#/sources">Sources</a>.')}`;
  return { title: 'Labour', html };
}
