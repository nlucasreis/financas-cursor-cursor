import React, { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/finance';
import { BellRing, Check, X } from 'lucide-react';

interface DueAlertBannerProps {
  expenses: Expense[];
  onToggleStatus: (id: string) => void;
}

export function DueAlertBanner({ expenses, onToggleStatus }: DueAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Get current date string YYYY-MM-DD and tomorrow string YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const tmw = new Date(now);
  tmw.setDate(tmw.getDate() + 1);
  const tmwYear = tmw.getFullYear();
  const tmwMonth = String(tmw.getMonth() + 1).padStart(2, '0');
  const tmwDay = String(tmw.getDate()).padStart(2, '0');
  const tomorrowStr = `${tmwYear}-${tmwMonth}-${tmwDay}`;

  // Filter pending expenses due today or tomorrow
  const dueItems = expenses.filter(
    (e) => e.status === 'pending' && (e.dueDate === todayStr || e.dueDate === tomorrowStr)
  );

  if (dismissed || dueItems.length === 0) {
    return null;
  }

  const dueTodayCount = dueItems.filter((e) => e.dueDate === todayStr).length;
  const dueTomorrowCount = dueItems.filter((e) => e.dueDate === tomorrowStr).length;

  return (
    <div className="bg-amber-50/95 border border-amber-200 rounded-2xl p-3.5 shadow-2xs text-amber-950 transition-all animate-in fade-in slide-in-from-top-2 duration-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/15 rounded-xl text-amber-700 shrink-0">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Alerta de Vencimento
              </span>
              <span className="bg-amber-200 text-amber-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {dueItems.length}
              </span>
            </div>
            <p className="text-xs text-amber-800/90 font-medium mt-0.5">
              {dueTodayCount > 0 && dueTomorrowCount > 0 ? (
                <>
                  Você tem <strong className="text-amber-950">{dueTodayCount} conta(s) vencendo hoje</strong> e <strong className="text-amber-950">{dueTomorrowCount} amanhã</strong>.
                </>
              ) : dueTodayCount > 0 ? (
                <>
                  Você tem <strong className="text-amber-950">{dueTodayCount} conta(s) com vencimento hoje!</strong>
                </>
              ) : (
                <>
                  Atenção: <strong className="text-amber-950">{dueTomorrowCount} conta(s) vencem amanhã!</strong>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-amber-700 hover:text-amber-950 rounded-lg hover:bg-amber-100/80 transition-colors cursor-pointer"
          title="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List of expenses due today or tomorrow */}
      <div className="mt-2.5 pt-2 border-t border-amber-200/60 space-y-1.5">
        {dueItems.map((item) => {
          const isToday = item.dueDate === todayStr;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs bg-white/90 border border-amber-200/60 rounded-xl p-2 px-3 shadow-2xs"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider shrink-0 ${
                    isToday
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {isToday ? 'HOJE' : 'AMANHÃ'}
                </span>
                <span className="font-semibold text-slate-800 truncate">
                  {item.title}
                </span>
                <span className="text-slate-900 font-bold shrink-0">
                  {formatCurrency(item.amount)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleStatus(item.id)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-transform active:scale-95 cursor-pointer shrink-0 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Pagar</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
