// Every source this site draws on: who publishes it, the years used, what it covers and the pages that cite it.

export const sources = [
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Sensus Penduduk 2020 (Population Census)',
    years: '2020',
    covers: 'Total population count of 270,203,917.',
    pages: ['population', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Statistik Indonesia (Statistical Yearbook)',
    years: '2021–2024',
    covers: 'Mid-year population estimates, growth rate, urbanisation, sex ratio, number of provinces.',
    pages: ['population', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Produk Domestik Bruto (National Accounts)',
    years: '2020–2024',
    covers: 'GDP at current prices, real GDP growth, GDP share by sector (2023).',
    pages: ['economy', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia / World Bank',
    title: 'GDP per capita in US dollars',
    years: '2020–2024',
    covers: 'GDP per person converted to USD.',
    pages: ['economy', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Statistik Perdagangan Luar Negeri (Foreign Trade)',
    years: '2023–2024',
    covers: 'Merchandise exports and imports, USD.',
    pages: ['economy', 'overview'],
  },
  {
    publisher: 'Bank Indonesia',
    title: 'Foreign exchange reserves; BI 7-day reverse repo rate',
    years: 'Dec 2024',
    covers: 'Official reserve assets (USD 155.7B) and the policy rate (6.00%).',
    pages: ['economy', 'prices', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Indeks Harga Konsumen (Consumer Price Index)',
    years: '2020–2024',
    covers: 'December year-on-year inflation; CPI group weights (2023).',
    pages: ['prices', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Susenas – poverty and inequality',
    years: '2020–2024',
    covers: 'September poverty rate, number of poor people, Gini ratio; provincial poverty rates (2024).',
    pages: ['overview', 'regions'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Indeks Pembangunan Manusia (Human Development Index)',
    years: '2020–2024',
    covers: 'National and provincial HDI, life expectancy, mean years of schooling.',
    pages: ['overview', 'regions'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Sakernas (National Labour Force Survey)',
    years: '2020–2024',
    covers: 'Labour force, employment, February unemployment rate, employment by sector (2024).',
    pages: ['labour', 'overview'],
  },
  {
    publisher: 'BPS – Statistics Indonesia',
    title: 'Provincial population estimates',
    years: '2023',
    covers: 'Population of each of the 38 provinces; the six Papua provinces are 2023 estimates (estimasi 2023).',
    pages: ['regions'],
  },
];

// Series a visitor might look for that this release does not hold. Shown so a gap is never mistaken for zero.
export const notCovered = [
  'Population by age group (age pyramid)',
  'Labour force participation rate',
  'GDP growth by sector',
  'Provincial GDP per capita (PDRB per kapita)',
  'Retail food prices by commodity',
];
