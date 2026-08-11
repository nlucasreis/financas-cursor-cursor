import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText, Repeat, CreditCard } from 'lucide-react';
import { Category, Expense, PaymentMethod } from '../types';
import { formatAmountString, formatCurrencyInput, parseAmountString } from '../utils/finance';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<Expense>) => void;
  initialExpense?: Expense | null;
  categories: Category[];
  currentMonthYear: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
  categories,
  currentMonthYear,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-groceries');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(formatAmountString(initialExpense.amount));
      setDueDate(initialExpense.dueDate);
      setCategoryId(initialExpense.categoryId);
      setPaymentMethod(initialExpense.paymentMethod || 'pix');
      setStatus(initialExpense.status);
      setIsRecurring(initialExpense.isRecurring || false);
      setNotes(initialExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      const today = new Date();
      const defaultDay = String(Math.min(today.getDate(), 28)).padStart(2, '0');
      setDueDate(`${currentMonthYear}-${defaultDay}`);
      setCategoryId(categories[0]?.id || 'cat-housing');
      setPaymentMethod('pix');
      setStatus('pending');
      setIsRecurring(false);
      setNotes('');
    }
  }, [initialExpense, isOpen, currentMonthYear, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmountString(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um título válido e um valor maior que R$ 0,00.');
      return;
    }

    onSave({
      id: initialExpense?.id,
      title: title.trim(),
      amount: parsedAmount,
      dueDate,
      categoryId,
      paymentMethod,
      status,
      isRecurring,
      notes: notes.trim() || undefined,
      monthYear: initialExpense?.monthYear || currentMonthYear,
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialExpense ? 'Editar Conta' : 'Adicionar Nova Conta'}
            </h2>
            <p className="text-xs text-slate-500">
              Preencha os detalhes para controlar suas despesas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Descrição / Nome da Conta
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aluguel, Supermercado, Luz..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9,]/g, '');
                    setAmount(formatCurrencyInput(cleaned));
                  }}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Categoria</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data de Vencimento</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Forma de Pagamento</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
            >
              <option value="pix">Pix</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit">Débito</option>
              <option value="boleto">Boleto</option>
              <option value="auto_debit">Débito Automático</option>
              <option value="cash">Dinheiro</option>
            </select>
          </div>

          {/* Status & Recurring Toggle */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status do Pagamento
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    status === 'pending'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pendente
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    status === 'paid'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pago
                </button>
              </div>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="min-w-0">
                  <div className="flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Repeat className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span>Conta fixa</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Aparece na aba Fixas</p>
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
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações / Anotação (Opcional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Código de barras, número da parcela, comprovante..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 focus:outline-hidden dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-zinc-700 hover:text-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xs transition-colors active:scale-[0.98] cursor-pointer"
            >
              {initialExpense ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
