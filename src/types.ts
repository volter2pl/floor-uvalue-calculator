export interface Material {
  id: string;
  name: string;
  lambda: number;
  color: string;
  isPredefined: boolean;
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
}

export interface ThermalResult {
  u: number;
  r: number;
  warnings: string[];
}
