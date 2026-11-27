// Province page (#/regions/<slug>): one province's population, HDI and poverty rate, its rank among the 38, how it
// compares with its island group and the national figure, and links to the neighbouring provinces in the table.

import { rankedBars } from '../charts.js';
import { cite, escapeHtml, formatNumber, formatPercent, formatSigned, latestPoint } from '../format.js';
import { chartFigure, chartWidth, grid, note, statRow, statTile } from '../page-blocks.js';
import { provinces, provinceYears } from '../data/provinces.js';
import { hdi as nationalHdi, povertyRate } from '../data/welfare.js';

const provinceTotal = provinces.reduce((sum, p) => sum + p.population, 0);

// 1 for the largest value (or the smallest, when lowestFirst), as in "3rd of 38".
function rankOf(province, key, lowestFirst = false) {
  const ordered = [...provinces].sort((a, b) => (lowestFirst ? a[key] - b[key] : b[key] - a[key]));
  return ordered.findIndex((p) => p[key] === province[key]) + 1;
}

function ordinal(n) {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
}

function sourceFor(province, year) {
  return province.source === 'BPS' ? cite('BPS', year) : cite('BPS, estimasi', 2023);
}

function comparisonFigure(ctx, province, { key, title, format, reference, domain, lowestFirst }) {
  const group = provinces.filter((p) => p.island === province.island).sort((a, b) => (lowestFirst ? a[key] - b[key] : b[key] - a[key]));
  return chartFigure({
    title,
    reading: `${escapeHtml(province.name)} is marked in the accent colour; the dashed line is the national figure.`,
    chart: rankedBars(
      group.map((p) => ({ label: p.name, value: p[key], href: `#/regions/${p.slug}` })),
      { width: chartWidth(ctx, 'half'), label: title, format, reference, domain, labelWidth: 170, highlight: (r) => r.label === province.name },
    ),
    source: `${cite('BPS', 2024)}, provinces and national`,
  });
}

function rankingFigure(ctx, province, hdiLatest) {
  const ordered = [...provinces].sort((a, b) => b.hdi - a.hdi);
  return chartFigure({
    title: `HDI of all 38 provinces, 2024`,
    reading: `${escapeHtml(province.name)} ranks ${ordinal(rankOf(province, 'hdi'))} of ${provinces.length}.`,
    chart: rankedBars(
      ordered.map((p) => ({ label: p.name, value: p.hdi, href: `#/regions/${p.slug}` })),
      { width: chartWidth(ctx), label: 'HDI of every province', format: (v) => formatNumber(v, 1), reference: { value: hdiLatest, label: `Indonesia ${formatNumber(hdiLatest, 2)}` }, domain: [55, 87], labelWidth: 190, rowHeight: 21, highlight: (r) => r.label === province.name },
    ),
    source: `${cite('BPS', 2024)}; Papua provinces ${cite('BPS, estimasi', 2023)}`,
  });
}

export function render([slug], ctx) {
  const index = provinces.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const province = provinces[index];
  const hdiLatest = latestPoint(nationalHdi).value;
  const povertyLatest = latestPoint(povertyRate).value;
  const share = (province.population / provinceTotal) * 100;
  const previous = provinces[(index - 1 + provinces.length) % provinces.length];
  const next = provinces[(index + 1) % provinces.length];
  const povertyGap = province.poverty - povertyLatest;
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/regions">← All 38 provinces</a></nav>
<header class="page-head">
  <p class="kicker">${escapeHtml(province.island)} · capital ${escapeHtml(province.capital)}</p>
  <h1>${escapeHtml(province.name)}</h1>
  <p class="lede">${formatNumber(province.population / 1000, 2)} million people ${sourceFor(province, provinceYears.population)}, the ${ordinal(rankOf(province, 'population'))} most populous of ${provinces.length} provinces. Its poverty rate is ${formatPercent(province.poverty, 1)} ${sourceFor(province, 2024)}, ${povertyGap > 0 ? `${formatNumber(povertyGap, 1)} points above` : povertyGap < 0 ? `${formatNumber(-povertyGap, 1)} points below` : 'equal to'} the national ${formatPercent(povertyLatest, 2)}.</p>
</header>
${statRow([
  statTile({ label: 'Population', value: formatNumber(province.population), unit: 'thousand', context: `${ordinal(rankOf(province, 'population'))} of ${provinces.length}`, source: sourceFor(province, provinceYears.population) }),
  statTile({ label: 'Share of Indonesians', value: formatPercent(share, 1), context: 'of the 38-province total', source: sourceFor(province, provinceYears.population) }),
  statTile({ label: 'HDI', value: formatNumber(province.hdi, 1), context: `${ordinal(rankOf(province, 'hdi'))} of ${provinces.length} · ${formatSigned(province.hdi - hdiLatest, 2)} vs Indonesia`, source: sourceFor(province, provinceYears.hdi) }),
  statTile({ label: 'Poverty rate', value: formatPercent(province.poverty, 1), context: `${ordinal(rankOf(province, 'poverty'))} highest of ${provinces.length} · ${formatSigned(povertyGap, 2, ' pt')} vs Indonesia`, source: sourceFor(province, provinceYears.poverty) }),
])}
${province.source !== 'BPS' ? note(`${escapeHtml(province.name)} is one of the six Papua provinces redrawn in 2022. Its figures are BPS 2023 estimates (estimasi 2023) and are not comparable with series for the old province boundaries.`) : ''}
${grid(
  comparisonFigure(ctx, province, { key: 'hdi', title: `HDI across ${province.island}, 2024`, format: (v) => formatNumber(v, 1), reference: { value: hdiLatest, label: `Indonesia ${formatNumber(hdiLatest, 2)}` }, domain: [55, 87] }),
  comparisonFigure(ctx, province, { key: 'poverty', title: `Poverty rate across ${province.island}, 2024`, format: (v) => formatPercent(v, 1), reference: { value: povertyLatest, label: `Indonesia ${formatPercent(povertyLatest, 2)}` }, lowestFirst: true }),
)}
${rankingFigure(ctx, province, hdiLatest)}
<nav class="pager" aria-label="Neighbouring provinces"><a href="#/regions/${previous.slug}">← ${escapeHtml(previous.name)}</a><a href="#/regions/${next.slug}">${escapeHtml(next.name)} →</a></nav>`;
  return { title: province.name, html };
}
