import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Check } from 'lucide-react';
import { BudgetCategory, CategorySpending, CurrencyConfig } from '../types/finance';
import { CategoryBudgetCard } from './CategoryBudgetCard';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';

interface CategoriesManagerProps {
  categoriesSpending: CategorySpending[];
  currency: CurrencyConfig;
  onUpdateBudgetLimit: (categoryId: string, newLimit: number) => void;
  onAddCategory: (category: Omit<BudgetCategory, 'id'>) => void;
  onFilterByCategory: (categoryId: string) => void;
}

const PRESET_COLORS = [
  '#059669', // emerald
  '#2563eb', // blue
  '#d97706', // amber
  '#ea580c', // orange
  '#7c3aed', // violet
  '#e11d48', // rose
  '#0d9488', // teal
  '#4f46e5', // indigo
  '#0891b2', // cyan
  '#64748b', // slate
];

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categoriesSpending,
  currency,
  onUpdateBudgetLimit,
  onAddCategory,
  onFilterByCategory,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('50000');
  const [iconName, setIconName] = useState('ShoppingCart');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBudget = parseFloat(monthlyBudget);
    onAddCategory({
      name: name.trim(),
      description: description.trim() || undefined,
      monthlyBudget: isNaN(parsedBudget) ? 0 : parsedBudget,
      iconName,
      color,
    });

    setName('');
    setDescription('');
    setMonthlyBudget('50000');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Categorías y Límites de Presupuesto
          </h2>
          <p className="text-xs text-slate-500">
            Cada categoría monitorea su propio límite mensual y recibe gastos clasificados automáticamente.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Add new category form dropdown */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Crear Nueva Categoría de Presupuesto
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre de la categoría *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mascotas, Gimnasio, Viajes..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Límite de presupuesto mensual ({currency.symbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Veterinario, comida para perro..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Seleccionar Icono
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setIconName(icon)}
                    className={`p-2 rounded-md transition-colors ${
                      iconName === icon
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CategoryIcon name={icon} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Color identificador
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Crear Categoría
            </button>
          </div>
        </form>
      )}

      {/* Grid of categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesSpending.map((item) => (
          <CategoryBudgetCard
            key={item.category.id}
            item={item}
            currency={currency}
            onUpdateBudgetLimit={onUpdateBudgetLimit}
            onFilterByCategory={onFilterByCategory}
          />
        ))}
      </div>
    </div>
  );
};
