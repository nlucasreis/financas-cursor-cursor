import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { getMonthYearLabel, getRelativeMonthYear } from '../utils/finance';

interface MonthPickerProps {
  currentMonthYear: string;
  setMonthYear: (monthYear: string) => void;
  onCopyFromPreviousMonth?: () => void;
  hasExpensesThisMonth: boolean;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  currentMonthYear,
  setMonthYear,
  onCopyFromPreviousMonth,
  hasExpensesThisMonth,
}) => {
  const today = new Date();
  const todayMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isToday = currentMonthYear === todayMonthYear;

  const handlePrevMonth = () => {
    setMonthYear(getRelativeMonthYear(currentMonthYear, -1));
  };

  const handleNextMonth = () => {
    setMonthYear(getRelativeMonthYear(currentMonthYear, 1));
  };

  const handleToday = () => {
    setMonthYear(todayMonthYear);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs gap-3">
      {/* Month Navigator */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {getMonthYearLabel(currentMonthYear)}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {!isToday && (
          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-slate-200/80 dark:border-zinc-700 cursor-pointer"
          >
            Mês Atual
          </button>
        )}
      </div>

      {/* Copy From Previous Month shortcut if empty */}
      {!hasExpensesThisMonth && onCopyFromPreviousMonth && (
        <button
          onClick={onCopyFromPreviousMonth}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Copiar Contas Recorrentes do Mês Anterior</span>
        </button>
      )}
    </div>
  );
};
