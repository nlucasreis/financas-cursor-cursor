import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsViewProps {
  onOpenRecurring: () => void;
  onOpenExportImport: () => void;
  onResetDemo: () => void;
  monthlyBudget: number;
  onUpdateBudget: (budget: number) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenRecurring,
  onOpenExportImport,
  onResetDemo,
  monthlyBudget,
  onUpdateBudget,
  isDark,
  onToggleTheme,
}) => {
  return (
    <div className="pt-2 space-y-2.5">
      <button
        type="button"
        onClick={onToggleTheme}
        className="w-full bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-left transition-all hover:bg-zinc-100/80 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Aparência do App
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isDark ? 'Modo Escuro ativado' : 'Modo Claro ativado'}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full">
          {isDark ? 'Escuro' : 'Claro'}
        </span>
      </button>

      <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
          Orçamento Mensal
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-400">R$</span>
          <input
            type="number"
            value={monthlyBudget || ''}
            onChange={(e) => onUpdateBudget(Number(e.target.value) || 0)}
            placeholder="0,00"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-400 transition-all"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenRecurring}
        className="w-full flex items-center justify-between p-3.5 bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl text-left transition-all cursor-pointer group"
      >
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Contas Fixas e Recorrentes
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Gerenciar cobranças mensais automáticas
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0 ml-2" />
      </button>

      <button
        type="button"
        onClick={onOpenExportImport}
        className="w-full flex items-center justify-between p-3.5 bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl text-left transition-all cursor-pointer group"
      >
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Exportar e Importar
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Backup ou restauração em JSON / CSV
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0 ml-2" />
      </button>

      <button
        type="button"
        onClick={onResetDemo}
        className="w-full flex items-center justify-between p-3.5 bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl text-left transition-all cursor-pointer group"
      >
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Restaurar Dados Exemplo
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Recarregar transações de demonstração
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0 ml-2" />
      </button>
    </div>
  );
};
