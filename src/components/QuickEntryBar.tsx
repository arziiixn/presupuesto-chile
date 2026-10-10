import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, CornerDownLeft } from 'lucide-react';
import { AutomationRule, BudgetCategory, CurrencyConfig, Transaction } from '../types/finance';
import { parseNaturalLanguageInput } from '../utils/rulesEngine';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface QuickEntryBarProps {
  rules: AutomationRule[];
  categories: BudgetCategory[];
  currency: CurrencyConfig;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenDetailedForm: (initialDescription?: string, initialAmount?: number, initialCategoryId?: string) => void;
}

export const QuickEntryBar: React.FC<QuickEntryBarProps> = ({
  rules,
  categories,
  currency,
  onAddTransaction,
  onOpenDetailedForm,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const parsed = useMemo(() => {
    return parseNaturalLanguageInput(inputText, rules, categories);
  }, [inputText, rules, categories]);

  const matchedCategory = useMemo(() => {
    return categories.find((c) => c.id === parsed.autoCategoryId) || null;
  }, [categories, parsed.autoCategoryId]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!parsed.amount || parsed.amount <= 0 || !parsed.description) {
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    onAddTransaction({
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      categoryId: parsed.autoCategoryId || categories[0].id,
      date: dateStr,
      paymentMethod: 'debito',
      autoCategorizedRuleName: parsed.matchedRuleName,
      isRecurring: false,
    });

    setInputText('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2400);
  };

  const samplePresets = [
    'Líder 35000',
    'Carga Bip 5000',
    'Copec 20000',
    'PedidosYa 12990',
    'Cruz Verde 8500',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            Escritura Rápida en Lenguaje Natural
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Escribe como hablas (ej. &quot;Líder 35000&quot; o &quot;Bip 5000&quot;)
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ejemplo: 'Líder 35000' o 'Copec 20000' o 'PedidosYa 12990'..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          {parsed.amount && parsed.amount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono font-semibold text-slate-900 tabular-nums">
              {formatCurrency(parsed.amount, currency)}
            </div>
          )}

          <button
            type="submit"
            disabled={!parsed.amount || parsed.amount <= 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              parsed.amount && parsed.amount > 0
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Guardar</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Live Auto-Detection preview banner */}
      {inputText.trim().length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Categoría detectada:</span>
            {matchedCategory ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: matchedCategory.color }}
                />
                <CategoryIcon name={matchedCategory.iconName} className="w-3.5 h-3.5" />
                <span>{matchedCategory.name}</span>
                {parsed.matchedRuleName && (
                  <span className="text-slate-500 text-[11px]">
                    (por regla: {parsed.matchedRuleName})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500 italic">Sin regla coincidente (Otros)</span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenDetailedForm(parsed.description, parsed.amount || undefined, parsed.autoCategoryId || undefined)
            }
            className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Más detalles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Success feedback banner */}
      {showSuccessToast && (
        <div className="mt-2.5 py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Movimiento registrado y clasificado exitosamente!</span>
        </div>
      )}

      {/* Quick click suggestions when input is empty */}
      {!inputText && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400">Prueba rápida:</span>
          {samplePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setInputText(preset)}
              className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-2 py-1 rounded transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
