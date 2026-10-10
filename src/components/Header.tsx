import React from 'react';
import { Plus, Bell } from 'lucide-react';

interface HeaderProps {
  currentTab: 'overview' | 'categories' | 'transactions' | 'automation' | 'analytics';
  onSelectTab: (tab: 'overview' | 'categories' | 'transactions' | 'automation' | 'analytics') => void;
  onOpenNewTransaction: () => void;
  exceededAlertsCount?: number;
  warningAlertsCount?: number;
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  exceededAlertsCount = 0,
  warningAlertsCount = 0,
  onOpenAlerts,
}) => {
  const totalAlerts = exceededAlertsCount + warningAlertsCount;
  const hasExceeded = exceededAlertsCount > 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Presupuesto Pro
          </button>
        </div>

        {/* Zone 2: 4-5 Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'overview'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => onSelectTab('categories')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'categories'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Presupuestos
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'transactions'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Movimientos
          </button>
          <button
            onClick={() => onSelectTab('automation')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'automation'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Automatización
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'analytics'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Analítica
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Alert Bell Notification */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className={`relative p-2 rounded-lg border transition-all ${
                hasExceeded
                  ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 ring-2 ring-rose-400/20'
                  : totalAlerts > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 ring-2 ring-amber-400/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title={
                totalAlerts > 0
                  ? `${totalAlerts} alertas de presupuesto activas`
                  : 'Centro de notificaciones de presupuesto'
              }
            >
              <Bell className={`w-4 h-4 ${hasExceeded ? 'animate-wiggle' : ''}`} />
              {totalAlerts > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-bold font-mono text-white ${
                    hasExceeded ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                  }`}
                >
                  {totalAlerts}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>


      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-100 overflow-x-auto gap-2 bg-slate-50/50">
        <button
          onClick={() => onSelectTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
            currentTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => onSelectTab('categories')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
            currentTab === 'categories' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Presupuestos
        </button>
        <button
          onClick={() => onSelectTab('transactions')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
            currentTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Movimientos
        </button>
        <button
          onClick={() => onSelectTab('automation')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
            currentTab === 'automation' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Reglas
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
            currentTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Analítica
        </button>
      </div>
    </header>
  );
};
