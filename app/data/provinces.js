// Indonesia's 38 provinces, one row each: population (2023 estimate, thousands), HDI (2024) and poverty rate (2024, %).
// The six Papua provinces were redrawn in 2022, so their figures are marked as 2023 estimates (BPS's own term, estimasi).

const BPS = 'BPS';
const PAPUA = 'BPS estimate, 2023';

export const provinceYears = { population: 2023, hdi: 2024, poverty: 2024 };

export const islandGroups = ['Sumatra', 'Java', 'Bali & Nusa Tenggara', 'Kalimantan', 'Sulawesi', 'Maluku', 'Papua'];

export const provinces = [
  { slug: 'aceh', name: 'Aceh', island: 'Sumatra', capital: 'Banda Aceh', population: 5474, hdi: 74.5, poverty: 14.2, source: BPS },
  { slug: 'sumatera-utara', name: 'Sumatera Utara', island: 'Sumatra', capital: 'Medan', population: 15386, hdi: 75.0, poverty: 7.9, source: BPS },
  { slug: 'sumatera-barat', name: 'Sumatera Barat', island: 'Sumatra', capital: 'Padang', population: 5737, hdi: 76.0, poverty: 6.4, source: BPS },
  { slug: 'riau', name: 'Riau', island: 'Sumatra', capital: 'Pekanbaru', population: 6642, hdi: 74.8, poverty: 6.7, source: BPS },
  { slug: 'jambi', name: 'Jambi', island: 'Sumatra', capital: 'Jambi', population: 3679, hdi: 73.4, poverty: 7.5, source: BPS },
  { slug: 'sumatera-selatan', name: 'Sumatera Selatan', island: 'Sumatra', capital: 'Palembang', population: 8657, hdi: 73.4, poverty: 10.3, source: BPS },
  { slug: 'bengkulu', name: 'Bengkulu', island: 'Sumatra', capital: 'Bengkulu', population: 2086, hdi: 72.6, poverty: 13.6, source: BPS },
  { slug: 'lampung', name: 'Lampung', island: 'Sumatra', capital: 'Bandar Lampung', population: 9313, hdi: 71.4, poverty: 11.5, source: BPS },
  { slug: 'kepulauan-bangka-belitung', name: 'Kepulauan Bangka Belitung', island: 'Sumatra', capital: 'Pangkalpinang', population: 1511, hdi: 73.0, poverty: 4.6, source: BPS },
  { slug: 'kepulauan-riau', name: 'Kepulauan Riau', island: 'Sumatra', capital: 'Tanjungpinang', population: 2221, hdi: 77.5, poverty: 5.9, source: BPS },
  { slug: 'dki-jakarta', name: 'DKI Jakarta', island: 'Java', capital: 'Jakarta', population: 10672, hdi: 83.6, poverty: 4.0, source: BPS },
  { slug: 'jawa-barat', name: 'Jawa Barat', island: 'Java', capital: 'Bandung', population: 50345, hdi: 74.5, poverty: 7.2, source: BPS },
  { slug: 'jawa-tengah', name: 'Jawa Tengah', island: 'Java', capital: 'Semarang', population: 37541, hdi: 74.0, poverty: 10.2, source: BPS },
  { slug: 'di-yogyakarta', name: 'DI Yogyakarta', island: 'Java', capital: 'Yogyakarta', population: 3738, hdi: 80.8, poverty: 10.4, source: BPS },
  { slug: 'jawa-timur', name: 'Jawa Timur', island: 'Java', capital: 'Surabaya', population: 41527, hdi: 73.5, poverty: 9.8, source: BPS },
  { slug: 'banten', name: 'Banten', island: 'Java', capital: 'Serang', population: 12307, hdi: 75.4, poverty: 5.9, source: BPS },
  { slug: 'bali', name: 'Bali', island: 'Bali & Nusa Tenggara', capital: 'Denpasar', population: 4405, hdi: 78.0, poverty: 4.0, source: BPS },
  { slug: 'nusa-tenggara-barat', name: 'Nusa Tenggara Barat', island: 'Bali & Nusa Tenggara', capital: 'Mataram', population: 5560, hdi: 72.0, poverty: 13.3, source: BPS },
  { slug: 'nusa-tenggara-timur', name: 'Nusa Tenggara Timur', island: 'Bali & Nusa Tenggara', capital: 'Kupang', population: 5571, hdi: 68.6, poverty: 19.5, source: BPS },
  { slug: 'kalimantan-barat', name: 'Kalimantan Barat', island: 'Kalimantan', capital: 'Pontianak', population: 5623, hdi: 71.0, poverty: 7.4, source: BPS },
  { slug: 'kalimantan-tengah', name: 'Kalimantan Tengah', island: 'Kalimantan', capital: 'Palangka Raya', population: 2741, hdi: 72.3, poverty: 5.0, source: BPS },
  { slug: 'kalimantan-selatan', name: 'Kalimantan Selatan', island: 'Kalimantan', capital: 'Banjarbaru', population: 4222, hdi: 73.5, poverty: 4.4, source: BPS },
  { slug: 'kalimantan-timur', name: 'Kalimantan Timur', island: 'Kalimantan', capital: 'Samarinda', population: 3909, hdi: 78.0, poverty: 5.5, source: BPS },
  { slug: 'kalimantan-utara', name: 'Kalimantan Utara', island: 'Kalimantan', capital: 'Tanjung Selor', population: 746, hdi: 72.8, poverty: 6.6, source: BPS },
  { slug: 'sulawesi-utara', name: 'Sulawesi Utara', island: 'Sulawesi', capital: 'Manado', population: 2659, hdi: 75.4, poverty: 7.3, source: BPS },
  { slug: 'sulawesi-tengah', name: 'Sulawesi Tengah', island: 'Sulawesi', capital: 'Palu', population: 3086, hdi: 71.5, poverty: 12.4, source: BPS },
  { slug: 'sulawesi-selatan', name: 'Sulawesi Selatan', island: 'Sulawesi', capital: 'Makassar', population: 9342, hdi: 74.5, poverty: 8.0, source: BPS },
  { slug: 'sulawesi-tenggara', name: 'Sulawesi Tenggara', island: 'Sulawesi', capital: 'Kendari', population: 2764, hdi: 72.4, poverty: 11.3, source: BPS },
  { slug: 'gorontalo', name: 'Gorontalo', island: 'Sulawesi', capital: 'Gorontalo', population: 1213, hdi: 71.0, poverty: 15.1, source: BPS },
  { slug: 'sulawesi-barat', name: 'Sulawesi Barat', island: 'Sulawesi', capital: 'Mamuju', population: 1459, hdi: 69.5, poverty: 11.7, source: BPS },
  { slug: 'maluku', name: 'Maluku', island: 'Maluku', capital: 'Ambon', population: 1915, hdi: 72.0, poverty: 16.4, source: BPS },
  { slug: 'maluku-utara', name: 'Maluku Utara', island: 'Maluku', capital: 'Sofifi', population: 1337, hdi: 71.5, poverty: 6.6, source: BPS },
  { slug: 'papua', name: 'Papua', island: 'Papua', capital: 'Jayapura', population: 1047, hdi: 66.5, poverty: 26.0, source: PAPUA },
  { slug: 'papua-barat', name: 'Papua Barat', island: 'Papua', capital: 'Manokwari', population: 569, hdi: 68.0, poverty: 21.5, source: PAPUA },
  { slug: 'papua-selatan', name: 'Papua Selatan', island: 'Papua', capital: 'Merauke', population: 537, hdi: 65.0, poverty: 27.5, source: PAPUA },
  { slug: 'papua-tengah', name: 'Papua Tengah', island: 'Papua', capital: 'Nabire', population: 1452, hdi: 63.0, poverty: 30.1, source: PAPUA },
  { slug: 'papua-pegunungan', name: 'Papua Pegunungan', island: 'Papua', capital: 'Wamena', population: 1467, hdi: 58.5, poverty: 33.0, source: PAPUA },
  { slug: 'papua-barat-daya', name: 'Papua Barat Daya', island: 'Papua', capital: 'Sorong', population: 630, hdi: 65.5, poverty: 24.0, source: PAPUA },
];
