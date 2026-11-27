// The labour market: labour force and employment from Sakernas, the February unemployment rate, jobs by sector.

export const labourForce = { value: 152.1, unit: 'million people', year: 2024, source: 'BPS, Sakernas' };
export const employed = { value: 144.6, unit: 'million people', year: 2024, source: 'BPS, Sakernas' };

export const unemploymentRate = {
  label: 'Open unemployment rate, February',
  unit: '% of labour force',
  source: 'BPS, Sakernas',
  points: [
    { year: 2020, value: 4.99 },
    { year: 2021, value: 6.26 },
    { year: 2022, value: 5.83 },
    { year: 2023, value: 5.45 },
    { year: 2024, value: 4.82 },
  ],
};

// Share of employed people by main sector, 2024. The five listed sectors are not exhaustive.
export const employmentBySector = {
  label: 'Employment by sector',
  unit: '% of employed',
  year: 2024,
  source: 'BPS, Sakernas',
  rows: [
    { label: 'Agriculture', value: 28.2 },
    { label: 'Trade', value: 19.0 },
    { label: 'Services', value: 17.5 },
    { label: 'Manufacturing', value: 13.6 },
    { label: 'Construction', value: 6.4 },
  ],
};
