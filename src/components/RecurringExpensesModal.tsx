import React from 'react';
import { X, RefreshCw, Sparkles } from 'lucide-react';
import { Expense, Category } from '../types';
import { formatCurrency, getMonthYearLabel } from '../utils/finance';

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allExpenses: Expense[];
  categories: Category[];
  currentMonthYear: string;
  onImportRecurring: (targetMonthYear: string) => void;
}

export const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({
  isOpen,
  onClose,
  allExpenses,
  categories,
  currentMonthYear,
  onImportRecurring,
}) => {
  if (!isOpen) return null;

  // Find all unique recurring template expenses across all months
  const recurringTemplatesMap = new Map<string, Expense>();
  allExpenses.forEach((exp) => {
    if (exp.isRecurring) {
      // Key by title to avoid duplicates
      if (!recurringTemplatesMap.has(exp.title.toLowerCase())) {
        recurringTemplatesMap.set(exp.title.toLowerCase(), exp);
      }
    }
  });

  const recurringList = Array.from(recurringTemplatesMap.values());
  const totalRecurringAmount = recurringList.reduce((acc, curr) => acc + curr.amount, 0);

  const handleCopy = () => {
    onImportRecurring(currentMonthYear);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Contas Fixas & Recorrentes
              </h2>
              <p className="text-xs text-slate-500">
                Gere facilmente as contas fixas para {getMonthYearLabel(currentMonthYear)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p>
              Ao clicar no botão abaixo, todas as suas contas fixas (ex: Aluguel, Internet, Assinaturas) serão copiadas automaticamente com status <strong>Pendente</strong> para o mês de <strong>{getMonthYearLabel(currentMonthYear)}</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Modelos Cadastrados ({recurringList.length})</span>
              <span>Total Estimado: {formatCurrency(totalRecurringAmount)}</span>
            </div>

            {recurringList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                Nenhuma conta marcada como "Fixa Recorrente". Ao cadastrar uma nova conta, marque a caixa "Conta Fixa Recorrente".
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recurringList.map((exp) => (
                  <div key={exp.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {categories.find((c) => c.id === exp.categoryId)?.name || 'Categoria'}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            {recurringList.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar Contas em {getMonthYearLabel(currentMonthYear).split(' de ')[0]}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

