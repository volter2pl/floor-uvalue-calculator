import { Material } from './types';

export const PREDEFINED_MATERIALS: Material[] = [
  {
    id: 'beton-c20',
    name: 'Beton C20/25',
    lambda: 1.70,
    color: '#9E9E9E',
    isPredefined: true,
  },
  {
    id: 'jastrych',
    name: 'Jastrych cementowy',
    lambda: 1.40,
    color: '#BDBDBD',
    isPredefined: true,
  },
  {
    id: 'anhydryt',
    name: 'Anhydryt',
    lambda: 1.20,
    color: '#D7CCC8',
    isPredefined: true,
  },
  {
    id: 'styrobeton',
    name: 'Styrobeton lany',
    lambda: 0.10,
    color: '#E0E0E0',
    isPredefined: true,
  },
  {
    id: 'xps',
    name: 'XPS',
    lambda: 0.034,
    color: '#4FC3F7',
    isPredefined: true,
  },
  {
    id: 'eps70',
    name: 'EPS 70',
    lambda: 0.038,
    color: '#81D4FA',
    isPredefined: true,
  },
  {
    id: 'eps100',
    name: 'EPS 100',
    lambda: 0.036,
    color: '#64B5F6',
    isPredefined: true,
  },
  {
    id: 'eps150',
    name: 'EPS 150',
    lambda: 0.035,
    color: '#42A5F5',
    isPredefined: true,
  },
  {
    id: 'eps200',
    name: 'EPS 200',
    lambda: 0.034,
    color: '#2196F3',
    isPredefined: true,
  },
  {
    id: 'pir',
    name: 'PIR',
    lambda: 0.022,
    color: '#FFD54F',
    isPredefined: true,
  },
  {
    id: 'welna',
    name: 'Wełna mineralna',
    lambda: 0.037,
    color: '#FFEB3B',
    isPredefined: true,
  },
  {
    id: 'osb3',
    name: 'OSB 3',
    lambda: 0.13,
    color: '#A1887F',
    isPredefined: true,
  },
  {
    id: 'plytki',
    name: 'Płytki gresowe',
    lambda: 1.30,
    color: '#90A4AE',
    isPredefined: true,
  },
  {
    id: 'panel',
    name: 'Panel laminat/winyl',
    lambda: 0.20,
    color: '#8D6E63',
    isPredefined: true,
  },
  {
    id: 'folia-pe',
    name: 'Folia PE',
    lambda: 0.33,
    color: '#E1F5FE',
    isPredefined: true,
  },
];

export const RSI = 0.17;
export const RSE = 0.00;
