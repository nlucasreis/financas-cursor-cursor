import React, { useState } from 'react';
import { MonthSummary } from '../types';
import { formatCurrency, getMonthYearLabel, getRelativeMonthYear } from '../utils/finance';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthSummary;
  monthYear?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  onOpenAddExpense?: () => void;
  actionLabel?: string;
  onChangeMonth?: (monthYear: string) => void;
  onMonthMenuToggle?: (open: boolean) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  monthYear = '2026-08',
  showDetails,
  onToggleDetails,
  onOpenAddExpense,
  actionLabel,
  onChangeMonth,
  onMonthMenuToggle,
}) => {
  const getMonthShort = (my: string) => {
    const [, month] = my.split('-');
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const idx = parseInt(month, 10) - 1;
    return months[idx] || 'MÊS';
  };

  const formattedTotal = summary.totalAmount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPending = summary.totalPending.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPaid = summary.totalPaid.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);

  const today = new Date();
  const todayMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const monthOptions = Array.from({ length: 12 }, (_, index) =>
    getRelativeMonthYear(todayMonthYear, -(index + 1))
  );

  const formatDropdownLabel = (monthYearItem: string) => {
    const [year, month] = monthYearItem.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[parseInt(month, 10) - 1] || '';
    return year === String(today.getFullYear())
      ? monthName
      : `${monthName} ${year}`;
  };

  const closeMonthMenu = () => {
    setIsMonthMenuOpen(false);
    if (onMonthMenuToggle) onMonthMenuToggle(false);
  };

  const handleMonthSelect = (month: string) => {
    closeMonthMenu();
    if (onChangeMonth) onChangeMonth(month);
  };

  const handleSelectCurrentMonth = () => {
    closeMonthMenu();
    if (onChangeMonth) onChangeMonth(todayMonthYear);
  };

  return (
    <div className="max-w-xl mx-auto w-full relative mb-6">
      {/* Expanding/Retracting Card Box */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 32,
          mass: 0.8,
        }}
        className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-zinc-800/90 relative overflow-visible"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!showDetails ? (
            /* 1. Main Hero Card (Início Tab) */
            <motion.div
              key="inicio-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium relative">
                <span>Total gastos esse mês</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthMenuOpen((prev) => {
                      const next = !prev;
                      if (onMonthMenuToggle) onMonthMenuToggle(next);
                      return next;
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>{formatDropdownLabel(monthYear)}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isMonthMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMonthMenuOpen && (
                  <div className="absolute top-10 right-0 z-20 w-56 rounded-3xl border border-slate-700 bg-zinc-900 px-2 py-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={handleSelectCurrentMonth}
                      className="w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      Este mês ({formatDropdownLabel(todayMonthYear)})
                    </button>
                    <div className="my-2 h-px bg-slate-700" />
                    {monthOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMonthSelect(option)}
                        className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        {formatDropdownLabel(option)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Big Amount Figure */}
              <div className="my-3">
                <div className="text-3xl sm:text-[2.25rem] font-summary-number text-white tabular-nums leading-tight">
                  {summary.totalAmount > 0 ? `R$ -${formattedTotal}` : 'R$ 0,00'}
                </div>
              </div>

              {/* Bottom Sub-metrics */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pendente</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    R$ {formattedPending}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Pago</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    R$ {formattedPaid}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* 2. Detailed Unified Card (Contas Tab) */
            <motion.div
              key="contas-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Column: Title, Total, and Dot Breakdown */}
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      {getMonthShort(monthYear)} · RESUMO DE CONTAS
                    </span>
                    <div className="text-2xl sm:text-3xl font-summary-number text-white tabular-nums tracking-tight mt-1">
                      {summary.totalAmount > 0 ? `R$ ${formattedTotal}` : 'R$ 0,00'}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      total em {summary.totalCount} {summary.totalCount === 1 ? 'fatura' : 'faturas'}
                    </span>
                  </div>

                  {/* Vertical list with colored status dots */}
                  <div className="space-y-1.5 pt-1 text-xs font-medium">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="tabular-nums font-semibold">R$ {formattedPaid}</span>
                      <span className="text-slate-400 text-[11px]">pago</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="tabular-nums font-semibold">R$ {formattedPending}</span>
                      <span className="text-slate-400 text-[11px]">a vencer</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sleek Progress Ring */}
                {(() => {
                  const percentPaid =
                    summary.totalAmount > 0
                      ? Math.min(100, Math.round((summary.totalPaid / summary.totalAmount) * 100))
                      : 0;
                  const radius = 32;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (percentPaid / 100) * circumference;

                  return (
                    <div className="flex flex-col items-center justify-center shrink-0 pr-1">
                      <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                          {/* Background Track */}
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className="text-zinc-800"
                            strokeWidth="5.5"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          {/* Progress Stroke */}
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className="text-emerald-400 transition-all duration-500 ease-out"
                            strokeWidth="5.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                            {percentPaid}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            pago
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlapping 'Adicionar conta' Pill Button */}
        {(onOpenAddExpense || onToggleDetails) && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={showDetails ? onToggleDetails : onOpenAddExpense}
              className="bg-white hover:bg-slate-100 text-zinc-700 hover:text-zinc-900 font-semibold text-xs py-2 px-5 rounded-full shadow-md border border-slate-200/80 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {showDetails ? actionLabel || 'Adicionar conta' : 'Adicionar conta'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
