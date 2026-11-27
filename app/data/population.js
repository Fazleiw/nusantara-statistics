// Population of Indonesia: the 2020 census count, BPS mid-year estimates since, growth, urbanisation and sex ratio.
// Every value carries the source and year it comes from.

export const census2020 = {
  value: 270203917,
  year: 2020,
  source: 'BPS, Sensus Penduduk',
};

// Millions of people. 2020 is the census count; 2021–2024 are BPS estimates.
export const populationSeries = {
  label: 'Population',
  unit: 'million people',
  source: 'BPS, Sensus Penduduk 2020; Statistik Indonesia',
  points: [
    { year: 2020, value: 270.2, note: 'Census count' },
    { year: 2021, value: 272.68, note: 'Estimate' },
    { year: 2022, value: 275.77, note: 'Estimate' },
    { year: 2023, value: 278.7, note: 'Estimate' },
    { year: 2024, value: 281.6, note: 'Estimate' },
  ],
};

// Annual population growth, percent. No 2020 value is in this release.
export const growthSeries = {
  label: 'Population growth rate',
  unit: '% per year',
  source: 'BPS',
  points: [
    { year: 2021, value: 1.22 },
    { year: 2022, value: 1.13 },
    { year: 2023, value: 1.05 },
    { year: 2024, value: 1.03 },
  ],
};

export const urbanShare = { value: 57.9, year: 2023, unit: '%', source: 'BPS' };
export const sexRatio = { value: 102.0, year: 2023, unit: 'men per 100 women', source: 'BPS' };
export const provinceCount = { value: 38, year: 2023, source: 'BPS' };
