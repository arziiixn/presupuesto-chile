import React, { useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  CategorySpending,
  CurrencyConfig,
  MonthlySummary,
  Transaction,
} from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsViewProps {
  categoriesSpending: CategorySpending[];
  summary: MonthlySummary;
  transactions: Transaction[];
  selectedMonth: string;
  currency: CurrencyConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  categoriesSpending,
  summary,
  transactions,
  selectedMonth,
  currency,
}) => {
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const expenseTransactions = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'expense');
  }, [monthTransactions]);

  // Top spending categories sorted
  const sortedSpending = useMemo(() => {
    return [...categoriesSpending]
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categoriesSpending]);

  // Automation stats
  const automationStats = useMemo(() => {
    const totalExpenses = expenseTransactions.length;
    if (totalExpenses === 0) return { count: 0, percentage: 0 };
    const autoCategorized = expenseTransactions.filter((t) => !!t.autoCategorizedRuleName).length;
    return {
      count: autoCategorized,
      percentage: Math.round((autoCategorized / totalExpenses) * 100),
    };
  }, [expenseTransactions]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const map = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      if (t.merchant) {
        map.set(t.merchant, (map.get(t.merchant) || 0) + t.amount);
      }
    });

    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenseTransactions]);

  // Calculate SVG donut slices
  const totalExpenseAmount = summary.totalExpenses || 1;
  let accumulatedAngle = 0;
  const donutSegments = sortedSpending.map((item) => {
    const angle = (item.spent / totalExpenseAmount) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      category: item.category,
      spent: item.spent,
      percentage: (item.spent / totalExpenseAmount) * 100,
      startAngle,
      angle,
    };
  });

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Analítica Financiera y Eficiencia de Automatización
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Distribución real de tus gastos y diagnóstico de salud presupuestaria para el periodo.
          </p>
        </div>

        {/* Automation rate banner */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0">
          <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-950 font-mono tabular-nums">
              {automationStats.percentage}% Clasificado Automáticamente
            </div>
            <div className="text-[11px] text-indigo-700">
              {automationStats.count} de {expenseTransactions.length} gastos asignados por reglas
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Distribution Donut + Spending Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Visual SVG Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-500" />
              <span>Distribución por Categorías</span>
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              Total: {formatCurrency(summary.totalExpenses, currency)}
            </span>
          </div>

          {sortedSpending.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Sin gastos registrados para graficar este mes.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {donutSegments.map((seg, idx) => {
                    const strokeDasharray = `${(seg.percentage * 251.2) / 100} 251.2`;
                    const strokeDashoffset = -((seg.startAngle / 360) * 251.2);
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.category.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400">Gasto Mes</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    {formatCurrency(summary.totalExpenses, currency)}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {sortedSpending.slice(0, 6).map((item) => (
                  <div key={item.category.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="text-slate-800 truncate">{item.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                      <span className="text-slate-500 font-normal">
                        {((item.spent / totalExpenseAmount) * 100).toFixed(1)}%
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.spent, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Presupuesto vs Real por Categoría */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>Consumo vs Límite Presupuestado</span>
            </h3>
            <span className="text-xs text-slate-500">Capacidad utilizada</span>
          </div>

          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
            {categoriesSpending.map((item) => {
              const pct = Math.min(Math.round(item.percentage), 100);
              const isOver = item.percentage >= 100;

              return (
                <div key={item.category.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <CategoryIcon name={item.category.iconName} className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.category.name}</span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-600">
                      <span className="font-semibold text-slate-900">{formatCurrency(item.spent, currency)}</span>
                      <span className="text-slate-400"> / {formatCurrency(item.category.monthlyBudget, currency)}</span>
                      <span className={`ml-1.5 font-semibold ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                        ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Merchants + Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span>Comercios con Mayor Gasto</span>
            </h3>
            <span className="text-xs text-slate-400">Top 5 establecimientos</span>
          </div>

          {topMerchants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hay comercios especificados aún en este mes.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topMerchants.map((m, idx) => (
                <div key={m.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                    <span className="font-medium text-slate-900">{m.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(m.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnosis & Recommendations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico Presupuestario</span>
            </h3>
            <span className="text-xs text-slate-400">Evaluación automática</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            {summary.netBalance > 0 ? (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="font-semibold text-emerald-900 mb-0.5">Superávit positivo</p>
                <p className="text-emerald-800">
                  Tienes un remanente positivo de{' '}
                  <strong className="font-mono tabular-nums">{formatCurrency(summary.netBalance, currency)}</strong>.
                  Recomendado destinar un porcentaje al fondo de emergencia o inversiones.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                <p className="font-semibold text-rose-900 mb-0.5">Déficit en el periodo</p>
                <p className="text-rose-800">
                  Tus gastos superan tus ingresos por{' '}
                  <strong className="font-mono tabular-nums">{formatCurrency(Math.abs(summary.netBalance), currency)}</strong>.
                  Revisa las categorías excedidas para ajustar consumo antes de finalizar el mes.
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-900 mb-0.5">Regla 50 / 30 / 20 Orientativa</p>
              <p className="text-slate-500">
                Procura destinar el 50% de tus ingresos a necesidades fijas (Vivienda, Servicios, Supermercado), 30% a estilo de vida y ocio, y 20% al ahorro activo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
