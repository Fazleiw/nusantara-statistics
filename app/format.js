// Number formatting and source citations, shared by every view and the chart module. Figures use en-GB grouping
// (12,345.6), a true minus sign for negatives, and a citation in the form "BPS, 2024".

const formatters = new Map();

function formatterFor(digits) {
  if (!formatters.has(digits)) {
    formatters.set(digits, new Intl.NumberFormat('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits }));
  }
  return formatters.get(digits);
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function formatNumber(value, digits = 0) {
  const text = formatterFor(digits).format(Math.abs(value));
  return value < 0 ? `−${text}` : text;
}

export function formatPercent(value, digits = 1) {
  return `${formatNumber(value, digits)}%`;
}

export function formatSigned(value, digits = 1, suffix = '') {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return `${sign}${formatterFor(digits).format(Math.abs(value))}${suffix}`;
}

// The first and last year of a series, e.g. "2020–2024".
export function yearSpan(points) {
  const first = points[0].year;
  const last = points[points.length - 1].year;
  return first === last ? String(first) : `${first}–${last}`;
}

export function latestPoint(series) {
  return series.points[series.points.length - 1];
}

export function previousPoint(series) {
  return series.points[series.points.length - 2];
}

// An inline citation that sits beside or under a figure.
export function cite(source, year) {
  return `<span class="cite">${escapeHtml(source)}, ${escapeHtml(year)}</span>`;
}

export function citeSeries(series) {
  return cite(series.source, yearSpan(series.points));
}
