import { CostResult, Layer, Material, ThermalResult } from '../types';
import { RSI, RSE } from '../constants';

export function calculateThermalProperties(
  layers: Layer[],
  materials: Material[]
): ThermalResult {
  const warnings: string[] = [];

  if (layers.length === 0) {
    return {
      u: 0,
      r: 0,
      warnings: ['Brak warstw do obliczenia'],
    };
  }

  let totalR = RSI + RSE;

  for (const layer of layers) {
    const material = materials.find((m) => m.id === layer.materialId);

    if (!material) {
      warnings.push(`Materiał nie znaleziony dla warstwy`);
      continue;
    }

    if (material.lambda <= 0) {
      warnings.push(`${material.name}: λ musi być > 0`);
      continue;
    }

    if (material.lambda < 0.02) {
      warnings.push(`${material.name}: λ = ${material.lambda} jest niezwykle niskie`);
    }

    if (material.lambda > 3.0) {
      warnings.push(`${material.name}: λ = ${material.lambda} jest bardzo wysokie`);
    }

    if (layer.thickness < 0) {
      warnings.push(`${material.name}: grubość nie może być ujemna`);
      continue;
    }

    const thicknessInMeters = layer.thickness / 1000;
    const layerR = thicknessInMeters / material.lambda;
    totalR += layerR;
  }

  const u = totalR > 0 ? 1 / totalR : 0;

  return {
    u: parseFloat(u.toFixed(4)),
    r: parseFloat(totalR.toFixed(4)),
    warnings,
  };
}

export function calculateCost(
  layers: Layer[],
  materials: Material[],
  area: number
): CostResult {
  const warnings: string[] = [];
  const perLayer: Record<string, number> = {};

  if (area <= 0) {
    warnings.push('Podaj powierzchnię większą od zera, aby obliczyć koszt.');
    return {
      totalCost: 0,
      perLayer,
      warnings,
    };
  }

  let totalCost = 0;

  for (const layer of layers) {
    const material = materials.find((m) => m.id === layer.materialId);

    if (!material) {
      const message = 'Materiały: brak danych dla jednej z warstw (koszt pominięty).';
      if (!warnings.includes(message)) {
        warnings.push(message);
      }
      perLayer[layer.id] = 0;
      continue;
    }

    const thicknessInMeters = Math.max(0, layer.thickness) / 1000;
    const volume = area * thicknessInMeters;
    const unitCost = material.costPerM3 ?? 0;

    if (unitCost <= 0) {
      const message = `${material.name}: brak ustawionej ceny materiału (koszt pominięty).`;
      if (!warnings.includes(message)) {
        warnings.push(message);
      }
    }

    const layerCost = unitCost > 0 ? volume * unitCost : 0;
    perLayer[layer.id] = layerCost;
    totalCost += layerCost;
  }

  return {
    totalCost,
    perLayer,
    warnings,
  };
}
