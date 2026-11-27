// Consumer prices: December year-on-year CPI inflation, CPI group weights, and the Bank Indonesia policy rate.

export const inflation = {
  label: 'CPI inflation, December',
  unit: '% y/y',
  source: 'BPS',
  points: [
    { year: 2020, value: 1.68 },
    { year: 2021, value: 1.87 },
    { year: 2022, value: 5.51 },
    { year: 2023, value: 2.61 },
    { year: 2024, value: 1.57 },
  ],
};

// Approximate weights of the three largest CPI groups, 2023. The remaining groups make up the rest of the basket.
export const cpiWeights = {
  label: 'CPI basket weights',
  unit: '% of basket (approx.)',
  year: 2023,
  source: 'BPS',
  rows: [
    { label: 'Food & beverages', value: 25 },
    { label: 'Housing & utilities', value: 20 },
    { label: 'Transport', value: 12 },
  ],
};

export const policyRate = { value: 6.0, unit: '%', period: 'Dec 2024', year: 2024, source: 'Bank Indonesia', name: 'BI 7-day reverse repo rate' };

