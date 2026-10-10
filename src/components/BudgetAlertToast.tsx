import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  AlertOctagon,
  X,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { BudgetThresholdAlert, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetAlertToastProps {
  alert: BudgetThresholdAlert | null;
  currency: CurrencyConfig;
  onClose: () => void;
  onOpenCategorySettings: (categoryId: string) => void;
  onFilterByCategory: (categoryId: string) => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  alert,
  currency,
  onClose,
  onOpenCategorySettings,
  onFilterByCategory,
}) => {
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    if (!alert) return;

    setProgressWidth(100);
    const duration = 9000; // 9 seconds auto-dismiss
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  const isExceeded = alert.threshold === 100;

  return (
    <AnimatePresence>
      <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
            isExceeded
              ? 'bg-gradient-to-br from-rose-950/95 via-slate-900/98 to-slate-950/98 border-rose-500/40 text-white shadow-rose-950/50'
              : 'bg-gradient-to-br from-amber-950/95 via-slate-900/98 to-slate-950/98 border-amber-500/40 text-white shadow-amber-950/50'
          }`}
        >
          {/* Ambient luminous glow background */}
          <div
            className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 ${
              isExceeded ? 'bg-rose-500' : 'bg-amber-500'
            }`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-5 relative z-10">
            {/* Header pill & badge */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: [0, -10, 10, -5, 0], scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  isExceeded
                    ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400/30'
                    : 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/30'
                }`}
              >
                {isExceeded ? (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isExceeded ? '¡Presupuesto Superado!' : '¡Alerta de Consumo 80%!'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {alert.percentage.toFixed(0)}%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white truncate mt-0.5 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: alert.categoryColor }}
                  />
                  <span>{alert.categoryName}</span>
                </h4>
              </div>
            </div>

            {/* Dynamic gauge / progress display */}
            <div className="bg-black/30 rounded-xl p-3 border border-white/10 mb-3 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-300">Gasto actual acumulado:</span>
                <span className="font-mono font-bold text-sm text-white tabular-nums">
                  {formatCurrency(alert.spent, currency)}
                </span>
              </div>

              {/* Animated progress bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: `${Math.min(alert.previousPercentage || 70, 100)}%` }}
                  animate={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className={`h-full rounded-full shadow-inner ${
                    isExceeded
                      ? 'bg-gradient-to-r from-rose-500 to-red-400'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums pt-0.5">
                <span>Límite: {formatCurrency(alert.limit, currency)}</span>
                {isExceeded ? (
                  <span className="text-rose-400 font-bold">
                    Excedido por +{formatCurrency((alert.exceededAmount || alert.spent - alert.limit), currency)}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Disponible: {formatCurrency((alert.remainingAmount || alert.limit - alert.spent), currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Descriptive impact text */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {isExceeded ? (
                <>
                  Has sobrepasado el límite mensual asignado para <strong className="text-white">{alert.categoryName}</strong>. Te sugerimos revisar gastos no esenciales o ampliar tu presupuesto para este mes.
                </>
              ) : (
                <>
                  Has consumido más del <strong className="text-white">80%</strong> del presupuesto definido para <strong className="text-white">{alert.categoryName}</strong>. Modera los próximos consumos para no sobrepasar el límite.
                </>
              )}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onOpenCategorySettings(alert.categoryId);
                  onClose();
                }}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all shadow-md active:scale-98 ${
                  isExceeded
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/40'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-amber-900/40'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ajustar Presupuesto</span>
              </button>

              <button
                onClick={() => {
                  onFilterByCategory(alert.categoryId);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Ver gastos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Auto-dismiss countdown bar at bottom */}
          <div className="w-full bg-white/5 h-1">
            <div
              className={`h-full transition-all duration-75 ${
                isExceeded ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
