import React, { useState } from 'react';
import { X } from 'lucide-react';
import { parseAmountString, formatAmountString, formatCurrencyInput } from '../utils/finance';
import { PaymentMethod, Expense } from '../types';

interface IosAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Partial<Expense>) => void;
  categories: Array<{ id: string; name: string }>;
  currentMonthYear: string;
}

const CATEGORY_OPTIONS = [
  { id: 'cat-groceries', label: 'Alimentação', matchName: 'Alimentação' },
  { id: 'cat-transport', label: 'Transporte', matchName: 'Transporte' },
  { id: 'cat-health', label: 'Saúde', matchName: 'Saúde' },
  { id: 'cat-subs', label: 'Assinatura', matchName: 'Assinatura' },
  { id: 'cat-groceries', label: 'Mercado', matchName: 'Mercado' },
  { id: 'cat-other', label: 'Outros', matchName: 'Outros' },
];

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; label: string }> = [
  { id: 'cash', label: 'Dinheiro' },
  { id: 'pix', label: 'Pix' },
  { id: 'debit', label: 'Débito' },
  { id: 'credit_card', label: 'Crédito' },
];

export const IosAddExpenseModal: React.FC<IosAddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  categories,
  currentMonthYear,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawAmount, setRawAmount] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>('Alimentação');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleNextFromStep1 = () => {
    const num = parseAmountString(rawAmount);
    if (num <= 0) {
      setErrorMessage('Digite um valor válido');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleSelectCategory = (catLabel: string) => {
    setSelectedCategoryLabel(catLabel);
    setStep(3);
  };

  const handleConfirmFinal = (pm?: PaymentMethod) => {
    const payment = pm || selectedPayment;
    const amountNum = parseAmountString(rawAmount);

    const catOption = CATEGORY_OPTIONS.find((c) => c.label === selectedCategoryLabel);
    let matchedCatId = 'cat-other';
    if (catOption) {
      const foundInProps = categories.find((c) =>
        c.name.toLowerCase().includes(catOption.label.toLowerCase())
      );
      matchedCatId = foundInProps ? foundInProps.id : catOption.id;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    onSaveExpense({
      title: titleInput.trim() || selectedCategoryLabel,
      amount: amountNum,
      dueDate: todayStr,
      categoryId: matchedCatId,
      paymentMethod: payment,
      status: 'paid',
      monthYear: currentMonthYear,
      isRecurring,
    });

    handleCloseAll();
  };

  const handleCloseAll = () => {
    setStep(1);
    setRawAmount('');
    setTitleInput('');
    setSelectedCategoryLabel('Alimentação');
    setSelectedPayment('pix');
    setIsRecurring(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/65 backdrop-blur-xl transition-all duration-200">
      {/* iOS 17/18 Native Style Alert Modal Container */}
      <div className="bg-white/95 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[28px] p-5 max-w-[290px] sm:max-w-[320px] w-full shadow-2xl text-slate-900 dark:text-white relative animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Step 1: Valor (iOS Alert Native Style) */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Qual o valor do gasto?
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Digite a quantia a ser registrada
              </p>
            </div>

            {/* Input Box with Clear Button */}
            <div className="space-y-2">
              <div className="bg-slate-100/80 dark:bg-[#1C1C1E]/60 border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between shadow-inner focus-within:border-zinc-500 transition-all">
                <span className="text-slate-500 dark:text-zinc-400 text-sm font-semibold pl-1">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0,00"
                  value={rawAmount}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d,]/g, '');
                    setRawAmount(formatCurrencyInput(cleaned));
                    if (errorMessage) setErrorMessage('');
                  }}
                  onBlur={() => setRawAmount(formatAmountString(rawAmount))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNextFromStep1();
                  }}
                  className="w-full bg-transparent text-center text-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none px-2"
                />
                {rawAmount ? (
                  <button
                    type="button"
                    onClick={() => setRawAmount('')}
                    className="p-1 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white active:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
                    title="Limpar valor"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-5" />
                )}
              </div>

              {/* Optional Title input */}
              <input
                type="text"
                placeholder="Descrição (opcional, ex: Almoço)"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full bg-slate-100/60 dark:bg-[#1C1C1E]/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all"
              />

              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-[#1C1C1E]/40 px-3 py-2 text-left">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">Conta fixa</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">Aparece na aba Fixas</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRecurring}
                  aria-label="Marcar conta como fixa"
                  onClick={() => setIsRecurring((current) => !current)}
                  className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                    isRecurring ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isRecurring ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {errorMessage && (
                <p className="text-rose-500 dark:text-rose-400 text-xs text-center font-medium pt-0.5">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Side-by-side iOS Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCloseAll}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#3A3A3C] dark:hover:bg-[#48484A] text-slate-800 dark:text-white rounded-2xl py-2.5 text-sm font-medium active:opacity-70 transition-opacity cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-2xl py-2.5 text-sm font-semibold active:opacity-70 transition-all cursor-pointer text-center shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Categoria */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Escolha a categoria
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione o tipo do gasto
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5 no-scrollbar">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleSelectCategory(cat.label)}
                  className={`p-2.5 rounded-2xl text-center text-xs font-semibold border transition-all cursor-pointer active:opacity-70 ${
                    selectedCategoryLabel === cat.label
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-700 dark:border-zinc-600'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1C1C1E]/60 dark:hover:bg-[#1C1C1E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#3A3A3C] dark:hover:bg-[#48484A] text-slate-800 dark:text-white rounded-2xl py-2.5 text-sm font-medium active:opacity-70 transition-opacity cursor-pointer text-center"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-2xl py-2.5 text-sm font-semibold active:opacity-70 transition-all cursor-pointer text-center shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Forma de Pagamento */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Forma de pagamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Como este valor foi pago?
              </p>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => {
                    setSelectedPayment(pm.id);
                    handleConfirmFinal(pm.id);
                  }}
                  className={`p-3 rounded-2xl text-center text-xs font-semibold border transition-all cursor-pointer active:opacity-70 ${
                    selectedPayment === pm.id
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-700 dark:border-zinc-600'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1C1C1E]/60 dark:hover:bg-[#1C1C1E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#3A3A3C] dark:hover:bg-[#48484A] text-slate-800 dark:text-white rounded-2xl py-2.5 text-sm font-medium active:opacity-70 transition-opacity cursor-pointer text-center"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmFinal()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-2xl py-2.5 text-sm font-semibold active:opacity-70 transition-all cursor-pointer text-center shadow-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
