import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Scheme, Material, Layer } from '../types';
import { calculateThermalProperties, calculateCost } from '../utils/calculations';
import { useState, useEffect, useRef, Fragment } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const MIN_LAYER_THICKNESS = 1;
const PIXELS_PER_MM = 1;
const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface SchemeCardProps {
  scheme: Scheme;
  materials: Material[];
  onUpdateScheme: (scheme: Scheme) => void;
  onDeleteScheme: () => void;
}

export function SchemeCard({ scheme, materials, onUpdateScheme, onDeleteScheme }: SchemeCardProps) {
  const [showUnit, setShowUnit] = useState<'u' | 'r'>('u');
  const [dragState, setDragState] = useState<{
    index: number;
    pointerId: number;
    startY: number;
    initialTopThickness: number;
    initialBottomThickness: number;
  } | null>(null);
  const lastDeltaRef = useRef<number | null>(null);
  const formatCurrency = (value: number) => currencyFormatter.format(value);
  const area = typeof scheme.area === 'number' ? scheme.area : 0;
  const formattedArea = Number.isFinite(area)
    ? Math.max(0, area).toLocaleString('pl-PL', { maximumFractionDigits: 2 })
    : '0';
  const [areaInput, setAreaInput] = useState(() => area.toString());
  const previousAreaRef = useRef(area);

  const thermalResult = calculateThermalProperties(scheme.layers, materials);
  const costResult = calculateCost(scheme.layers, materials, area);
  const warnings = [...thermalResult.warnings, ...costResult.warnings];

  const addLayer = () => {
    const defaultMaterial = materials[0];
    if (!defaultMaterial) return;

    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      materialId: defaultMaterial.id,
      thickness: 100,
    };

    onUpdateScheme({
      ...scheme,
      layers: [...scheme.layers, newLayer],
    });
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    onUpdateScheme({
      ...scheme,
      layers: scheme.layers.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      ),
    });
  };

  const deleteLayer = (layerId: string) => {
    onUpdateScheme({
      ...scheme,
      layers: scheme.layers.filter((layer) => layer.id !== layerId),
    });
  };

  const updateSchemeName = (name: string) => {
    onUpdateScheme({ ...scheme, name });
  };

  const updateArea = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    onUpdateScheme({ ...scheme, area: safeValue });
  };

  const handleAreaChange = (rawValue: string) => {
    setAreaInput(rawValue);

    const normalizedValue = rawValue.replace(',', '.');
    const trimmedValue = normalizedValue.trim();

    if (trimmedValue === '') {
      updateArea(0);
      return;
    }

    if (/[.,]$/.test(trimmedValue)) {
      return;
    }

    const numericValue = Number(trimmedValue);

    if (!Number.isNaN(numericValue)) {
      updateArea(numericValue);
    }
  };

  const getTotalHeight = () => {
    return scheme.layers.reduce((sum, layer) => sum + layer.thickness, 0);
  };

  const totalHeight = getTotalHeight();

  const handleDividerPointerDown = (event: ReactPointerEvent<HTMLDivElement>, index: number) => {
    const topLayer = scheme.layers[index];
    const bottomLayer = scheme.layers[index + 1];

    if (!topLayer || !bottomLayer) return;

    event.preventDefault();
    event.stopPropagation();

    lastDeltaRef.current = 0;

    setDragState({
      index,
      pointerId: event.pointerId,
      startY: event.clientY,
      initialTopThickness: topLayer.thickness,
      initialBottomThickness: bottomLayer.thickness,
    });
  };

  useEffect(() => {
    if (previousAreaRef.current !== area) {
      setAreaInput(area.toString());
      previousAreaRef.current = area;
    }
  }, [area]);

  useEffect(() => {
    if (!dragState) {
      document.body.style.userSelect = '';
      return;
    }

    document.body.style.userSelect = 'none';

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;

      const deltaPx = event.clientY - dragState.startY;
      const deltaMm = Math.round(deltaPx / PIXELS_PER_MM);

      const maxIncreaseTop = Math.max(0, dragState.initialBottomThickness - MIN_LAYER_THICKNESS);
      const maxDecreaseTop = Math.max(0, dragState.initialTopThickness - MIN_LAYER_THICKNESS);

      const clampedDelta = Math.max(-maxDecreaseTop, Math.min(deltaMm, maxIncreaseTop));

      if (lastDeltaRef.current === clampedDelta) return;
      lastDeltaRef.current = clampedDelta;

      const newTopThickness = Math.round(dragState.initialTopThickness + clampedDelta);
      const newBottomThickness = Math.round(dragState.initialBottomThickness - clampedDelta);

      const updatedLayers = scheme.layers.map((layer, idx) => {
        if (idx === dragState.index) {
          return { ...layer, thickness: Math.max(MIN_LAYER_THICKNESS, newTopThickness) };
        }

        if (idx === dragState.index + 1) {
          return { ...layer, thickness: Math.max(MIN_LAYER_THICKNESS, newBottomThickness) };
        }

        return layer;
      });

      onUpdateScheme({
        ...scheme,
        layers: updatedLayers,
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;
      setDragState(null);
      lastDeltaRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.userSelect = '';
    };
  }, [dragState, onUpdateScheme, scheme]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col min-w-[320px] max-w-[400px]">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={scheme.name}
          onChange={(e) => updateSchemeName(e.target.value)}
          className="text-lg font-semibold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors px-1 -ml-1 flex-1"
        />
        <button
          onClick={onDeleteScheme}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
          title="Usuń schemat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Powierzchnia podłogi [m²]</label>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={areaInput}
          onChange={(e) => handleAreaChange(e.target.value)}
          onBlur={() => {
            const normalizedValue = areaInput.replace(',', '.').trim();
            if (normalizedValue === '') {
              setAreaInput('0');
              updateArea(0);
              return;
            }

            const numericValue = Number(normalizedValue);

            if (!Number.isNaN(numericValue)) {
              updateArea(numericValue);
              setAreaInput(numericValue.toString());
            } else {
              setAreaInput(area.toString());
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="np. 45"
        />
      </div>

      <div className="flex-1 mb-4">
        <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-gray-300 p-4 min-h-[400px] flex flex-col justify-end">
          {scheme.layers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Brak warstw
            </div>
          ) : (
            <div className="flex flex-col">
              {scheme.layers.map((layer, index) => {
                const material = materials.find((m) => m.id === layer.materialId);
                const heightPercent = totalHeight > 0 ? (layer.thickness / totalHeight) * 100 : 0;
                const minHeight = 30;
                const displayHeight = Math.max(minHeight, (heightPercent / 100) * 300);

                return (
                  <Fragment key={layer.id}>
                    <div
                      className="rounded border-2 border-gray-400 overflow-hidden shadow-sm"
                      style={{
                        backgroundColor: material?.color || '#ccc',
                        height: `${displayHeight}px`,
                        minHeight: `${minHeight}px`,
                      }}
                    >
                      <div className="h-full flex items-center justify-center px-2">
                        <div className="text-xs font-medium text-gray-800 text-center drop-shadow-sm truncate">
                          {material?.name || 'Nieznany'} ({layer.thickness} mm)
                        </div>
                      </div>
                    </div>
                    {index < scheme.layers.length - 1 && (
                      <div
                        className="h-3 flex items-center justify-center cursor-row-resize select-none"
                        onPointerDown={(event) => handleDividerPointerDown(event, index)}
                        title="Przeciągnij aby zmienić grubości warstw"
                      >
                        <div className="w-full h-1 bg-blue-500/60 rounded transition-colors hover:bg-blue-600" />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
        {scheme.layers.map((layer, index) => {
          const material = materials.find((m) => m.id === layer.materialId);
          return (
            <div
              key={layer.id}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div
                className="w-6 h-6 rounded flex-shrink-0 border border-gray-300"
                style={{ backgroundColor: material?.color || '#ccc' }}
              />
              <div className="flex-1 space-y-2">
                <select
                  value={layer.materialId}
                  onChange={(e) => updateLayer(layer.id, { materialId: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={layer.thickness}
                  onChange={(e) => {
                    const nextValue = Math.max(0, parseFloat(e.target.value) || 0);
                    updateLayer(layer.id, { thickness: nextValue });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Grubość (mm)"
                  min="0"
                  step="1"
                />
                {area > 0 && (
                  <div className="text-xs text-gray-500">
                    Koszt: {material && (material.costPerM3 ?? 0) > 0
                      ? formatCurrency(costResult.perLayer[layer.id] ?? 0)
                      : 'brak ceny'}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteLayer(layer.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Usuń warstwę"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addLayer}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-4"
      >
        <Plus size={18} />
        Dodaj warstwę
      </button>

      <div className="border-t-2 border-gray-200 pt-4">
        <button
          onClick={() => setShowUnit(showUnit === 'u' ? 'r' : 'u')}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
            {showUnit === 'u' ? (
              <div>
                <div className="text-sm text-gray-600 mb-1">Współczynnik przenikania ciepła</div>
                <div className="text-3xl font-bold text-gray-800">
                  {thermalResult.u.toFixed(4)} <span className="text-lg">W/m²K</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-1">Opór cieplny</div>
                <div className="text-3xl font-bold text-gray-800">
                  {thermalResult.r.toFixed(4)} <span className="text-lg">m²K/W</span>
                </div>
              </div>
            )}
          </div>
        </button>

        <div className="mt-3 bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border-2 border-green-200">
          <div className="text-sm text-gray-600 mb-1">Szacunkowy koszt materiałów</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(costResult.totalCost)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {area > 0 ? `dla ${formattedArea} m²` : 'Podaj powierzchnię i ceny materiałów'}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800 space-y-1">
                {warnings.map((warning, idx) => (
                  <div key={idx}>{warning}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
