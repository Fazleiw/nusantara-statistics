// Poverty, inequality and human development: the September poverty rate, the number of poor, the Gini ratio, the
// Human Development Index and two of its components.

export const povertyRate = {
  label: 'Poverty rate, September',
  unit: '% of population',
  source: 'BPS',
  points: [
    { year: 2020, value: 10.19 },
    { year: 2021, value: 9.71 },
    { year: 2022, value: 9.57 },
    { year: 2023, value: 9.36 },
    { year: 2024, value: 8.81 },
  ],
};

export const hdi = {
  label: 'Human Development Index',
  unit: 'index, 0–100',
  source: 'BPS',
  points: [
    { year: 2020, value: 71.94 },
    { year: 2021, value: 72.29 },
    { year: 2022, value: 73.77 },
    { year: 2023, value: 74.39 },
    { year: 2024, value: 75.02 },
  ],
};

export const poorPeople = { value: 24.06, unit: 'million people', year: 2024, source: 'BPS' };
export const gini = { value: 0.379, unit: 'Gini ratio', year: 2024, source: 'BPS' };
export const lifeExpectancy = { value: 74.2, unit: 'years', year: 2024, source: 'BPS' };
export const schooling = { value: 8.85, unit: 'mean years of schooling', year: 2024, source: 'BPS' };
