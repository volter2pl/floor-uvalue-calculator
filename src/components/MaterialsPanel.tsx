import { Plus, Trash2, Pin, PinOff } from 'lucide-react';
import { Material } from '../types';
import { useState } from 'react';

interface MaterialsPanelProps {
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id'>) => void;
  onDeleteMaterial: (id: string) => void;
  isPinned: boolean;
  onTogglePin: () => void;
  isOpen: boolean;
}

export function MaterialsPanel({ materials, onAddMaterial, onDeleteMaterial, isPinned, onTogglePin, isOpen }: MaterialsPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    lambda: '',
    color: '#808080',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lambda = parseFloat(newMaterial.lambda);

    if (!newMaterial.name.trim() || isNaN(lambda) || lambda <= 0) {
      return;
    }

    onAddMaterial({
      name: newMaterial.name.trim(),
      lambda,
      color: newMaterial.color,
      isPredefined: false,
    });

    setNewMaterial({ name: '', lambda: '', color: '#808080' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-y-auto">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Materiały</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Dodaj materiał"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={onTogglePin}
            className={`hidden lg:flex p-2 rounded-lg transition-colors ${
              isPinned ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={isPinned ? 'Odepnij panel' : 'Przypnij panel'}
          >
            {isPinned ? <Pin size={20} /> : <PinOff size={20} />}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mx-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. Styropian XPS"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">λ [W/m·K]</label>
              <input
                type="number"
                step="0.001"
                value={newMaterial.lambda}
                onChange={(e) => setNewMaterial({ ...newMaterial, lambda: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.034"
                required
                min="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolor</label>
              <input
                type="color"
                value={newMaterial.color}
                onChange={(e) => setNewMaterial({ ...newMaterial, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Dodaj
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2 px-6 pb-6">
        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-8 h-8 rounded flex-shrink-0 border border-gray-300"
              style={{ backgroundColor: material.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">{material.name}</div>
              <div className="text-sm text-gray-500">λ = {material.lambda} W/m·K</div>
            </div>
            {!material.isPredefined && (
              <button
                onClick={() => onDeleteMaterial(material.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Usuń materiał"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
