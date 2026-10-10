import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  BudgetCategory,
  AutomationRule,
  CurrencyConfig,
  BudgetThresholdAlert,
} from './types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_AUTOMATION_RULES,
  getInitialTransactions,
  getSampleChileanTransactions,
} from './data/defaultData';
import {
  AVAILABLE_CURRENCIES,
  getCurrentMonthKey,
  formatCurrency,
} from './utils/formatters';
import {
  calculateFinancialMetrics,
  applyRulesToAllTransactions,
  matchCategoryByRules,
} from './utils/rulesEngine';
import { playThresholdSound } from './utils/audioAlerts';
import { Header } from './components/Header';
import { BudgetOverview } from './components/BudgetOverview';
import { InteractiveQuickAdd } from './components/InteractiveQuickAdd';
import { QuickEntryBar } from './components/QuickEntryBar';
import { CategoryBudgetCard } from './components/CategoryBudgetCard';
import { CategoriesManager } from './components/CategoriesManager';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AutomationRulesModal } from './components/AutomationRulesModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ExportImportModal } from './components/ExportImportModal';
import { BudgetAlertToast } from './components/BudgetAlertToast';
import { AlertsDrawer } from './components/AlertsDrawer';
import {
  HardDriveDownload,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'presupuesto_chile_tx_v4',
  CATEGORIES: 'presupuesto_chile_cat_v4',
  RULES: 'presupuesto_chile_rules_v4',
  CURRENCY: 'presupuesto_chile_curr_v4',
  SOUND_ENABLED: 'presupuesto_chile_sound_v4',
};

export default function App() {
  // Persistence state with seamless clean start at zero
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return AVAILABLE_CURRENCIES[0]; // CLP ($)
  });

  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return []; // Starts completely at zero!
  });

  const [rules, setRules] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RULES);
      if (saved) {
        const parsed: AutomationRule[] = JSON.parse(saved);
        if (parsed[0] && parsed[0].pattern.includes('lider')) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_AUTOMATION_RULES;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return true;
  });

  // UI state
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'categories' | 'transactions' | 'automation' | 'analytics'
  >('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);
  const [showNaturalTextBar, setShowNaturalTextBar] = useState<boolean>(false);

  // Alert system state
  const [activeAlert, setActiveAlert] = useState<BudgetThresholdAlert | null>(null);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalPrefillDesc, setModalPrefillDesc] = useState<string>('');
  const [modalPrefillAmount, setModalPrefillAmount] = useState<number | undefined>(undefined);
  const [modalPrefillCatId, setModalPrefillCatId] = useState<string | undefined>(undefined);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [retroactiveResultCount, setRetroactiveResultCount] = useState<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Available months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(getCurrentMonthKey());
    transactions.forEach((tx) => {
      const ym = tx.date.slice(0, 7);
      if (ym) monthsSet.add(ym);
    });

    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYm = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(prevYm);

    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  // Derived financial calculations
  const { monthlySummary, categorySpendingList } = useMemo(() => {
    return calculateFinancialMetrics(transactions, categories, selectedMonth);
  }, [transactions, categories, selectedMonth]);

  // Check budget threshold alerts dynamically
  const checkBudgetThresholdAlert = (
    targetCatId: string,
    addedExpenseAmount: number,
    txDate: string
  ) => {
    const txMonth = txDate.slice(0, 7);
    const cat = categories.find((c) => c.id === targetCatId);
    if (!cat || cat.monthlyBudget <= 0) return;

    const currentMonthTxs = transactions.filter(
      (t) => t.date.startsWith(txMonth) && t.type === 'expense' && t.categoryId === targetCatId
    );
    const currentSpent = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
    const newSpent = currentSpent + addedExpenseAmount;

    const limit = cat.monthlyBudget;
    const prevPct = (currentSpent / limit) * 100;
    const newPct = (newSpent / limit) * 100;

    if (prevPct < 100 && newPct >= 100) {
      // 100% threshold crossed!
      const alert: BudgetThresholdAlert = {
        id: `alert_${Date.now()}`,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.iconName,
        categoryColor: cat.color,
        spent: newSpent,
        limit,
        previousPercentage: prevPct,
        percentage: newPct,
        threshold: 100,
        exceededAmount: newSpent - limit,
        timestamp: Date.now(),
      };
      setActiveAlert(alert);
      playThresholdSound(100, soundEnabled);
    } else if (prevPct < 80 && newPct >= 80) {
      // 80% threshold crossed!
      const alert: BudgetThresholdAlert = {
        id: `alert_${Date.now()}`,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.iconName,
        categoryColor: cat.color,
        spent: newSpent,
        limit,
        previousPercentage: prevPct,
        percentage: newPct,
        threshold: 80,
        remainingAmount: limit - newSpent,
        timestamp: Date.now(),
      };
      setActiveAlert(alert);
      playThresholdSound(80, soundEnabled);
    }
  };

  // Transaction operations
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
    } else {
      let finalCategoryId = txData.categoryId;
      let finalRuleName = txData.autoCategorizedRuleName;

      if (txData.type === 'expense' && !finalRuleName) {
        const match = matchCategoryByRules(txData.description, txData.merchant, rules);
        if (match) {
          finalCategoryId = match.categoryId;
          finalRuleName = match.rule.name;

          setRules((prevRules) =>
            prevRules.map((r) =>
              r.id === match.rule.id ? { ...r, matchCount: r.matchCount + 1 } : r
            )
          );
        }
      }

      if (txData.type === 'expense') {
        checkBudgetThresholdAlert(finalCategoryId, txData.amount, txData.date);
      }

      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        categoryId: finalCategoryId,
        autoCategorizedRuleName: finalRuleName,
        createdAt: Date.now(),
      };

      setTransactions((prev) => [newTx, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenNewTransactionModal = (
    desc?: string,
    amount?: number,
    catId?: string
  ) => {
    setEditingTransaction(null);
    setModalPrefillDesc(desc || '');
    setModalPrefillAmount(amount);
    setModalPrefillCatId(catId);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  // Demo / Simulation for "WOW" animation preview
  const handleTriggerDemoAlert = (threshold: 80 | 100) => {
    const sampleCat =
      threshold === 100
        ? categories.find((c) => c.id === 'cat_dining') || categories[1] || categories[0]
        : categories.find((c) => c.id === 'cat_supermarket') || categories[0];

    const limit = sampleCat.monthlyBudget;
    const spent = threshold === 100 ? limit * 1.15 : limit * 0.86;

    const demoAlert: BudgetThresholdAlert = {
      id: `demo_${Date.now()}`,
      categoryId: sampleCat.id,
      categoryName: sampleCat.name,
      categoryIcon: sampleCat.iconName,
      categoryColor: sampleCat.color,
      spent,
      limit,
      previousPercentage: threshold === 100 ? 94 : 72,
      percentage: threshold === 100 ? 115 : 86,
      threshold,
      exceededAmount: threshold === 100 ? spent - limit : undefined,
      remainingAmount: threshold === 80 ? limit - spent : undefined,
      timestamp: Date.now(),
    };

    setActiveAlert(demoAlert);
    playThresholdSound(threshold, soundEnabled);
  };

  // Category operations
  const handleUpdateBudgetLimit = (categoryId: string, newLimit: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget: newLimit } : c))
    );
  };

  const handleAddCategory = (newCat: Omit<BudgetCategory, 'id'>) => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setCategories((prev) => [...prev, { ...newCat, id }]);
  };

  // Rule operations
  const handleAddRule = (newRule: Omit<AutomationRule, 'id' | 'matchCount'>) => {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setRules((prev) => [...prev, { ...newRule, id, matchCount: 0 }]);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleApplyRulesRetroactively = () => {
    const { updatedTransactions, updatedCount } = applyRulesToAllTransactions(
      transactions,
      rules
    );
    setTransactions(updatedTransactions);
    setRetroactiveResultCount(updatedCount);
    setTimeout(() => setRetroactiveResultCount(null), 5000);
  };

  const handleResetRulesToDefault = () => {
    setRules(DEFAULT_AUTOMATION_RULES);
    setCategories(DEFAULT_CATEGORIES);
    setTransactions(getInitialTransactions());
    setCurrency(AVAILABLE_CURRENCIES[0]);
  };

  const handleFilterByCategory = (categoryId: string) => {
    setFilterCategoryId(categoryId);
    setCurrentTab('transactions');
  };

  const handleRestoreData = (data: {
    transactions: Transaction[];
    categories: BudgetCategory[];
    rules: AutomationRule[];
    currency: CurrencyConfig;
  }) => {
    setTransactions(data.transactions);
    setCategories(data.categories);
    setRules(data.rules);
    setCurrency(data.currency);
  };

  const handleResetFactoryData = () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setRules(DEFAULT_AUTOMATION_RULES);
    setCurrency(AVAILABLE_CURRENCIES[0]);
  };

  const handleLoadChileanDemoData = () => {
    setTransactions(getSampleChileanTransactions());
    setCategories(DEFAULT_CATEGORIES);
    setRules(DEFAULT_AUTOMATION_RULES);
    setCurrency(AVAILABLE_CURRENCIES[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Header Contract with Chilean Branding & Alert Bell */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTransaction={() => handleOpenNewTransactionModal()}
        exceededAlertsCount={monthlySummary.exceededCategoriesCount}
        warningAlertsCount={monthlySummary.warningCategoriesCount}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Toolbar: Actions Strip + Alert Teasers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>🇨🇱</span>
              <span>Presupuesto Personal en Chile (CLP)</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{categories.length} categorías</span>
            <span aria-hidden="true">·</span>
            <span>{rules.filter((r) => r.enabled).length} reglas de comercios chilenos</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick WOW Demo alert buttons */}
            <button
              onClick={() => handleTriggerDemoAlert(80)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-md transition-colors"
              title="Prueba visual de la animación al superar el 80%"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Probar Alerta 80%</span>
            </button>

            <button
              onClick={() => handleTriggerDemoAlert(100)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1 rounded-md transition-colors"
              title="Prueba visual de la animación al superar el 100%"
            >
              <AlertOctagon className="w-3 h-3 text-rose-600" />
              <span>Probar Alerta 100%</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Respaldo</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Overview (Resumen Principal) */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Ultra-Simple Interactive Chilean Quick Add Pad */}
            <InteractiveQuickAdd
              categories={categories}
              currency={currency}
              onAddTransaction={(txData) => handleSaveTransaction(txData)}
              onOpenDetailedForm={() => handleOpenNewTransactionModal()}
            />

            {/* Optional Natural Language Text Bar */}
            <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setShowNaturalTextBar(!showNaturalTextBar)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>¿Prefieres escribir en texto libre? (ej. &quot;Líder 35000&quot; o &quot;Copec 20000&quot;)</span>
                </span>
                {showNaturalTextBar ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showNaturalTextBar && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <QuickEntryBar
                    rules={rules}
                    categories={categories}
                    currency={currency}
                    onAddTransaction={(txData) => handleSaveTransaction(txData)}
                    onOpenDetailedForm={(desc, amount, catId) =>
                      handleOpenNewTransactionModal(desc, amount, catId)
                    }
                  />
                </div>
              )}
            </div>

            {/* High-level KPI Cards & Month Picker */}
            <BudgetOverview
              summary={monthlySummary}
              selectedMonth={selectedMonth}
              onChangeMonth={setSelectedMonth}
              currency={currency}
              onChangeCurrency={setCurrency}
              currencies={AVAILABLE_CURRENCIES}
              availableMonths={availableMonths}
              onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
            />

            {/* Category Budgets Grid Spotlight */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Límites de Presupuesto Mensual por Categoría
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monitorea tu disponible en pesos chilenos y recibe alertas al superar 80% y 100%
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('categories')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <span>Ver todas ({categories.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySpendingList.slice(0, 6).map((item) => (
                  <CategoryBudgetCard
                    key={item.category.id}
                    item={item}
                    currency={currency}
                    onUpdateBudgetLimit={handleUpdateBudgetLimit}
                    onFilterByCategory={handleFilterByCategory}
                  />
                ))}
              </div>
            </div>

            {/* Recent Transactions in Month */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Últimos Movimientos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gastos clasificados con las reglas automatizadas chilenas
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('transactions')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <span>Ver historial completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <TransactionList
                transactions={transactions}
                categories={categories}
                currency={currency}
                selectedMonth={selectedMonth}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenNewTransaction={() => handleOpenNewTransactionModal()}
                filterCategoryId={filterCategoryId}
                onClearCategoryFilter={() => setFilterCategoryId(undefined)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Presupuestos (Gestión de Categorías y Límites) */}
        {currentTab === 'categories' && (
          <CategoriesManager
            categoriesSpending={categorySpendingList}
            currency={currency}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            onAddCategory={handleAddCategory}
            onFilterByCategory={handleFilterByCategory}
          />
        )}

        {/* Tab 3: Movimientos (Tabla detallada con filtros) */}
        {currentTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            categories={categories}
            currency={currency}
            selectedMonth={selectedMonth}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={() => handleOpenNewTransactionModal()}
            filterCategoryId={filterCategoryId}
            onClearCategoryFilter={() => setFilterCategoryId(undefined)}
          />
        )}

        {/* Tab 4: Automatización (Reglas de clasificación inteligente) */}
        {currentTab === 'automation' && (
          <AutomationRulesModal
            rules={rules}
            categories={categories}
            onAddRule={handleAddRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onApplyRulesRetroactively={handleApplyRulesRetroactively}
            onResetRulesToDefault={handleResetRulesToDefault}
            retroactiveCount={retroactiveResultCount}
          />
        )}

        {/* Tab 5: Analítica (Gráficos y distribución de gastos) */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            categoriesSpending={categorySpendingList}
            summary={monthlySummary}
            transactions={transactions}
            selectedMonth={selectedMonth}
            currency={currency}
          />
        )}
      </main>

      {/* Standout "WOW" Visual Alert Toast */}
      <BudgetAlertToast
        alert={activeAlert}
        currency={currency}
        onClose={() => setActiveAlert(null)}
        onOpenCategorySettings={(catId) => {
          setCurrentTab('categories');
          setActiveAlert(null);
        }}
        onFilterByCategory={(catId) => {
          handleFilterByCategory(catId);
          setActiveAlert(null);
        }}
      />

      {/* Slide-out Notification Center Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        categoriesSpending={categorySpendingList}
        currency={currency}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onTriggerDemoAlert={handleTriggerDemoAlert}
        onOpenCategoryLimitEdit={(catId) => {
          setCurrentTab('categories');
        }}
        onFilterByCategory={handleFilterByCategory}
      />

      {/* Transaction Modal (Add / Edit) with Easy Chilean Fast Mode */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        rules={rules}
        currency={currency}
        initialTransaction={editingTransaction}
        initialDescription={modalPrefillDesc}
        initialAmount={modalPrefillAmount}
        initialCategoryId={modalPrefillCatId}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        rules={rules}
        currency={currency}
        onRestoreData={handleRestoreData}
        onResetFactoryData={handleResetFactoryData}
        onLoadChileanDemoData={handleLoadChileanDemoData}
      />
    </div>
  );
}
