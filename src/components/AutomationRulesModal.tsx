import React, { useState } from 'react';
import {
  Play,
  Plus,
  Zap,
  Trash2,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AutomationRule, BudgetCategory, RuleConditionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { matchCategoryByRules } from '../utils/rulesEngine';

interface AutomationRulesModalProps {
  rules: AutomationRule[];
  categories: BudgetCategory[];
  onAddRule: (rule: Omit<AutomationRule, 'id' | 'matchCount'>) => void;
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onApplyRulesRetroactively: () => void;
  onResetRulesToDefault: () => void;
  retroactiveCount: number | null;
}

export const AutomationRulesModal: React.FC<AutomationRulesModalProps> = ({
  rules,
  categories,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onApplyRulesRetroactively,
  onResetRulesToDefault,
  retroactiveCount,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [conditionType, setConditionType] = useState<RuleConditionType>('contains_keyword');
  const [pattern, setPattern] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');

  // Simulator test string
  const [simulatorInput, setSimulatorInput] = useState('Compra en Líder 25000');

  const testMatch = matchCategoryByRules(simulatorInput, undefined, rules);
  const testCategory = testMatch ? categories.find((c) => c.id === testMatch.categoryId) : null;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pattern.trim() || !targetCategoryId) return;

    onAddRule({
      name: name.trim(),
      conditionType,
      pattern: pattern.trim(),
      targetCategoryId,
      priority: rules.length + 1,
      enabled: true,
      description: description.trim() || undefined,
    });

    setName('');
    setPattern('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Reglas de Categorización Automatizada
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            El motor evalúa cada gasto nuevo según tus comercios y palabras clave. Si coincide, asigna la categoría automáticamente sin que tengas que seleccionarla manualmente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onApplyRulesRetroactively}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            title="Aplica todas las reglas activas a tus movimientos registrados existentes"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Ejecutar en Historial</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Regla</span>
          </button>
        </div>
      </div>

      {/* Retroactive execution result feedback banner */}
      {retroactiveCount !== null && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 text-xs text-indigo-900">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {retroactiveCount > 0
              ? `¡Se actualizaron y clasificaron automáticamente ${retroactiveCount} movimientos anteriores!`
              : 'Todos tus movimientos ya estaban asignados con las reglas actuales.'}
          </span>
        </div>
      )}

      {/* Live Rule Simulator */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Probador y Simulador de Reglas en Vivo</span>
          </div>
          <span className="text-[11px] text-slate-400">Verifica cómo clasificaría el motor</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={simulatorInput}
            onChange={(e) => setSimulatorInput(e.target.value)}
            placeholder="Escribe un concepto de prueba, ej: 'Líder 25000' o 'Bip 5000'..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs flex items-center gap-2 shrink-0">
            {testCategory && testMatch ? (
              <>
                <span className="text-slate-400">Resultado:</span>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: testCategory.color }}
                />
                <span className="font-semibold text-white">{testCategory.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Regla: &quot;{testMatch.rule.name}&quot; · Coincide: &quot;{testMatch.matchedPattern}&quot;)
                </span>
              </>
            ) : (
              <span className="text-slate-400 italic">Sin regla activa coincidente</span>
            )}
          </div>
        </div>
      </div>

      {/* Create Rule Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateRule}
          className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Crear Regla de Automatización
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre de la regla *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Compras en Cafeterías"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tipo de Condición
              </label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as RuleConditionType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="contains_keyword">Contiene palabras clave (separadas por comas)</option>
                <option value="exact_merchant">Nombre de comercio / empresa</option>
                <option value="regex">Expresión regular (Regex)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Asignar a Categoría *
              </label>
              <select
                required
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Patrón o palabras a detectar *
            </label>
            <input
              type="text"
              required
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="starbucks, cafeteria, cafe, desayuno, panaderia..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Separa varias palabras con comas. El motor no distingue entre mayúsculas y acentos.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Guardar Regla
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-900">
            Reglas Activas ({rules.filter((r) => r.enabled).length} de {rules.length})
          </div>
          <button
            onClick={onResetRulesToDefault}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            title="Restaura el paquete de 10 reglas populares sugeridas"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar reglas predeterminadas</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {rules.map((rule) => {
            const targetCat = categories.find((c) => c.id === rule.targetCategoryId);

            return (
              <div
                key={rule.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  rule.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => onToggleRule(rule.id)}
                    className="mt-1 rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                    title={rule.enabled ? 'Desactivar regla' : 'Activar regla'}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {rule.name}
                      </span>
                      {targetCat && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: targetCat.color }}
                          />
                          <CategoryIcon name={targetCat.iconName} className="w-3 h-3" />
                          <span>{targetCat.name}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 text-xs text-slate-500 font-mono break-all line-clamp-2">
                      {rule.pattern}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Coincidencias: {rule.matchCount}</span>
                      <span>·</span>
                      <span>Prioridad: {rule.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
