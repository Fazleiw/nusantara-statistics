// Hand-written SVG charts. Each function takes plain data and a pixel width and returns an SVG string drawn at 1:1
// scale, so axis text keeps its size on a phone. Colours come from classes styled in site.css: .mark (the series
// colour), .mark-accent (the highlighted value), .grid, .axis, .tick and .value. Every mark carries a <title> tooltip.

import { escapeHtml, formatNumber } from './format.js';

// ---- Scale maths -------------------------------------------------------------------------------------------------

// Maps a value in [d0, d1] to a pixel in [r0, r1].
export function linearScale([d0, d1], [r0, r1]) {
  const pixelsPerUnit = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (value) => r0 + (value - d0) * pixelsPerUnit;
}

// Splits [r0, r1] into `count` equal slots, each holding a bar narrower than the slot by `padding`.
export function bandScale(count, [r0, r1], padding = 0.35) {
  const slot = (r1 - r0) / count;
  const barWidth = slot * (1 - padding);
  return { slot, barWidth, barStart: (index) => r0 + index * slot + (slot - barWidth) / 2 };
}

// Rounds a raw tick step to 1, 2, 2.5 or 5 times a power of ten.
function niceStep(rawStep) {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

// Round-number ticks that cover [min, max].
export function niceTicks(min, max, count = 4) {
  if (min === max) max = min + 1;
  const step = niceStep((max - min) / count);
  const ticks = [];
  for (let tick = Math.floor(min / step) * step; tick <= Math.ceil(max / step) * step + step / 2; tick += step) {
    ticks.push(Number(tick.toFixed(10)));
  }
  return ticks;
}

// ---- Shared pieces -------------------------------------------------------------------------------------------------

const px = (n) => n.toFixed(1);

function svgOpen(width, height, label) {
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeHtml(label)}">`;
}

function text(x, y, content, className = 'tick', anchor = 'middle') {
  return `<text class="${className}" x="${px(x)}" y="${px(y)}" text-anchor="${anchor}">${escapeHtml(content)}</text>`;
}

function gridLines(ticks, y, left, right, tickFormat) {
  return ticks
    .map((tick) => `<line class="${tick === 0 ? 'axis' : 'grid'}" x1="${left}" x2="${right}" y1="${px(y(tick))}" y2="${px(y(tick))}"/>${text(left - 8, y(tick) + 4, tickFormat(tick), 'tick', 'end')}`)
    .join('');
}

// A bar whose data end has 3px rounded corners and whose baseline end is square.
function barPath(x, y, width, height, growsUp = true) {
  const r = Math.min(3, width / 2, height);
  if (growsUp) {
    return `M${px(x)},${px(y + height)}V${px(y + r)}Q${px(x)},${px(y)} ${px(x + r)},${px(y)}H${px(x + width - r)}Q${px(x + width)},${px(y)} ${px(x + width)},${px(y + r)}V${px(y + height)}Z`;
  }
  return `M${px(x)},${px(y)}V${px(y + height - r)}Q${px(x)},${px(y + height)} ${px(x + r)},${px(y + height)}H${px(x + width - r)}Q${px(x + width)},${px(y + height)} ${px(x + width)},${px(y + height - r)}V${px(y)}Z`;
}

function horizontalBarPath(x, y, width, height) {
  const r = Math.min(3, height / 2, width);
  return `M${px(x)},${px(y)}H${px(x + width - r)}Q${px(x + width)},${px(y)} ${px(x + width)},${px(y + r)}V${px(y + height - r)}Q${px(x + width)},${px(y + height)} ${px(x + width - r)},${px(y + height)}H${px(x)}Z`;
}

// ---- Line chart ----------------------------------------------------------------------------------------------------

// Where a point's value label goes so the line does not cross it: above a peak, below a valley, above-left on a
// rise and above-right on a fall. The last point is labelled to its right.
function pointLabel(points, i, x, y, format) {
  const p = points[i];
  const px0 = x(p.year);
  const py0 = y(p.value);
  if (i === points.length - 1) return text(px0 + 10, py0 + 5, format(p.value), 'value value-strong', 'start');
  if (i === 0) return text(px0, py0 - 12, format(p.value), 'value');
  const before = points[i - 1].value;
  const after = points[i + 1].value;
  if (p.value >= before && p.value >= after) return text(px0, py0 - 12, format(p.value), 'value');
  if (p.value <= before && p.value <= after) return text(px0, py0 + 21, format(p.value), 'value');
  return before < p.value ? text(px0 - 7, py0 - 8, format(p.value), 'value', 'end') : text(px0 + 7, py0 - 8, format(p.value), 'value', 'start');
}

// A line over years with a y axis, a year axis, and direct value labels on the first and last points (all points
// when labelAll is set). The latest point is drawn in the accent colour.
export function lineChart(points, { width = 600, height = 260, label = '', format = (v) => formatNumber(v, 1), tickFormat = format, zero = false, labelAll = false } = {}) {
  const margin = { top: 28, right: 64, bottom: 30, left: 56 };
  const values = points.map((p) => p.value);
  const ticks = niceTicks(zero ? Math.min(0, ...values) : Math.min(...values), Math.max(...values), 4);
  const x = linearScale([points[0].year, points[points.length - 1].year], [margin.left + 30, width - margin.right]);
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [height - margin.bottom, margin.top]);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${px(x(p.year))},${px(y(p.value))}`).join('');
  const marks = points
    .map((p, i) => {
      const isLast = i === points.length - 1;
      const showLabel = labelAll || i === 0 || isLast;
      return `<g><title>${escapeHtml(`${p.year}: ${format(p.value)}`)}</title><circle class="${isLast ? 'dot-accent' : 'dot'}" cx="${px(x(p.year))}" cy="${px(y(p.value))}" r="${isLast ? 5.5 : 4}"/>${showLabel ? pointLabel(points, i, x, y, format) : ''}${text(x(p.year), height - 8, p.year)}</g>`;
    })
    .join('');
  return `${svgOpen(width, height, label)}${gridLines(ticks, y, margin.left, width - margin.right + 40, tickFormat)}<path class="line" d="${path}"/>${marks}</svg>`;
}

// ---- Column chart --------------------------------------------------------------------------------------------------

// Vertical bars from a zero baseline, negatives drawn downward, each with its value at the bar end. Bars for which
// highlight(point, index) is true are drawn in the accent colour.
export function barChart(points, { width = 600, height = 260, label = '', format = (v) => formatNumber(v, 1), tickFormat = format, highlight = () => false } = {}) {
  const margin = { top: 28, right: 12, bottom: 30, left: 56 };
  const values = points.map((p) => p.value);
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 4);
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [height - margin.bottom, margin.top]);
  const band = bandScale(points.length, [margin.left + 4, width - margin.right]);
  const bars = points
    .map((p, i) => {
      const x = band.barStart(i);
      const growsUp = p.value >= 0;
      const top = y(Math.max(p.value, 0));
      const barHeight = Math.max(1, Math.abs(y(p.value) - y(0)));
      const valueY = growsUp ? top - 8 : top + barHeight + 17;
      const name = p.label ?? p.year;
      return `<g><title>${escapeHtml(`${name}: ${format(p.value)}`)}</title><path class="${highlight(p, i) ? 'mark-accent' : 'mark'}" d="${barPath(x, top, band.barWidth, barHeight, growsUp)}"/>${text(x + band.barWidth / 2, valueY, format(p.value), 'value')}${text(x + band.barWidth / 2, height - 8, name)}</g>`;
    })
    .join('');
  return `${svgOpen(width, height, label)}${gridLines(ticks, y, margin.left, width - margin.right, tickFormat)}${bars}<line class="axis" x1="${margin.left}" x2="${width - margin.right}" y1="${px(y(0))}" y2="${px(y(0))}"/></svg>`;
}

// ---- Ranked horizontal bars ----------------------------------------------------------------------------------------

// One row per item, largest first as given, label on the left and value at the bar end. With a `domain` whose
// minimum is above zero the rows are drawn as dots on a shared scale instead of bars, since a bar must start at zero.
// `reference` ({ value, label }) draws a dashed vertical line, e.g. the national figure; `highlight(row)` picks rows for the accent.
export function rankedBars(rows, { width = 600, label = '', format = (v) => formatNumber(v, 1), highlight = () => false, reference = null, labelWidth = 170, domain = null, rowHeight = 26, axis = false } = {}) {
  const top = reference ? 26 : 6;
  const valueWidth = 58;
  const asDots = domain && domain[0] > 0;
  const max = Math.max(...rows.map((r) => r.value), reference ? reference.value : 0);
  const x = linearScale(domain ?? [0, max], [labelWidth, width - valueWidth]);
  // A graded x axis along the bottom, so a reader can measure a bar instead of only comparing lengths.
  const axisTicks = axis && !asDots ? niceTicks(0, domain ? domain[1] : max, 4) : [];
  const axisBand = axisTicks.length ? 22 : 4;
  const height = top + rows.length * rowHeight + axisBand;
  const marks = rows
    .map((row, i) => {
      const rowY = top + i * rowHeight;
      const barY = rowY + rowHeight * 0.18;
      const barHeight = rowHeight * 0.64;
      const cls = highlight(row) ? 'mark-accent' : 'mark';
      const end = x(row.value);
      const mark = asDots
        ? `<line class="grid" x1="${labelWidth}" x2="${width - valueWidth}" y1="${px(rowY + rowHeight / 2)}" y2="${px(rowY + rowHeight / 2)}"/><circle class="${cls}" cx="${px(end)}" cy="${px(rowY + rowHeight / 2)}" r="5.5"/>`
        : `<path class="${cls}" d="${horizontalBarPath(labelWidth, barY, Math.max(1, end - labelWidth), barHeight)}"/>`;
      const name = row.href ? `<a href="${escapeHtml(row.href)}">${text(labelWidth - 10, rowY + rowHeight / 2 + 4.5, row.label, highlight(row) ? 'label label-strong' : 'label', 'end')}</a>` : text(labelWidth - 10, rowY + rowHeight / 2 + 4.5, row.label, highlight(row) ? 'label label-strong' : 'label', 'end');
      return `<g><title>${escapeHtml(`${row.label}: ${format(row.value)}`)}</title>${mark}${name}${text(end + (asDots ? 10 : 6), rowY + rowHeight / 2 + 4.5, format(row.value), 'value', 'start')}</g>`;
    })
    .join('');
  const referenceLine = reference
    ? `<line class="reference" x1="${px(x(reference.value))}" x2="${px(x(reference.value))}" y1="18" y2="${height}"/>${text(x(reference.value), 13, reference.label, 'tick tick-strong')}`
    : '';
  const axisMarks = axisTicks.length
    ? axisTicks
        .filter((tick) => tick > 0)
        .map((tick) => `<line class="grid" x1="${px(x(tick))}" x2="${px(x(tick))}" y1="${top - 2}" y2="${height - 18}"/>${text(x(tick), height - 5, format(tick), 'tick')}`)
        .join('') + `<line class="axis" x1="${labelWidth}" x2="${width - valueWidth}" y1="${height - 18}" y2="${height - 18}"/>`
    : '';
  return `${svgOpen(width, height, label)}${axisMarks}${referenceLine}${asDots ? '' : `<line class="axis" x1="${labelWidth}" x2="${labelWidth}" y1="${top}" y2="${height - 18}"/>`}${marks}</svg>`;
}

// ---- Grouped columns -----------------------------------------------------------------------------------------------

// Side-by-side columns for a few measures within each group (e.g. exports and imports per year), each column
// labelled directly with its value above and its measure name below, so no legend is needed.
export function groupedBars(groups, keys, { width = 600, height = 260, label = '', format = (v) => formatNumber(v, 1) } = {}) {
  const margin = { top: 28, right: 12, bottom: 48, left: 12 };
  const max = Math.max(...groups.flatMap((g) => keys.map((k) => g[k.key])));
  const y = linearScale([0, max], [height - margin.bottom, margin.top]);
  const groupBand = bandScale(groups.length, [margin.left, width - margin.right], 0.2);
  const columns = groups
    .map((group, gi) => {
      const inner = bandScale(keys.length, [groupBand.barStart(gi), groupBand.barStart(gi) + groupBand.barWidth], 0.18);
      const bars = keys
        .map((key, ki) => {
          const x = inner.barStart(ki);
          const top = y(group[key.key]);
          return `<g><title>${escapeHtml(`${key.label} ${group.label}: ${format(group[key.key])}`)}</title><path class="${key.className}" d="${barPath(x, top, inner.barWidth, y(0) - top)}"/>${text(x + inner.barWidth / 2, top - 8, format(group[key.key]), 'value')}${text(x + inner.barWidth / 2, y(0) + 16, key.label, 'tick')}</g>`;
        })
        .join('');
      return `${bars}${text(groupBand.barStart(gi) + groupBand.barWidth / 2, height - 6, group.label, 'tick tick-strong')}`;
    })
    .join('');
  return `${svgOpen(width, height, label)}<line class="axis" x1="${margin.left}" x2="${width - margin.right}" y1="${px(y(0))}" y2="${px(y(0))}"/>${columns}</svg>`;
}

// ---- Share bar -----------------------------------------------------------------------------------------------------

// One 100% bar split into parts, each labelled above with its name and share.
export function shareBar(parts, { width = 600, label = '', format = (v) => `${formatNumber(v, 1)}%` } = {}) {
  const height = 62;
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const x = linearScale([0, total], [0, width]);
  let offset = 0;
  const segments = parts
    .map((part, i) => {
      const start = x(offset);
      const segmentWidth = x(offset + part.value) - start - (i < parts.length - 1 ? 2 : 0);
      offset += part.value;
      const anchor = i === 0 ? 'start' : i === parts.length - 1 ? 'end' : 'middle';
      const labelX = anchor === 'start' ? start : anchor === 'end' ? start + segmentWidth : start + segmentWidth / 2;
      return `<g><title>${escapeHtml(`${part.label}: ${format(part.value)}`)}</title><rect class="${part.className ?? 'mark'}" x="${px(start)}" y="30" width="${px(segmentWidth)}" height="24" rx="3"/>${text(labelX, 20, `${part.label} ${format(part.value)}`, 'value', anchor)}</g>`;
    })
    .join('');
  return `${svgOpen(width, height, label)}${segments}</svg>`;
}

// ---- Small multiples -----------------------------------------------------------------------------------------------

// A compact trend line with the first and last years marked; the latest point is in the accent colour.
export function sparkline(points, { width = 160, height = 58, label = '' } = {}) {
  const values = points.map((p) => p.value);
  const x = linearScale([points[0].year, points[points.length - 1].year], [5, width - 6]);
  const y = linearScale([Math.min(...values), Math.max(...values)], [height - 22, 6]);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${px(x(p.year))},${px(y(p.value))}`).join('');
  const last = points[points.length - 1];
  return `${svgOpen(width, height, label)}<line class="grid" x1="0" x2="${width}" y1="${height - 16}" y2="${height - 16}"/><path class="line" d="${path}"/><circle class="dot-accent" cx="${px(x(last.year))}" cy="${px(y(last.value))}" r="4"/>${text(2, height - 2, points[0].year, 'tick', 'start')}${text(width - 2, height - 2, last.year, 'tick', 'end')}</svg>`;
}

// A strip of panels sharing one layout: name, latest value, sparkline, then a footer line (change and source).
export function smallMultiples(panels, { sparkWidth = 160 } = {}) {
  const cells = panels
    .map(
      (panel) => `<a class="multiple" href="${escapeHtml(panel.href)}">
  <span class="multiple-name">${escapeHtml(panel.name)}</span>
  <span class="multiple-value">${panel.value}<small>${escapeHtml(panel.unit)}</small></span>
  ${sparkline(panel.points, { width: sparkWidth, label: `${panel.name}, ${panel.points[0].year} to ${panel.points[panel.points.length - 1].year}` })}
  <span class="multiple-foot">${panel.foot}</span>
</a>`,
    )
    .join('');
  return `<div class="multiples">${cells}</div>`;
}
