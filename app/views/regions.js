// Regions page (#/regions): the 38-province table with population, HDI and poverty rate. Every column header sorts,
// the search box filters by province, capital or island group, and the island select narrows the rows. ?sort=hdi,
// ?sort=poverty or ?sort=population in the address picks the starting order.

import { rankedBars } from '../charts.js';
import { cite, escapeHtml, formatNumber, formatPercent, latestPoint } from '../format.js';
import { chartFigure, chartWidth, grid, pageHeader } from '../page-blocks.js';
import { islandGroups, provinces, provinceYears } from '../data/provinces.js';
import { hdi as nationalHdi, povertyRate } from '../data/welfare.js';

const provinceTotal = provinces.reduce((sum, p) => sum + p.population, 0);
const nationalPoverty = latestPoint(povertyRate).value;
const columns = [
  { key: 'order', label: '#', numeric: false, firstDir: 'asc' },
  { key: 'name', label: 'Province', numeric: false, firstDir: 'asc' },
  { key: 'capital', label: 'Capital', numeric: false, firstDir: 'asc', className: 'col-wide' },
  { key: 'island', label: 'Island group', numeric: false, firstDir: 'asc', className: 'col-wide' },
  { key: 'population', label: 'Population, 2023', short: 'Pop. 2023', numeric: true, firstDir: 'desc' },
  { key: 'hdi', label: 'HDI, 2024', short: 'HDI', numeric: true, firstDir: 'desc' },
  { key: 'poverty', label: 'Poverty rate, 2024', short: 'Poverty', numeric: true, firstDir: 'desc' },
];
const state = { key: 'population', dir: 'desc', search: '', island: 'all' };

function startingState(query) {
  const sort = query.get('sort');
  const column = columns.find((c) => c.key === sort);
  if (column) Object.assign(state, { key: column.key, dir: column.firstDir });
  if (query.get('island') && islandGroups.includes(query.get('island'))) state.island = query.get('island');
}

function visibleRows() {
  const needle = state.search.trim().toLowerCase();
  const rows = provinces
    .map((p, index) => ({ ...p, order: index + 1 }))
    .filter((p) => state.island === 'all' || p.island === state.island)
    .filter((p) => !needle || `${p.name} ${p.capital} ${p.island}`.toLowerCase().includes(needle));
  const direction = state.dir === 'asc' ? 1 : -1;
  return rows.sort((a, b) => {
    const left = a[state.key];
    const right = b[state.key];
    const compared = typeof left === 'string' ? left.localeCompare(right) : left - right;
    return compared * direction || a.order - b.order;
  });
}

function rowHtml(p, rank) {
  const estimate = p.source !== 'BPS' ? '<span class="tag" title="Province created in 2022; figures are 2023 estimates">est. 2023</span>' : '';
  const share = (p.population / provinceTotal) * 100;
  return `<tr>
  <td>${rank}</td>
  <td><a href="#/regions/${p.slug}">${escapeHtml(p.name)}</a>${estimate}</td>
  <td class="col-wide">${escapeHtml(p.capital)}</td>
  <td class="col-wide">${escapeHtml(p.island)}</td>
  <td class="num">${formatNumber(p.population)}k <span class="cite share">${formatPercent(share, 1)}</span></td>
  <td class="num"><span class="cell-bar">${formatNumber(p.hdi, 1)}<i style="width:${(p.hdi * 0.6).toFixed(1)}px"></i></span></td>
  <td class="num"><span class="cell-bar${p.poverty > nationalPoverty ? ' warn' : ''}">${formatPercent(p.poverty, 1)}<i style="width:${(p.poverty * 1.8).toFixed(1)}px"></i></span></td>
</tr>`;
}

function bodyHtml(rows) {
  if (!rows.length) return '<tr class="empty-row"><td colspan="7">No province matches. Clear the search or choose “All island groups”.</td></tr>';
  return rows.map((p, i) => rowHtml(p, i + 1)).join('');
}

function headerHtml() {
  return columns
    .map((c) => {
      const sorted = c.key === state.key ? ` aria-sort="${state.dir === 'asc' ? 'ascending' : 'descending'}"` : '';
      const classes = [c.numeric ? 'num' : '', c.className ?? ''].filter(Boolean).join(' ');
      return `<th scope="col"${classes ? ` class="${classes}"` : ''}${sorted}><button type="button" class="sort" data-key="${c.key}">${c.short ? `<span class="long">${escapeHtml(c.label)}</span><span class="short">${escapeHtml(c.short)}</span>` : escapeHtml(c.label)}</button></th>`;
    })
    .join('');
}

function countText(count) {
  return `Showing ${count} of ${provinces.length} provinces`;
}

function extremesFigure(ctx, { title, key, reading, format, reference, highestIsWorse, domain }) {
  const sorted = [...provinces].sort((a, b) => b[key] - a[key]);
  const picks = [...sorted.slice(0, 5), ...sorted.slice(-5)];
  return chartFigure({
    title,
    reading,
    chart: rankedBars(
      picks.map((p) => ({ label: p.name, value: p[key], href: `#/regions/${p.slug}` })),
      { width: chartWidth(ctx, 'half'), label: title, format, reference, labelWidth: 170, domain, highlight: (r) => (highestIsWorse ? r.value > reference.value : r.value < reference.value) },
    ),
    source: `${cite('BPS', 2024)}; Papua provinces ${cite('BPS, estimasi', 2023)}`,
    note: `top five and bottom five of ${provinces.length}; accent marks ${highestIsWorse ? 'above' : 'below'} the national figure`,
  });
}

export function render(params, ctx) {
  startingState(ctx.query);
  const rows = visibleRows();
  const islandOptions = ['all', ...islandGroups].map((g) => `<option value="${escapeHtml(g)}"${g === state.island ? ' selected' : ''}>${g === 'all' ? 'All island groups' : escapeHtml(g)}</option>`).join('');
  const hdiLatest = latestPoint(nationalHdi).value;
  const html = `${pageHeader({
    kicker: 'Regions',
    title: 'Indonesia’s 38 provinces',
    lede: `Population ${cite('BPS', provinceYears.population)}, Human Development Index ${cite('BPS', provinceYears.hdi)} and poverty rate ${cite('BPS', provinceYears.poverty)} for every province. Sort by any column, search, or open a province for its own page.`,
  })}
<div class="toolbar" role="search">
  <label class="field">Find a province<input id="province-search" type="search" placeholder="Name, capital or island" value="${escapeHtml(state.search)}" autocomplete="off"></label>
  <label class="field">Island group<select id="island-filter">${islandOptions}</select></label>
  <p class="result-count" id="result-count" aria-live="polite">${countText(rows.length)}</p>
</div>
<div class="table-wrap">
<table class="province-table">
  <caption>Population in thousands with share of the 38-province total ${cite('BPS', 2023)}. HDI and poverty rate ${cite('BPS', 2024)}; poverty bars in the accent colour are above the national ${formatPercent(nationalPoverty, 2)}. Provinces marked est. 2023 were created in 2022 ${cite('BPS, estimasi', 2023)}.</caption>
  <thead><tr id="province-head">${headerHtml()}</tr></thead>
  <tbody id="province-body">${bodyHtml(rows)}</tbody>
</table>
</div>
<div class="spacer"></div>
${grid(
  extremesFigure(ctx, { title: 'HDI: highest and lowest five, 2024', key: 'hdi', reading: `DKI Jakarta scores 83.6; Papua Pegunungan 58.5. Indonesia: ${formatNumber(hdiLatest, 2)}.`, format: (v) => formatNumber(v, 1), reference: { value: hdiLatest, label: `Indonesia ${formatNumber(hdiLatest, 2)}` }, highestIsWorse: false, domain: [55, 87] }),
  extremesFigure(ctx, { title: 'Poverty rate: highest and lowest five, 2024', key: 'poverty', reading: `From 33.0% in Papua Pegunungan to 4.0% in Bali and DKI Jakarta. Indonesia: ${formatPercent(nationalPoverty, 2)}.`, format: (v) => formatPercent(v, 1), reference: { value: nationalPoverty, label: `Indonesia ${formatPercent(nationalPoverty, 2)}` }, highestIsWorse: true }),
)}`;
  return { title: 'Regions', html };
}

export function mount(root) {
  const body = root.querySelector('#province-body');
  const head = root.querySelector('#province-head');
  const count = root.querySelector('#result-count');
  const refresh = () => {
    const rows = visibleRows();
    body.innerHTML = bodyHtml(rows);
    head.innerHTML = headerHtml();
    count.textContent = countText(rows.length);
  };
  root.querySelector('#province-search').addEventListener('input', (event) => {
    state.search = event.target.value;
    refresh();
  });
  root.querySelector('#island-filter').addEventListener('change', (event) => {
    state.island = event.target.value;
    refresh();
  });
  head.addEventListener('click', (event) => {
    const button = event.target.closest('button.sort');
    if (!button) return;
    const column = columns.find((c) => c.key === button.dataset.key);
    state.dir = state.key === column.key ? (state.dir === 'asc' ? 'desc' : 'asc') : column.firstDir;
    state.key = column.key;
    refresh();
    head.querySelector(`[data-key="${column.key}"]`).focus();
  });
}
