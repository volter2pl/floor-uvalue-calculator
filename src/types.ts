export interface Material {
  id: string;
  name: string;
  lambda: number;
  color: string;
  isPredefined: boolean;
  costPerM3: number;
}

export interface Layer {
  id: string;
  materialId: string;
  thickness: number;
}

export interface Scheme {
  id: string;
  name: string;
  layers: Layer[];
  area: number;
}

export interface ThermalResult {
  u: number;
  r: number;
  warnings: string[];
}

export interface CostResult {
  totalCost: number;
  perLayer: Record<string, number>;
  warnings: string[];
}
