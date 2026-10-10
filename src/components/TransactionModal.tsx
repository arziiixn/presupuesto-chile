import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import {
  Transaction,
  BudgetCategory,
  AutomationRule,
  CurrencyConfig,
  TransactionType,
  PaymentMethod,
} from '../types/finance';
import { matchCategoryByRules } from '../utils/rulesEngine';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: BudgetCategory[];
  rules: AutomationRule[];
  currency: CurrencyConfig;
  initialTransaction?: Transaction | null;
  initialDescription?: string;
  initialAmount?: number;
  initialCategoryId?: string;
}

const CHILEAN_QUICK_TAGS: Record<string, string[]> = {
  cat_supermarket: ['Líder', 'Jumbo', 'Santa Isabel', 'Unimarc', 'Feria'],
  cat_dining: ['PedidosYa', 'Almuerzo', 'Café', 'Completos', 'Sushi', 'Uber Eats'],
  cat_housing: ['Arriendo', 'Gastos Comunes', 'Dividendo'],
  cat_utilities: ['Luz Enel', 'Aguas Andinas', 'Plan WOM/Entel', 'VTR', 'Gas'],
  cat_transport: ['Carga Bip!', 'Metro', 'Bencina Copec', 'Shell', 'Uber', 'TAG'],
  cat_subscriptions: ['Netflix', 'Spotify', 'Prime Video', 'Disney+'],
  cat_shopping: ['Falabella', 'Mercado Libre', 'Paris', 'Ripley', 'Sodimac'],
  cat_health: ['Cruz Verde', 'Ahumada', 'Salcobrand', 'Dr. Simi'],
  cat_entertainment: ['CineHoyts', 'Cinemark', 'Entradas', 'Juegos'],
  cat_savings: ['Ahorro Fintual', 'CuentaRUT'],
};

const QUICK_AMOUNTS = [
  { label: '+$2.000', val: 2000 },
  { label: '+$5.000', val: 5000 },
  { label: '+$10.000', val: 10000 },
  { label: '+$20.000', val: 20000 },
  { label: '+$50.000', val: 50000 },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  rules,
  currency,
  initialTransaction,
  initialDescription = '',
  initialAmount,
  initialCategoryId,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debito');
  const [merchant, setMerchant] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [matchedRuleName, setMatchedRuleName] = useState<string | undefined>(undefined);
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId);
      setDate(initialTransaction.date);
      setPaymentMethod(initialTransaction.paymentMethod || 'debito');
      setMerchant(initialTransaction.merchant || '');
      setNotes(initialTransaction.notes || '');
      setIsRecurring(!!initialTransaction.isRecurring);
      setMatchedRuleName(initialTransaction.autoCategorizedRuleName);
      setShowMoreOptions(true);
    } else {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;

      setType('expense');
      setAmount(initialAmount ? initialAmount.toString() : '');
      setDescription(initialDescription || '');
      setDate(dateStr);
      setPaymentMethod('debito');
      setMerchant('');
      setNotes('');
      setIsRecurring(false);
      setShowMoreOptions(false);

      if (initialCategoryId) {
        setCategoryId(initialCategoryId);
      } else if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }
  }, [initialTransaction, initialDescription, initialAmount, initialCategoryId, isOpen, categories]);

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    if (type === 'expense') {
      const match = matchCategoryByRules(newDesc, merchant, rules);
      if (match) {
        setCategoryId(match.categoryId);
        setMatchedRuleName(match.rule.name);
      }
    }
  };

  const handleAddChipAmount = (addVal: number) => {
    const current = parseInt(amount || '0', 10);
    const updated = isNaN(current) ? addVal : current + addVal;
    setAmount(updated.toString());
  };

  const handleSelectQuickTag = (tag: string) => {
    setDescription(tag);
    setMerchant(tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const finalDesc = description.trim() || `Compra en ${currentCat?.name || 'Comercio'}`;

    onSave(
      {
        type,
        amount: parsedAmount,
        description: finalDesc,
        categoryId,
        date: date || new Date().toISOString().slice(0, 10),
        paymentMethod,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
        isRecurring,
        autoCategorizedRuleName: matchedRuleName,
      },
      initialTransaction ? initialTransaction.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const quickTags = CHILEAN_QUICK_TAGS[categoryId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🇨🇱</span>
            <h3 className="text-sm font-bold text-slate-900">
              {initialTransaction ? 'Editar Registro' : 'Nuevo Registro Rápido'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Gasto vs Ingreso toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                type === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount Large Display with Quick Chip buttons */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ¿Cuánto gastaste? ({currency.symbol}) *
            </label>
            <div className="relative mb-2">
              <span className="absolute left-3 top-2.5 text-lg font-bold text-slate-400">$</span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-8 pr-3 py-2 text-2xl font-mono font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                autoFocus={!initialTransaction}
              />
            </div>

            {/* Quick chips to add common CLP amounts in 1 tap */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleAddChipAmount(chip.val)}
                  className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 transition-colors shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-600"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Step 2: Visual Category Tiles */}
          {type === 'expense' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  ¿En qué categoría fue? (Toca una)
                </label>
                {matchedRuleName && (
                  <span className="text-[11px] text-indigo-600 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto: {matchedRuleName}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                {categories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(c.id);
                        setMatchedRuleName(undefined);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-xs"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : c.color }}
                      >
                        <CategoryIcon name={c.iconName} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] truncate">{c.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Fast Tag Chips or Concept */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Concepto o Comercio:
            </label>
            {quickTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectQuickTag(tag)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      description === tag
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Ej. Líder, Bip!, Copec, Almuerzo, PedidosYa..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Chilean Payment Methods */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Método de Pago:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('debito')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentMethod === 'debito'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💳 Redcompra
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🏦 CuentaRUT
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credito')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentMethod === 'credito'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💳 Crédito
              </button>
            </div>
          </div>

          {/* Optional Collapsible Details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
            >
              <span>{showMoreOptions ? 'Ocultar opciones avanzadas' : 'Más opciones (fecha, notas...)'}</span>
              {showMoreOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMoreOptions && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Fecha del movimiento
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Local / Comercio específico
                    </label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="Ej. Líder Las Condes, Shell..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalles sobre este gasto..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                  />
                  <span>Gasto fijo recurrente mensual</span>
                </label>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md ${
                amount && parseFloat(amount) > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {initialTransaction ? 'Guardar Cambios' : '¡Guardar Registro!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
