// The HTML blocks pages are built from: a page header, a chart figure with its source and a data table behind a
// toggle, a key-figure tile, a key-figures list and a plain data table. Views compose these; none of them fetches.

import { escapeHtml } from './format.js';

// Pixel width for a chart in a full-width ('full') or half-width ('half') column of the current layout.
export function chartWidth(ctx, span = 'full') {
  const twoColumns = ctx.width >= 860;
  const width = span === 'half' && twoColumns ? (ctx.width - 48) / 2 : ctx.width;
  return Math.max(280, Math.floor(width));
}

export function pageHeader({ kicker, title, lede, facts = '' }) {
  return `<header class="page-head">
  <p class="kicker">${escapeHtml(kicker)}</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="lede">${lede}</p>
  ${facts}
</header>`;
}

// A table with a header row; `columns` are { label, numeric } and `rows` are arrays of HTML cell strings.
export function dataTable(columns, rows, caption = '') {
  const head = columns.map((c) => `<th scope="col"${c.numeric ? ' class="num"' : ''}>${escapeHtml(c.label)}</th>`).join('');
  const body = rows.map((row) => `<tr>${row.map((cell, i) => `<td${columns[i].numeric ? ' class="num"' : ''}>${cell}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table>${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

// A chart with its title, a one-line reading of it, the chart, its source line and its numbers behind a toggle.
export function chartFigure({ id = '', title, reading = '', chart, source, note = '', table = null }) {
  const tableToggle = table ? `<details class="fig-data"><summary>Show the numbers</summary>${dataTable(table.columns, table.rows)}</details>` : '';
  return `<figure class="fig"${id ? ` id="${id}"` : ''}>
  <figcaption><h2>${escapeHtml(title)}</h2>${reading ? `<p class="reading">${reading}</p>` : ''}</figcaption>
  <div class="fig-chart">${chart}</div>
  <p class="fig-source">Source: ${source}${note ? ` · ${note}` : ''}</p>
  ${tableToggle}
</figure>`;
}

// A headline number: what it is, the figure, a context line and its citation.
export function statTile({ label, value, unit = '', context = '', source }) {
  return `<div class="stat">
  <p class="stat-label">${escapeHtml(label)}</p>
  <p class="stat-value">${value}${unit ? `<small>${escapeHtml(unit)}</small>` : ''}</p>
  ${context ? `<p class="stat-context">${context}</p>` : ''}
  <p class="stat-source">${source}</p>
</div>`;
}

export function statRow(tiles) {
  return `<div class="stats">${tiles.join('')}</div>`;
}

// A two-column list of figures: each item is { label, value, source }.
export function keyFigures(items) {
  return `<dl class="key-figures">${items
    .map((item) => `<div><dt>${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</dt><dd><span class="kf-value">${item.value}</span> ${item.source}</dd></div>`)
    .join('')}</dl>`;
}

export function grid(...cells) {
  return `<div class="grid-2">${cells.join('')}</div>`;
}

export function note(html) {
  return `<p class="note">${html}</p>`;
}
