import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Pencil,
  Check,
  X,
  ArrowUpRight,
  AlertTriangle,
  AlertOctagon,
  Flame,
} from 'lucide-react';
import { CategorySpending, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBudgetCardProps {
  item: CategorySpending;
  currency: CurrencyConfig;
  onUpdateBudgetLimit: (categoryId: string, newLimit: number) => void;
  onFilterByCategory: (categoryId: string) => void;
}

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  item,
  currency,
  onUpdateBudgetLimit,
  onFilterByCategory,
}) => {
  const { category, spent, remaining, percentage, status, transactionCount } = item;
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState(category.monthlyBudget.toString());

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(limitInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudgetLimit(category.id, val);
      setIsEditingLimit(false);
    }
  };

  const handleCancel = () => {
    setLimitInput(category.monthlyBudget.toString());
    setIsEditingLimit(false);
  };

  const progressPercentage = Math.min(Math.round(percentage), 100);
  const isExceeded = status === 'exceeded';
  const isWarning = status === 'warning';

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative bg-white rounded-xl p-4 transition-all duration-300 ${
        isExceeded
          ? 'border-2 border-rose-500/80 shadow-md shadow-rose-500/15 ring-2 ring-rose-400/20'
          : isWarning
          ? 'border-2 border-amber-400/80 shadow-sm shadow-amber-500/10 ring-1 ring-amber-300/30'
          : 'border border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Visual alert badge ticker if >=80% or >=100% */}
      {isExceeded && (
        <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider rounded-full shadow-sm animate-pulse">
          <AlertOctagon className="w-3 h-3" />
          <span>Superado +100%</span>
        </div>
      )}

      {isWarning && !isExceeded && (
        <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold font-mono uppercase tracking-wider rounded-full shadow-sm">
          <AlertTriangle className="w-3 h-3" />
          <span>Alerta 80%</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 relative transition-transform ${
              isExceeded ? 'ring-2 ring-rose-400 ring-offset-1' : ''
            }`}
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon name={category.iconName} className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-[11px] text-slate-400 line-clamp-1">{category.description}</p>
            )}
          </div>
        </div>

        {/* Edit limit trigger */}
        <button
          onClick={() => setIsEditingLimit(!isEditingLimit)}
          title="Modificar límite de presupuesto"
          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Edit limit form inline */}
      {isEditingLimit ? (
        <form onSubmit={handleSaveLimit} className="my-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
          <div className="text-xs text-slate-500 whitespace-nowrap">Nuevo límite:</div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-slate-900"
            autoFocus
          />
          <button
            type="submit"
            className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : null}

      {/* Numbers */}
      <div className="flex items-baseline justify-between mb-1.5">
        <div
          className={`text-lg font-bold font-mono tracking-tight tabular-nums ${
            isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-slate-900'
          }`}
        >
          {formatCurrency(spent, currency)}
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums">
          de {formatCurrency(category.monthlyBudget, currency)}
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2.5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full transition-colors ${
            isExceeded
              ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-sm shadow-rose-500/50'
              : isWarning
              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
              : 'bg-emerald-500'
          }`}
        />
      </div>

      {/* Unboxed Metadata (Zero-pill discipline) */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-500">
          {isExceeded ? (
            <span className="text-rose-600 font-bold font-mono tabular-nums">
              Excedido: +{formatCurrency(Math.abs(remaining), currency)}
            </span>
          ) : (
            <span>
              Disponible: <strong className="text-slate-700 font-mono tabular-nums">{formatCurrency(remaining, currency)}</strong>
            </span>
          )}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span
            className={`font-mono font-semibold tabular-nums ${
              isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-600'
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>

        <button
          onClick={() => onFilterByCategory(category.id)}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
        >
          <span>{transactionCount} reg.</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};
