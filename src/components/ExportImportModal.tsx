import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, BudgetCategory, AutomationRule, CurrencyConfig } from '../types/finance';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: BudgetCategory[];
  rules: AutomationRule[];
  currency: CurrencyConfig;
  onRestoreData: (data: {
    transactions: Transaction[];
    categories: BudgetCategory[];
    rules: AutomationRule[];
    currency: CurrencyConfig;
  }) => void;
  onResetFactoryData: () => void;
  onLoadChileanDemoData?: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  rules,
  currency,
  onRestoreData,
  onResetFactoryData,
  onLoadChileanDemoData,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      currency,
      categories,
      rules,
      transactions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presupuesto_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessMsg('Copia de seguridad JSON descargada correctamente.');
  };

  const handleExportAllCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Descripción', 'Comercio', 'ID_Categoría', 'Método', 'Monto', 'Regla'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      t.categoryId,
      t.paymentMethod,
      t.amount.toFixed(2),
      `"${(t.autoCategorizedRuleName || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `todos_los_movimientos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg('Archivo CSV de todos los movimientos descargado.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
          throw new Error('Formato de archivo inválido. Faltan datos requeridos.');
        }

        onRestoreData({
          transactions: parsed.transactions,
          categories: parsed.categories,
          rules: Array.isArray(parsed.rules) ? parsed.rules : rules,
          currency: parsed.currency || currency,
        });

        setSuccessMsg('¡Datos restaurados con éxito desde la copia de seguridad!');
        setErrorMsg(null);
      } catch (err: unknown) {
        setErrorMsg('Error al importar archivo JSON: Asegúrate de que sea una copia válida.');
        setSuccessMsg(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Exportar, Importar y Respaldo
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Descargar Copia de Seguridad Completa (JSON)
                </div>
                <div className="text-[11px] text-slate-500">
                  Incluye presupuestos, reglas automatizadas y todos los gastos
                </div>
              </div>
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportAllCSV}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Exportar Todos los Movimientos (CSV)
                </div>
                <div className="text-[11px] text-slate-500">
                  Compatible con Excel, Google Sheets y Numbers
                </div>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Restaurar desde Respaldo (JSON)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Carga tus datos guardados previamente
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Demo data & Reset data options */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            {onLoadChileanDemoData && (
              <button
                onClick={() => {
                  if (window.confirm('¿Deseas cargar gastos de ejemplo chilenos (Líder, Bip, Copec, etc.)?')) {
                    onLoadChileanDemoData();
                    setSuccessMsg('Datos de ejemplo chilenos cargados.');
                  }
                }}
                className="w-full flex items-center gap-2 p-2.5 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                <span>🇨🇱 Cargar datos de prueba de Chile (Demo)</span>
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas reiniciar todo a cero ($0)?')) {
                  onResetFactoryData();
                  setSuccessMsg('¡Aplicación reiniciada a cero! Lista para tus gastos.');
                }
              }}
              className="w-full flex items-center gap-2 p-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar todo a cero ($0 gastos registrados)</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
