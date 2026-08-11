import React from 'react';

interface NavbarProps {
  title?: string;
  activeTab?: 'expenses' | 'analytics';
  setActiveTab?: (tab: 'expenses' | 'analytics') => void;
  onOpenAddExpense?: () => void;
  onOpenRecurring?: () => void;
  onOpenExportImport?: () => void;
  showDetails?: boolean;
  onToggleShowDetails?: () => void;
  onUpdateMonthlyBudget?: (budget: number) => void;
  user?: { name: string; monthlyBudget: number };
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Finanças' }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-zinc-800/80 pt-6 pb-3 -mx-4 px-4 transition-colors">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">
          {title}
        </h1>
      </div>
    </header>
  );
};




