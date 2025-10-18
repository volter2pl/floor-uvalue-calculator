import { Plus, Layers, Menu, X } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Material, Scheme } from './types';
import { PREDEFINED_MATERIALS } from './constants';
import { MaterialsPanel } from './components/MaterialsPanel';
import { SchemeCard } from './components/SchemeCard';
import { useState } from 'react';

function App() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('floor-materials', PREDEFINED_MATERIALS);
  const [schemes, setSchemes] = useLocalStorage<Scheme[]>('floor-schemes', [
    {
      id: 'scheme-1',
      name: 'Schemat 1',
      layers: [],
    },
  ]);
  const [isPanelPinned, setIsPanelPinned] = useLocalStorage<boolean>('panel-pinned', true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      ...material,
      id: `material-${Date.now()}`,
    };
    setMaterials([...materials, newMaterial]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    setSchemes(
      schemes.map((scheme) => ({
        ...scheme,
        layers: scheme.layers.filter((layer) => layer.materialId !== id),
      }))
    );
  };

  const addScheme = () => {
    const newScheme: Scheme = {
      id: `scheme-${Date.now()}`,
      name: `Schemat ${schemes.length + 1}`,
      layers: [],
    };
    setSchemes([...schemes, newScheme]);
  };

  const updateScheme = (updatedScheme: Scheme) => {
    setSchemes(schemes.map((s) => (s.id === updatedScheme.id ? updatedScheme : s)));
  };

  const deleteScheme = (id: string) => {
    if (schemes.length > 1) {
      setSchemes(schemes.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Layers size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Kalkulator warstw podłogi</h1>
                <p className="text-xs lg:text-sm text-gray-600">Oblicz współczynnik przenikania ciepła U i opór cieplny R</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={`
              fixed lg:sticky top-0 left-0 h-screen lg:h-auto z-50 lg:z-auto
              transition-all duration-300 ease-in-out
              ${
                isMobileMenuOpen
                  ? 'translate-x-0 w-80'
                  : '-translate-x-full lg:translate-x-0'
              }
              ${isPanelPinned ? 'lg:w-80' : 'lg:w-16'}
              flex-shrink-0
            `}
          >
            <div className="h-full bg-white lg:rounded-lg shadow-lg">
              {!isPanelPinned && (
                <div className="hidden lg:flex h-full flex-col items-center py-6 gap-4">
                  <button
                    onClick={() => setIsPanelPinned(true)}
                    className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Pokaż panel"
                  >
                    <Menu size={24} />
                  </button>
                  {materials.slice(0, 6).map((material) => (
                    <div
                      key={material.id}
                      className="w-10 h-10 rounded border-2 border-gray-300"
                      style={{ backgroundColor: material.color }}
                      title={material.name}
                    />
                  ))}
                </div>
              )}
              {(isPanelPinned || isMobileMenuOpen) && (
                <MaterialsPanel
                  materials={materials}
                  onAddMaterial={addMaterial}
                  onDeleteMaterial={deleteMaterial}
                  isPinned={isPanelPinned}
                  onTogglePin={() => setIsPanelPinned(!isPanelPinned)}
                  isOpen={isMobileMenuOpen}
                />
              )}
            </div>
          </aside>

          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Schematy podłogi</h2>
              <button
                onClick={addScheme}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                title="Dodaj schemat"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6">
                {schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    materials={materials}
                    onUpdateScheme={updateScheme}
                    onDeleteScheme={() => deleteScheme(scheme.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-600 text-center">
            <p>Rsi = 0.17 m²K/W | Rse = 0.00 m²K/W (podłoga na gruncie)</p>
            <p className="mt-1">Dane zapisywane lokalnie w przeglądarce</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
