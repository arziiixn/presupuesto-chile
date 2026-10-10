import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Calendar,
  Layers,
} from 'lucide-react';
import { MonthlySummary, CurrencyConfig } from '../types/finance';
import { formatCurrency, getMonthName } from '../utils/formatters';

interface BudgetOverviewProps {
  summary: MonthlySummary;
  selectedMonth: string;
  onChangeMonth: (month: string) => void;
  currency: CurrencyConfig;
  onChangeCurrency: (currency: CurrencyConfig) => void;
  currencies: CurrencyConfig[];
  availableMonths: string[];
  onOpenAlerts?: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  summary,
  selectedMonth,
  onChangeMonth,
  currency,
  onChangeCurrency,
  currencies,
  availableMonths,
  onOpenAlerts,
}) => {
  const isOverBudget = summary.totalBudgetSpent > summary.totalBudgetLimit;
  const budgetProgress = Math.min(Math.round(summary.overallBudgetPercentage), 100);

  return (
    <div className="space-y-4">
      {/* Controls bar: Month Selector + Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {getMonthName(selectedMonth)}
            </h2>
            <div className="text-xs text-slate-500">
              Estado financiero y ejecución presupuestaria
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>

          {/* Currency selector */}
          <select
            value={currency.code}
            onChange={(e) => {
              const found = currencies.find((c) => c.code === e.target.value);
              if (found) onChangeCurrency(found);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 KPI Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gastos vs Presupuesto */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Presupuesto Ejecutado</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(summary.totalBudgetSpent, currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Límite: {formatCurrency(summary.totalBudgetLimit, currency)}</span>
            <span
              className={`font-semibold tabular-nums ${
                isOverBudget ? 'text-rose-600' : 'text-slate-700'
              }`}
            >
              {summary.overallBudgetPercentage.toFixed(1)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-500' : budgetProgress > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(summary.overallBudgetPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Ingresos y Balance Neto */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Balance Neto (Ahorro)</span>
            {summary.netBalance >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              summary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.netBalance >= 0 ? '+' : ''}
            {formatCurrency(summary.netBalance, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Ingresos totales:</span>
            <span className="font-mono tabular-nums text-slate-700 font-medium">
              {formatCurrency(summary.totalIncome, currency)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.totalIncome > 0
              ? `${((summary.netBalance / summary.totalIncome) * 100).toFixed(0)}% tasa de ahorro`
              : 'Sin ingresos registrados'}
          </div>
        </div>

        {/* Card 3: Ritmo Diario & Proyección */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Ritmo Diario Promedio</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(summary.dailyAverageSpend, currency)}
            <span className="text-xs font-normal text-slate-400"> /día</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Proyección fin de mes:</span>
            <span className="font-mono tabular-nums text-slate-700 font-medium">
              {formatCurrency(summary.projectedMonthEndSpend, currency)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.projectedMonthEndSpend > summary.totalBudgetLimit ? (
              <span className="text-amber-600 font-medium">Proyección supera límite mensual</span>
            ) : (
              <span className="text-emerald-600 font-medium">Ritmo dentro del límite</span>
            )}
          </div>
        </div>

        {/* Card 4: Estado de Alertas por Categoría */}
        <div
          onClick={onOpenAlerts}
          className={`bg-white p-5 rounded-xl border transition-all ${
            onOpenAlerts ? 'cursor-pointer hover:border-slate-400 hover:shadow-sm' : ''
          } ${
            summary.exceededCategoriesCount > 0
              ? 'border-rose-300 ring-1 ring-rose-200'
              : summary.warningCategoriesCount > 0
              ? 'border-amber-300 ring-1 ring-amber-200'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Alertas de Presupuesto</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                summary.exceededCategoriesCount > 0
                  ? 'text-rose-500 animate-pulse'
                  : summary.warningCategoriesCount > 0
                  ? 'text-amber-500'
                  : 'text-slate-400'
              }`}
            />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {summary.exceededCategoriesCount + summary.warningCategoriesCount}{' '}
            <span className="text-xs font-normal text-slate-400">categorías</span>
          </div>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>Excedidas (&gt;100%):</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  summary.exceededCategoriesCount > 0 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {summary.exceededCategoriesCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>En advertencia (&gt;80%):</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  summary.warningCategoriesCount > 0 ? 'text-amber-600' : 'text-slate-700'
                }`}
              >
                {summary.warningCategoriesCount}
              </span>
            </div>
          </div>
          {onOpenAlerts && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium hover:text-slate-700">
              <span>Ver centro de avisos</span>
              <span>→</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
