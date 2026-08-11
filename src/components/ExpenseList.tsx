import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { formatShortDateBR } from '../utils/finance';
import { Tag, Plus } from 'lucide-react';

export const SquareRecycleIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M7 9h4V5" />
    <path d="M11 9A4 4 0 0 1 15 13" />
    <path d="M17 15h-4v4" />
    <path d="M13 15A4 4 0 0 1 9 11" />
  </svg>
);

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  selectedCategory?: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onDuplicateExpense: (expense: Expense) => void;
  onToggleStatus: (expenseId: string) => void;
  onOpenAddModal: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  selectedCategory = 'all',
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) => {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const getCategory = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        id: 'cat-other',
        name: 'Outros',
        iconName: 'Tag',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50 border-slate-200',
        type: 'other' as const,
      }
    );
  };

  const getPaymentMethodLabel = (method: Expense['paymentMethod']) => {
    switch (method) {
      case 'pix':
        return 'Pix';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit':
        return 'Débito';
      case 'boleto':
        return 'Boleto';
      case 'auto_debit':
        return 'Débito Automático';
      case 'cash':
        return 'Dinheiro';
      default:
        return 'Pix';
    }
  };

  // Filtered expenses logic
  const filteredExpenses = expenses.filter((exp) => {
    return selectedCategory === 'all' || exp.categoryId === selectedCategory;
  });

  return (
    <div className="bg-white dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs overflow-hidden transition-colors">
      {filteredExpenses.length === 0 ? (
        <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
            <Tag className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhuma transação encontrada
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {expenses.length === 0
                ? 'Nenhuma conta cadastrada para este mês. Adicione sua primeira conta no botão abaixo!'
                : 'Nenhum lançamento encontrado nesta categoria.'}
            </p>
          </div>
          {expenses.length === 0 && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-2 flex items-center space-x-2 bg-white hover:bg-slate-100 text-zinc-700 hover:text-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Primeira Conta</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-zinc-700/50">
          {filteredExpenses.map((expense) => {
            const category = getCategory(expense.categoryId);

            const formattedAmount = expense.amount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            const isSelected = selectedExpenseId === expense.id;

            return (
              <div key={expense.id} className="transition-colors relative overflow-hidden">
                <div
                  onClick={() =>
                    setSelectedExpenseId((prev) => (prev === expense.id ? null : expense.id))
                  }
                  className={`p-2 sm:px-3 sm:py-2.5 transition-all duration-400 ease-out min-h-[4rem] rounded-lg cursor-pointer group bg-white dark:bg-zinc-800 ${
                    isSelected ? 'pr-28' : 'pr-4'
                  } ${isSelected ? '-translate-x-1' : 'translate-x-0'}`}
                >
                  <div className="relative flex items-center justify-between min-h-[3rem] gap-3 overflow-hidden">
                    <div className="relative flex-1 min-w-0">
                      <div className={`relative z-20 transition-all duration-400 ease-out ${
                        isSelected ? 'opacity-0 translate-x-[-1rem]' : 'opacity-100 translate-x-0'
                      }`}>
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">{expense.title}</div>
                        <div className={`mt-1 overflow-hidden transition-all duration-400 ease-out text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-normal ${
                          isSelected ? 'opacity-0 max-h-0' : 'opacity-100 max-h-6'
                        }`}>{getPaymentMethodLabel(expense.paymentMethod)}</div>
                      </div>
                    </div>

                    <div className={`flex flex-col items-end justify-center min-w-[6rem] transition-all duration-400 ease-out ${
                      isSelected ? 'opacity-0 max-w-0' : 'opacity-100 max-w-full'
                    }`}>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-tight">-R$ {formattedAmount}</div>
                      <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-normal">{formatShortDateBR(expense.dueDate)}</div>
                    </div>

                    <div className={`absolute inset-y-0 left-4 right-24 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-start overflow-hidden pl-4 pr-4 transition-all duration-400 ease-out ${
                      isSelected ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}>
                      <div className="w-full min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight truncate leading-tight">{expense.title}</div>
                        <div className="mt-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">-R$ {formattedAmount}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2 transition-all duration-400 ease-out ${
                    isSelected
                      ? 'opacity-100 translate-x-0 pointer-events-auto'
                      : 'opacity-0 translate-x-4 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExpense(expense);
                    }}
                    className="h-7 rounded-xl px-2.5 text-[11px] font-semibold text-slate-900 bg-transparent border border-slate-200/60 dark:border-zinc-700/60 transition-all duration-900 ease-in-out hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExpense(expense.id);
                      setSelectedExpenseId(null);
                    }}
                    className="h-7 rounded-xl px-2.5 text-[11px] font-semibold text-red-600 bg-transparent border border-red-600/40 transition-all duration-900 ease-in-out hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
