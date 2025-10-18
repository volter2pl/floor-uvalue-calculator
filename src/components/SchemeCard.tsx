import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Scheme, Material, Layer } from '../types';
import { calculateThermalProperties } from '../utils/calculations';
import { useState } from 'react';

interface SchemeCardProps {
  scheme: Scheme;
  materials: Material[];
  onUpdateScheme: (scheme: Scheme) => void;
  onDeleteScheme: () => void;
}

export function SchemeCard({ scheme, materials, onUpdateScheme, onDeleteScheme }: SchemeCardProps) {
  const [showUnit, setShowUnit] = useState<'u' | 'r'>('u');

  const thermalResult = calculateThermalProperties(scheme.layers, materials);

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

  const getTotalHeight = () => {
    return scheme.layers.reduce((sum, layer) => sum + layer.thickness, 0);
  };

  const totalHeight = getTotalHeight();

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

      <div className="flex-1 mb-4">
        <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-gray-300 p-4 min-h-[400px] flex flex-col justify-end">
          {scheme.layers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Brak warstw
            </div>
          ) : (
            <div className="space-y-1">
              {scheme.layers.map((layer) => {
                const material = materials.find((m) => m.id === layer.materialId);
                const heightPercent = totalHeight > 0 ? (layer.thickness / totalHeight) * 100 : 0;
                const minHeight = 30;
                const displayHeight = Math.max(minHeight, (heightPercent / 100) * 300);

                return (
                  <div
                    key={layer.id}
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
                  onChange={(e) => updateLayer(layer.id, { thickness: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Grubość (mm)"
                  min="0"
                  step="1"
                />
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

        {thermalResult.warnings.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800 space-y-1">
                {thermalResult.warnings.map((warning, idx) => (
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
