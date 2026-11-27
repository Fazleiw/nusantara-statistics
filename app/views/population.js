// Population page (#/population): the 2020 census count and estimates since, the slowing growth rate, the urban
// share, and where Indonesians live by island group and province.

import { barChart, lineChart, rankedBars, shareBar } from '../charts.js';
import { cite, citeSeries, formatNumber, formatPercent, latestPoint } from '../format.js';
import { chartFigure, chartWidth, grid, keyFigures, note, pageHeader, statRow, statTile } from '../page-blocks.js';
import { census2020, growthSeries, populationSeries, provinceCount, sexRatio, urbanShare } from '../data/population.js';
import { islandGroups, provinces, provinceYears } from '../data/provinces.js';

const provinceTotal = provinces.reduce((sum, p) => sum + p.population, 0);

function islandShares() {
  return islandGroups
    .map((island) => {
      const people = provinces.filter((p) => p.island === island).reduce((sum, p) => sum + p.population, 0);
      return { label: island, value: (people / provinceTotal) * 100, people };
    })
    .sort((a, b) => b.value - a.value);
}

function headlineStats() {
  const latest = latestPoint(populationSeries);
  const growth = latestPoint(growthSeries);
  return statRow([
    statTile({ label: 'Census count', value: formatNumber(census2020.value), context: 'Sensus Penduduk, September 2020', source: cite('BPS', 2020) }),
    statTile({ label: 'Population estimate', value: formatNumber(latest.value, 1), unit: 'million', context: `+${formatNumber(latest.value - census2020.value / 1e6, 1)} million since the census`, source: cite('BPS', latest.year) }),
    statTile({ label: 'Growth rate', value: formatPercent(growth.value, 2), unit: 'a year', context: 'down from 1.22% in 2021', source: cite('BPS', growth.year) }),
    statTile({ label: 'Urban share', value: formatPercent(urbanShare.value, 1), context: 'of people live in urban areas', source: cite(urbanShare.source, urbanShare.year) }),
    statTile({ label: 'Sex ratio', value: formatNumber(sexRatio.value, 1), context: 'men per 100 women', source: cite(sexRatio.source, sexRatio.year) }),
  ]);
}

function populationFigure(ctx) {
  return chartFigure({
    title: 'Population, 2020–2024',
    reading: 'Between 2.9 and 3.1 million more people each year from 2022 to 2024.',
    chart: lineChart(populationSeries.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'Population in millions by year', format: (v) => `${formatNumber(v, 1)}M`, tickFormat: (v) => `${v}M`, labelAll: true }),
    source: `2020 ${cite(census2020.source, 2020)}; 2021–2024 ${cite('BPS, Statistik Indonesia', '2021–2024')}`,
    table: { columns: [{ label: 'Year' }, { label: 'Population (million)', numeric: true }, { label: 'Basis' }], rows: populationSeries.points.map((p) => [p.year, formatNumber(p.value, 2), p.note]) },
  });
}

function growthFigure(ctx) {
  return chartFigure({
    title: 'Population growth rate, 2021–2024',
    reading: 'Growth has slowed every year, from 1.22% to 1.03%. No 2020 rate is in this release.',
    chart: barChart(growthSeries.points, { width: chartWidth(ctx, 'half'), height: 250, label: 'Population growth rate by year', format: (v) => formatPercent(v, 2), tickFormat: (v) => `${formatNumber(v, 1)}%`, highlight: (p) => p.year === 2024 }),
    source: citeSeries(growthSeries),
    table: { columns: [{ label: 'Year' }, { label: 'Growth rate', numeric: true }], rows: growthSeries.points.map((p) => [p.year, formatPercent(p.value, 2)]) },
  });
}

function urbanFigure(ctx) {
  const rural = 100 - urbanShare.value;
  return chartFigure({
    title: 'Urban and rural population, 2023',
    reading: `More than half of Indonesians, ${formatPercent(urbanShare.value, 1)}, live in urban areas.`,
    chart: shareBar([{ label: 'Urban', value: urbanShare.value }, { label: 'Rural', value: rural, className: 'mark-accent' }], { width: chartWidth(ctx, 'half'), label: 'Urban and rural shares of the population' }),
    source: cite(urbanShare.source, urbanShare.year),
    note: 'rural share is 100% minus the urban share',
  });
}

function populationFacts() {
  const bySize = [...provinces].sort((a, b) => b.population - a.population);
  const largest = bySize[0];
  const smallest = bySize[bySize.length - 1];
  return `<h2 class="section-title">Population facts</h2>${keyFigures([
    { label: 'Census count, 2020', value: formatNumber(census2020.value), source: cite('BPS', 2020) },
    { label: 'Added since the census', value: `${formatNumber(latestPoint(populationSeries).value - census2020.value / 1e6, 1)}M`, source: cite('BPS', '2020–2024') },
    { label: 'Provinces', href: '#/regions', value: String(provinceCount.value), source: cite(provinceCount.source, provinceCount.year) },
    { label: `Largest: ${largest.name}`, href: `#/regions/${largest.slug}`, value: `${formatNumber(largest.population / 1000, 1)}M`, source: cite('BPS', provinceYears.population) },
    { label: `Smallest: ${smallest.name}`, href: `#/regions/${smallest.slug}`, value: `${formatNumber(smallest.population)}k`, source: smallest.source === 'BPS' ? cite('BPS', provinceYears.population) : cite('BPS estimate', 2023) },
    { label: 'Sex ratio (men per 100 women)', value: formatNumber(sexRatio.value, 1), source: cite(sexRatio.source, sexRatio.year) },
  ])}`;
}

function islandFigure(ctx) {
  const rows = islandShares();
  return chartFigure({
    title: 'Where people live, by island group, 2023',
    reading: `Java holds ${formatPercent(rows[0].value, 1)} of the population; Maluku and Papua together hold ${formatPercent(rows[rows.length - 1].value + rows[rows.length - 2].value, 1)}.`,
    chart: rankedBars(rows, { width: chartWidth(ctx, 'half'), label: 'Share of population by island group', format: (v) => formatPercent(v, 1), labelWidth: 160, highlight: (r) => r.label === 'Java' }),
    source: cite('BPS', provinceYears.population),
    note: `shares computed from the ${provinceCount.value} provincial estimates`,
    table: { columns: [{ label: 'Island group' }, { label: 'People (thousand)', numeric: true }, { label: 'Share', numeric: true }], rows: rows.map((r) => [r.label, formatNumber(r.people), formatPercent(r.value, 1)]) },
  });
}

function provinceFigure(ctx) {
  const largest = [...provinces].sort((a, b) => b.population - a.population).slice(0, 10);
  return chartFigure({
    title: 'The ten most populous provinces, 2023',
    reading: `Jawa Barat, Jawa Timur and Jawa Tengah together hold ${formatPercent((largest[0].population + largest[1].population + largest[2].population) / provinceTotal * 100, 1)} of all Indonesians.`,
    chart: rankedBars(
      largest.map((p) => ({ label: p.name, value: p.population / 1000, href: `#/regions/${p.slug}` })),
      { width: chartWidth(ctx), label: 'Most populous provinces, millions', format: (v) => `${formatNumber(v, 1)}M`, labelWidth: 170, highlight: (r) => r.value === largest[0].population / 1000 },
    ),
    source: cite('BPS', provinceYears.population),
    note: '<a href="#/regions?sort=population">all 38 provinces in the table</a>',
  });
}

export function render(params, ctx) {
  const latest = latestPoint(populationSeries);
  const html = `${pageHeader({
    kicker: 'Population',
    title: 'People of Indonesia',
    lede: `The 2020 census counted ${formatNumber(census2020.value)} people ${cite(census2020.source, 2020)}. BPS estimates ${formatNumber(latest.value, 1)} million for ${latest.year} ${cite('BPS', latest.year)}, growing ${formatPercent(latestPoint(growthSeries).value, 2)} a year, a rate that is slowing.`,
  })}
${headlineStats()}
${grid(populationFigure(ctx), growthFigure(ctx))}
${grid(`<div>${urbanFigure(ctx)}${populationFacts()}</div>`, islandFigure(ctx))}
${provinceFigure(ctx)}
${note(`The ${provinceCount.value} provincial estimates sum to ${formatNumber(provinceTotal / 1000, 1)} million, slightly above the national ${formatNumber(populationSeries.points.find((p) => p.year === 2023).value, 1)} million for 2023 ${cite('BPS', 2023)}, because they come from separate releases. Population by age group is not in this release; see <a href="#/sources">Sources</a>.`)}`;
  return { title: 'Population', html };
}
