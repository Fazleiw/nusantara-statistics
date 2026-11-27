// Indonesia's economy: GDP at current prices and per person, real growth, the sector mix, trade and reserves.

export const gdpNominal = {
  label: 'GDP at current prices',
  unit: 'IDR trillion',
  source: 'BPS',
  points: [
    { year: 2020, value: 15443.4 },
    { year: 2021, value: 16976.8 },
    { year: 2022, value: 19588.1 },
    { year: 2023, value: 20892.4 },
    { year: 2024, value: 22139.0 },
  ],
};

export const gdpPerCapita = {
  label: 'GDP per capita',
  unit: 'USD',
  source: 'BPS/World Bank',
  points: [
    { year: 2020, value: 3870 },
    { year: 2021, value: 4292 },
    { year: 2022, value: 4788 },
    { year: 2023, value: 4919 },
    { year: 2024, value: 4960 },
  ],
};

export const realGrowth = {
  label: 'Real GDP growth',
  unit: '% y/y',
  source: 'BPS',
  points: [
    { year: 2020, value: -2.07 },
    { year: 2021, value: 3.69 },
    { year: 2022, value: 5.31 },
    { year: 2023, value: 5.05 },
    { year: 2024, value: 5.03 },
  ],
};

// Share of GDP by sector, 2023, percent. The seven listed sectors are not exhaustive.
export const sectorShares = {
  label: 'Share of GDP by sector',
  unit: '% of GDP',
  year: 2023,
  source: 'BPS',
  rows: [
    { label: 'Manufacturing', value: 18.7 },
    { label: 'Wholesale & retail trade', value: 12.8 },
    { label: 'Agriculture, forestry & fishing', value: 12.5 },
    { label: 'Mining & quarrying', value: 10.5 },
    { label: 'Construction', value: 9.9 },
    { label: 'Transport & storage', value: 5.3 },
    { label: 'Information & communication', value: 4.0 },
  ],
};

// Merchandise trade, USD billion.
export const trade = {
  unit: 'USD billion',
  source: 'BPS',
  rows: [
    { year: 2023, exports: 258.82, imports: 221.89 },
    { year: 2024, exports: 264.7, imports: 233.66 },
  ],
};

export const fxReserves = { value: 155.7, unit: 'USD billion', period: 'Dec 2024', year: 2024, source: 'Bank Indonesia' };
