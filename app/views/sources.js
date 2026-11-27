// Sources page (#/sources): every publication behind the site's figures with its years and coverage, how to read the
// citations, the reference periods of each series, and what this release does not cover.

import { escapeHtml } from '../format.js';
import { dataTable, pageHeader } from '../page-blocks.js';
import { notCovered, sources } from '../data/sources.js';

const pageNames = { overview: ['#/', 'Overview'], population: ['#/population', 'Population'], economy: ['#/economy', 'Economy'], regions: ['#/regions', 'Regions'], prices: ['#/prices', 'Prices'], labour: ['#/labour', 'Labour'] };

const referencePeriods = [
  ['Population estimates', 'Mid-year, 2021–2024; 2020 is the census (September 2020)'],
  ['Inflation', 'December, year on year'],
  ['Poverty rate', 'September survey round'],
  ['Unemployment rate', 'February survey round'],
  ['Provincial population', '2023 estimate; Papua provinces estimasi 2023'],
  ['Provincial HDI and poverty', '2024'],
  ['Reserves and policy rate', 'End of December 2024'],
];

function sourceItem(source) {
  const links = source.pages.map((page) => `<a href="${pageNames[page][0]}">${pageNames[page][1]}</a>`).join('');
  return `<li>
  <div><h3>${escapeHtml(source.title)}</h3><p class="publisher">${escapeHtml(source.publisher)}</p></div>
  <p class="source-years">${escapeHtml(source.years)}</p>
  <div><p>${escapeHtml(source.covers)}</p><p class="source-pages">${links}</p></div>
</li>`;
}

export function render() {
  const html = `${pageHeader({
    kicker: 'Sources & methods',
    title: 'Where the figures come from',
    lede: `Every figure on this site comes from one of the ${sources.length} publications below, from BPS – Statistics Indonesia and Bank Indonesia. Beside each number you will find its source and year, written <span class="cite">BPS, 2024</span>.`,
  })}
<ul class="source-list">${sources.map(sourceItem).join('')}</ul>
<h2 class="section-title">How to read the citations</h2>
<p class="prose"><span class="cite">BPS, 2024</span> names the publisher and the year the figure refers to. <span class="tag">est. 2023</span> marks the six Papua provinces redrawn in 2022, whose figures are BPS 2023 estimates. Figures this site works out from published ones, such as shares of a total, trade balances or the price level, say “computed” or “minus” next to them; no gap in a series is filled in.</p>
<h2 class="section-title">Reference periods</h2>
${dataTable([{ label: 'Series' }, { label: 'Period' }], referencePeriods.map(([series, period]) => [escapeHtml(series), escapeHtml(period)]))}
<div class="spacer"></div>
<h2 class="section-title">Not in this release</h2>
<p class="prose">These series are not shown here, so their absence should not be read as zero:</p>
<ul class="gap-list">${notCovered.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return { title: 'Sources', html };
}
