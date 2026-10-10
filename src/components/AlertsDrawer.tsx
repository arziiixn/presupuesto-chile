import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  AlertTriangle,
  AlertOctagon,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { CategorySpending, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categoriesSpending: CategorySpending[];
  currency: CurrencyConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerDemoAlert: (threshold: 80 | 100) => void;
  onOpenCategoryLimitEdit: (categoryId: string) => void;
  onFilterByCategory: (categoryId: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  categoriesSpending,
  currency,
  soundEnabled,
  onToggleSound,
  onTriggerDemoAlert,
  onOpenCategoryLimitEdit,
  onFilterByCategory,
}) => {
  if (!isOpen) return null;

  const exceededCategories = categoriesSpending.filter((c) => c.status === 'exceeded');
  const warningCategories = categoriesSpending.filter((c) => c.status === 'warning');
  const totalAlerts = exceededCategories.length + warningCategories.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Centro de Alertas de Presupuesto
                </h3>
                <div className="text-xs text-slate-500">
                  {totalAlerts} {totalAlerts === 1 ? 'categoría en aviso' : 'categorías en aviso'} este mes
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick interactive test strip */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Probar Animaciones de Alerta (Demo)</span>
              </span>
              <button
                onClick={onToggleSound}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
                title={soundEnabled ? 'Silenciar sonidos' : 'Activar efectos de audio'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sonido activo</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>Silenciado</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTriggerDemoAlert(80)}
                className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Simular Alerta 80%</span>
              </button>
              <button
                type="button"
                onClick={() => onTriggerDemoAlert(100)}
                className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <AlertOctagon className="w-3 h-3 text-rose-600" />
                <span>Simular Alerta 100%</span>
              </button>
            </div>
          </div>

          {/* Content list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {totalAlerts === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  ¡Todos tus presupuestos están saludables!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Ninguna categoría ha superado el 80% ni el 100% de su límite definido para el periodo actual.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">
                    Puedes probar cómo lucen las alertas animadas arriba.
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* 100% Exceeded Group */}
                {exceededCategories.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wide">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Presupuesto Superado (≥100%)</span>
                    </div>

                    <div className="space-y-2">
                      {exceededCategories.map((item) => (
                        <div
                          key={item.category.id}
                          className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2 transition-all hover:border-rose-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: item.category.color }}
                              >
                                <CategoryIcon name={item.category.iconName} className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">
                                  {item.category.name}
                                </h5>
                                <div className="text-[11px] text-rose-700 font-semibold font-mono tabular-nums">
                                  Excedido por +{formatCurrency(Math.abs(item.remaining), currency)} ({item.percentage.toFixed(0)}%)
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono">
                              Crítico
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-rose-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-rose-600 h-full rounded-full"
                              style={{ width: '100%' }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-rose-100">
                            <span className="font-mono text-slate-600 tabular-nums">
                              {formatCurrency(item.spent, currency)} / {formatCurrency(item.category.monthlyBudget, currency)}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onOpenCategoryLimitEdit(item.category.id);
                                  onClose();
                                }}
                                className="font-semibold text-rose-700 hover:text-rose-900 transition-colors flex items-center gap-0.5"
                              >
                                <span>Ajustar límite</span>
                                <SlidersHorizontal className="w-3 h-3" />
                              </button>
                              <span className="text-slate-300">·</span>
                              <button
                                onClick={() => {
                                  onFilterByCategory(item.category.id);
                                  onClose();
                                }}
                                className="text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                Ver gastos
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 80% Warning Group */}
                {warningCategories.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4" />
                      <span>En Riesgo / Alerta (80% a 99%)</span>
                    </div>

                    <div className="space-y-2">
                      {warningCategories.map((item) => (
                        <div
                          key={item.category.id}
                          className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 transition-all hover:border-amber-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: item.category.color }}
                              >
                                <CategoryIcon name={item.category.iconName} className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">
                                  {item.category.name}
                                </h5>
                                <div className="text-[11px] text-amber-800 font-medium font-mono tabular-nums">
                                  Quedan solo {formatCurrency(item.remaining, currency)} ({item.percentage.toFixed(0)}% consumido)
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono">
                              Aviso
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-100">
                            <span className="font-mono text-slate-600 tabular-nums">
                              {formatCurrency(item.spent, currency)} / {formatCurrency(item.category.monthlyBudget, currency)}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onOpenCategoryLimitEdit(item.category.id);
                                  onClose();
                                }}
                                className="font-semibold text-amber-800 hover:text-amber-950 transition-colors flex items-center gap-0.5"
                              >
                                <span>Ajustar límite</span>
                                <SlidersHorizontal className="w-3 h-3" />
                              </button>
                              <span className="text-slate-300">·</span>
                              <button
                                onClick={() => {
                                  onFilterByCategory(item.category.id);
                                  onClose();
                                }}
                                className="text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                Ver gastos
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Las alertas se actualizan con cada nuevo gasto</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
