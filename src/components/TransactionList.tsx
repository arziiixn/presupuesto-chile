import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Trash2,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Download,
  Calendar,
} from 'lucide-react';
import { Transaction, BudgetCategory, CurrencyConfig } from '../types/finance';
import { formatCurrency, formatDateSpanish } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  currency: CurrencyConfig;
  selectedMonth: string;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
  filterCategoryId?: string;
  onClearCategoryFilter: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  selectedMonth,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
  filterCategoryId,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(filterCategoryId || 'all');

  // Keep synced if filterCategoryId changes externally
  React.useEffect(() => {
    if (filterCategoryId) {
      setActiveCategoryFilter(filterCategoryId);
    }
  }, [filterCategoryId]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.date.startsWith(selectedMonth))
      .filter((tx) => {
        if (selectedType !== 'all' && tx.type !== selectedType) return false;
        if (activeCategoryFilter !== 'all' && tx.categoryId !== activeCategoryFilter) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const desc = tx.description.toLowerCase();
          const merchant = (tx.merchant || '').toLowerCase();
          const notes = (tx.notes || '').toLowerCase();
          return desc.includes(query) || merchant.includes(query) || notes.includes(query);
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
  }, [transactions, selectedMonth, selectedType, activeCategoryFilter, searchTerm]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, BudgetCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Export current filtered list to CSV
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Comercio', 'Categoría', 'Método', 'Monto', 'Regla'];
    const rows = filteredTransactions.map((tx) => {
      const cat = categoriesMap.get(tx.categoryId);
      return [
        tx.date,
        tx.type === 'income' ? 'Ingreso' : 'Gasto',
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${(tx.merchant || '').replace(/"/g, '""')}"`,
        `"${cat ? cat.name : 'Sin categoría'}"`,
        tx.paymentMethod,
        tx.amount.toFixed(2),
        `"${(tx.autoCategorizedRuleName || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimientos_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Movimientos del Periodo
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({filteredTransactions.length} registros)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Descargar listado en archivo CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span>+ Nuevo</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por concepto o comercio..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'expense' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'income' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ingresos
            </button>
          </div>

          {/* Category filter dropdown */}
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter chip if category filtered externally */}
        {activeCategoryFilter !== 'all' && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
            <span>Filtrado por:</span>
            <span className="font-semibold text-slate-900">
              {categoriesMap.get(activeCategoryFilter)?.name}
            </span>
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                onClearCategoryFilter();
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 underline"
            >
              Quitar filtro
            </button>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 px-4 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center font-bold text-base mb-2">
            🇨🇱
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">
            Sin movimientos registrados este mes
          </p>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Tu historial está en cero y listo para empezar. Usa la botonera rápida de arriba o haz clic abajo para ingresar tu primer gasto.
          </p>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            + Registrar Primer Gasto
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Concepto y Comercio</th>
                <th className="py-3 px-4">Categoría Asignada</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Importe</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const cat = categoriesMap.get(tx.categoryId);
                const isExpense = tx.type === 'expense';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono tabular-nums">
                      {formatDateSpanish(tx.date)}
                    </td>

                    {/* Concept & Merchant */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      {tx.merchant && (
                        <div className="text-[11px] text-slate-400">{tx.merchant}</div>
                      )}
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 italic line-clamp-1">{tx.notes}</div>
                      )}
                    </td>

                    {/* Category with Auto-Categorization badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cat ? (
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-slate-800 font-medium">
                            <span
                              className="w-2 h-2 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5 text-slate-500" />
                            <span>{cat.name}</span>
                          </div>
                          {tx.autoCategorizedRuleName && (
                            <div className="text-[10px] text-indigo-600 flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Auto: {tx.autoCategorizedRuleName}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin categoría</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {tx.paymentMethod === 'debito'
                        ? '💳 Redcompra'
                        : tx.paymentMethod === 'transferencia'
                        ? '🏦 CuentaRUT'
                        : tx.paymentMethod === 'credito'
                        ? '💳 Crédito'
                        : tx.paymentMethod === 'efectivo'
                        ? '💵 Efectivo'
                        : tx.paymentMethod === 'mach_tenpo'
                        ? '📱 Mach/Tenpo'
                        : tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-semibold tabular-nums">
                      <span
                        className={
                          isExpense ? 'text-slate-900' : 'text-emerald-600'
                        }
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Editar"
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Eliminar"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
