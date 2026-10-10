import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Delete,
  Sparkles,
  ArrowRight,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BudgetCategory,
  CurrencyConfig,
  PaymentMethod,
  Transaction,
} from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface InteractiveQuickAddProps {
  categories: BudgetCategory[];
  currency: CurrencyConfig;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenDetailedForm: () => void;
}

// Popular Chilean tags mapped by category ID
const CHILEAN_QUICK_TAGS: Record<string, string[]> = {
  cat_supermarket: ['Líder', 'Jumbo', 'Santa Isabel', 'Unimarc', 'Feria', 'Panadería'],
  cat_dining: ['PedidosYa', 'Almuerzo', 'Café', 'Completos', 'Sushi', 'Uber Eats'],
  cat_housing: ['Arriendo', 'Gastos Comunes', 'Dividendo', 'Cuentas casa'],
  cat_utilities: ['Luz Enel', 'Aguas Andinas', 'Plan Celular', 'Internet VTR', 'Gas'],
  cat_transport: ['Carga Bip!', 'Metro', 'Bencina Copec', 'Shell', 'Uber', 'TAG'],
  cat_subscriptions: ['Netflix', 'Spotify', 'Prime Video', 'Disney+', 'iCloud'],
  cat_shopping: ['Falabella', 'Mercado Libre', 'Paris', 'Ripley', 'Sodimac', 'Zara'],
  cat_health: ['Cruz Verde', 'Ahumada', 'Salcobrand', 'Dr. Simi', 'Consulta'],
  cat_entertainment: ['CineHoyts', 'Cinemark', 'Entradas', 'Juegos', 'Salida'],
  cat_savings: ['Ahorro Fintual', 'Depósito', 'CuentaRUT'],
};

// Popular quick amounts in CLP
const QUICK_AMOUNT_CHIPS = [
  { label: '+$2.000', value: 2000 },
  { label: '+$5.000', value: 5000 },
  { label: '+$10.000', value: 10000 },
  { label: '+$20.000', value: 20000 },
  { label: '+$50.000', value: 50000 },
];

export const InteractiveQuickAdd: React.FC<InteractiveQuickAddProps> = ({
  categories,
  currency,
  onAddTransaction,
  onOpenDetailedForm,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || 'cat_supermarket');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [customConcept, setCustomConcept] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debito');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isIncome, setIsIncome] = useState(false);

  const currentCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const quickTags = CHILEAN_QUICK_TAGS[selectedCatId] || ['Gasto'];

  // Handle amount keypad additions
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setAmountStr((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setAmountStr('');
    } else {
      if (amountStr.length >= 9) return; // Prevent unreasonable numbers
      setAmountStr((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleAddChipAmount = (addVal: number) => {
    const current = parseInt(amountStr || '0', 10);
    const updated = isNaN(current) ? addVal : current + addVal;
    setAmountStr(updated.toString());
  };

  const currentAmountNum = parseInt(amountStr, 10) || 0;

  const handleSave = () => {
    if (currentAmountNum <= 0) return;

    const finalDescription =
      selectedConcept ||
      customConcept.trim() ||
      (isIncome ? 'Ingreso registrado' : `Compra en ${currentCategory?.name || 'Comercio'}`);

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    onAddTransaction({
      type: isIncome ? 'income' : 'expense',
      amount: currentAmountNum,
      description: finalDescription,
      categoryId: isIncome ? 'cat_savings' : selectedCatId,
      date: dateStr,
      paymentMethod,
      merchant: selectedConcept || undefined,
      isRecurring: false,
    });

    // Reset fields & show celebration feedback
    setAmountStr('');
    setSelectedConcept('');
    setCustomConcept('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2600);
  };

  return (
    <div className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Header with mode switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            🇨🇱
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registrador Rápido de Gastos
            </h3>
            <p className="text-xs text-slate-500">
              Agrega cualquier compra en solo 2 toques, fácil y sin complicaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gasto vs Ingreso toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                !isIncome ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                isIncome ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ingreso
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenDetailedForm}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            title="Formulario completo con notas y fecha personalizada"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modo avanzado</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Gasto registrado con éxito! Tu presupuesto se actualizó al instante.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Paso 1 - Categoría y Conceptos Chilenos */}
        <div className="lg:col-span-7 space-y-4">
          {!isIncome ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Selecciona la Categoría (Toca una opción):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.slice(0, 8).map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCatId(cat.id);
                          setSelectedConcept('');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-97 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'text-white'
                            }`}
                            style={{ backgroundColor: isSelected ? undefined : cat.color }}
                          >
                            <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-xs font-semibold leading-tight line-clamp-1">
                          {cat.name.split(' ')[0]}
                        </span>
                        <span className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {cat.name.split(' ').slice(1).join(' ') || 'General'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chilean Quick Merchants / Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. ¿En qué local o concepto fue? (Toca uno o escribe):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedConcept(tag);
                        setCustomConcept('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedConcept === tag
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={customConcept}
                  onChange={(e) => {
                    setCustomConcept(e.target.value);
                    setSelectedConcept('');
                  }}
                  placeholder="O escribe otro concepto (ej. Almuerzo picada, panadería, etc.)..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 className="text-sm font-bold text-emerald-950 mb-1">
                Registrar Ingreso (Sueldo, Transferencia, Ahorro)
              </h4>
              <p className="text-xs text-emerald-800 mb-3">
                Este monto sumará positivamente a tu balance mensual y tus metas de ahorro.
              </p>
              <input
                type="text"
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="Concepto del ingreso (ej. Sueldo mensual, Pago freelance, Bono)..."
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          )}

          {/* Chilean Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Método de Pago Chileno:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPaymentMethod('debito')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentMethod === 'debito'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💳 Redcompra / Débito
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
                🏦 CuentaRUT / Transf.
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
                💳 Tarjeta Crédito
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Paso 2 - Monto Rápido & Teclado Táctil */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ¿Cuánto fue? (Monto en Pesos Chilenos)
            </label>

            {/* Display screen */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 text-right mb-3 shadow-inner">
              <span className="text-xs text-slate-400 block mb-0.5">Monto ingresado:</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
                {currentAmountNum > 0 ? formatCurrency(currentAmountNum, currency) : '$0'}
              </div>
            </div>

            {/* Quick CLP chip increments */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_AMOUNT_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleAddChipAmount(chip.value)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 transition-colors shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Borrar
              </button>
            </div>

            {/* Numeric Keypad for fast finger-touch entry */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-2.5 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900 transition-all active:scale-95 shadow-2xs"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-center transition-all active:scale-95"
                title="Borrar último dígito"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={currentAmountNum <= 0}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              currentAmountNum > 0
                ? isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/30 ring-2 ring-slate-900/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isIncome ? 'Guardar Ingreso' : '¡Guardar Gasto Ahora!'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
