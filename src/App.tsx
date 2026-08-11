/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Expense, 
  UserProfile, 
  MonthSummary 
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_EXPENSES, 
  INITIAL_USER,
  SAMPLE_EXPENSES,
} from './data/initialData';
import { 
  calculateMonthSummary, 
  getMonthYearLabel 
} from './utils/finance';

import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { motion, AnimatePresence } from 'motion/react';
import { DueAlertBanner } from './components/DueAlertBanner';
import { ExpenseList, SquareRecycleIcon } from './components/ExpenseList';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { IosAddExpenseModal } from './components/IosAddExpenseModal';
import { AnalyticsView } from './components/AnalyticsView';
import { RecurringExpensesModal } from './components/RecurringExpensesModal';
import { ExportImportModal } from './components/ExportImportModal';
import { FloatingNav, NavTab } from './components/FloatingNav';
import { SettingsView } from './components/SettingsView';
import { RotateCcw, Eye, EyeOff, ShieldCheck, Lock, Plus, ChevronDown, RefreshCw } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

const STORAGE_KEY_EXPENSES = 'financas_expenses_single_v2';
const STORAGE_KEY_USER = 'financas_user_single_v1';

export default function App() {
  const { theme, isDark, toggleTheme } = useTheme();
  // Current date month string default e.g. "2026-08"
  const today = new Date();
  const defaultMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [currentMonthYear, setCurrentMonthYear] = useState<string>(defaultMonthYear);
  const [activeTab, setActiveTab] = useState<'expenses' | 'analytics'>('expenses');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [showFixedAccounts, setShowFixedAccounts] = useState(false);

  // Load state from LocalStorage or Fallback
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading expenses', e);
    }
    return INITIAL_EXPENSES;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user profile', e);
    }
    return INITIAL_USER;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Mobile Pull-to-Refresh functionality
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startYRef = React.useRef<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const PULL_THRESHOLD = 60;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null || isRefreshing) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;
      if (diff > 0) {
        // Resistance pull distance
        const distance = Math.min(diff * 0.4, 90);
        setPullDistance(distance);
      } else {
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) return;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      // Perform reload / refresh data logic
      setTimeout(() => {
        try {
          const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
          if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses));
          }
          const savedUser = localStorage.getItem(STORAGE_KEY_USER);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (err) {
          console.error(err);
        }
        setIsRefreshing(false);
        setPullDistance(0);
      }, 800);
    } else {
      setPullDistance(0);
    }
  };

  // Filter current month expenses
  const monthExpenses = expenses.filter((e) => e.monthYear === currentMonthYear);
  const displayedAccountExpenses = showFixedAccounts
    ? monthExpenses.filter((expense) => expense.isRecurring)
    : monthExpenses;

  // Month Summary calculation
  const summary: MonthSummary = calculateMonthSummary(monthExpenses, user);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIosQuickAddOpen, setIsIosQuickAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  const handleNavChange = (nav: NavTab) => {
    setActiveNav(nav);
    if (nav === 'contas') {
      setActiveTab('expenses');
    }
  };

  // Handlers
  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (expenseData.id) {
      // Edit
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === expenseData.id ? ({ ...item, ...expenseData } as Expense) : item
        )
      );
    } else {
      // Add
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: expenseData.title || 'Nova Conta',
        amount: expenseData.amount || 0,
        dueDate: expenseData.dueDate || `${currentMonthYear}-10`,
        categoryId: expenseData.categoryId || INITIAL_CATEGORIES[0].id,
        paymentMethod: expenseData.paymentMethod || 'pix',
        status: expenseData.status || 'pending',
        monthYear: currentMonthYear,
        isRecurring: expenseData.isRecurring || false,
        notes: expenseData.notes,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta conta?')) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDuplicateExpense = (expense: Expense) => {
    const duplicated: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      title: `${expense.title} (Cópia)`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [duplicated, ...prev]);
  };

  const handleToggleStatus = (id: string) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'paid' ? 'pending' : 'paid' }
          : item
      )
    );
  };

  // Import recurring expenses from templates/prev month into current month
  const handleImportRecurring = (targetMonthYear: string) => {
    // Unique recurring templates by title
    const templates = new Map<string, Expense>();
    expenses.forEach((e) => {
      if (e.isRecurring) {
        templates.set(e.title.toLowerCase(), e);
      }
    });

    const newExpenses: Expense[] = [];
    templates.forEach((template) => {
      // Check if already exists in target month
      const exists = expenses.some(
        (e) => e.monthYear === targetMonthYear && e.title.toLowerCase() === template.title.toLowerCase()
      );
      if (!exists) {
        const [, , day] = template.dueDate.split('-');
        newExpenses.push({
          ...template,
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          monthYear: targetMonthYear,
          dueDate: `${targetMonthYear}-${day || '10'}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newExpenses.length > 0) {
      setExpenses((prev) => [...newExpenses, ...prev]);
      alert(`${newExpenses.length} conta(s) recorrente(s) gerada(s) para ${getMonthYearLabel(targetMonthYear)}!`);
    } else {
      alert('As contas recorrentes já estão cadastradas neste mês!');
    }
  };

  const handleResetSampleData = () => {
    if (confirm('Deseja restaurar as transações de demonstração? Isso substituirá todas as contas atuais.')) {
      setExpenses(SAMPLE_EXPENSES);
      setUser(INITIAL_USER);
      setCurrentMonthYear('2026-08');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-zinc-200 dark:bg-zinc-950 flex items-center justify-center sm:p-6 font-sans antialiased selection:bg-slate-900 selection:text-white p-safe transition-colors duration-300">
      {/* iPhone Device Frame */}
      <div className="relative w-full max-w-[393px] h-[852px] max-h-[100dvh] sm:max-h-[96vh] bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-slate-100 rounded-none sm:rounded-[48px] border-0 sm:border-[12px] border-zinc-800 shadow-none sm:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden transition-colors duration-300">
        
        {/* Dynamic Island Notch - Hidden on standalone mobile PWA view, visible on desktop frame */}
        <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 items-center justify-between px-3 pointer-events-none shadow-md">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full ring-1 ring-zinc-800" />
          <div className="w-2 h-2 bg-blue-900/60 rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="pt-3 sm:pt-3 px-7 pb-1 pt-safe flex justify-between items-center text-[10px] font-semibold text-slate-900 dark:text-slate-100 z-40 select-none pointer-events-none">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span>5G</span>
            <div className="w-4 h-2 border border-slate-800 dark:border-slate-200 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-800 dark:bg-slate-200 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Main Screen Content */}
        <div
          id="iphone-scroll-container"
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto px-4 py-2 pb-28 pb-safe space-y-5 no-scrollbar bg-slate-50 dark:bg-zinc-900 transition-colors duration-300 relative"
        >
          {/* Pull to Refresh Indicator */}
          <motion.div
            initial={false}
            animate={{
              height: isRefreshing ? 46 : pullDistance,
              opacity: pullDistance > 8 || isRefreshing ? 1 : 0,
            }}
            transition={isRefreshing || pullDistance === 0 ? { type: 'spring', stiffness: 320, damping: 26 } : { duration: 0 }}
            className="w-full flex items-center justify-center overflow-hidden shrink-0 pointer-events-none -mb-3 pt-1"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 py-1.5 px-3.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-full shadow-sm border border-zinc-200/80 dark:border-zinc-700/80">
              <RefreshCw
                className={`w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200 ${isRefreshing ? 'animate-spin' : ''}`}
                style={{
                  transform: !isRefreshing ? `rotate(${Math.min(pullDistance * 3.5, 180)}deg)` : undefined
                }}
              />
              <span>
                {isRefreshing
                  ? 'Atualizando...'
                  : pullDistance >= PULL_THRESHOLD
                  ? 'Solte para atualizar'
                  : 'Puxe para atualizar'}
              </span>
            </div>
          </motion.div>

          {/* Navigation Header */}
          <Navbar
            title={
              activeNav === 'ajustes'
                ? 'Ajustes'
                : 'Finanças'
            }
          />

          {/* Main Content */}
          <main className="w-full space-y-5">
            {activeNav !== 'ajustes' && (
              <>
                <DueAlertBanner
                  expenses={expenses}
                  onToggleStatus={handleToggleStatus}
                />

                <SummaryCards
                  summary={summary}
                  monthYear={currentMonthYear}
                  showDetails={activeNav === 'contas'}
                  onToggleDetails={() => setShowFixedAccounts((current) => !current)}
                  onOpenAddExpense={() => setIsIosQuickAddOpen(true)}
                  actionLabel={showFixedAccounts ? 'Contas recentes' : 'Contas Fixas'}
                  onChangeMonth={(monthYear) => setCurrentMonthYear(monthYear)}
                  onMonthMenuToggle={(open) => setIsMonthDropdownOpen(open)}
                />
              </>
            )}

            {activeNav === 'home' && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5 px-1 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      Últimas transações
                    </h2>

                    {/* Category Option: Small Downward Arrow right next to title */}
                    <div className="relative inline-flex items-center cursor-pointer group pt-0.5">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        aria-label="Filtrar categorias"
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="all">Todas as categorias</option>
                        {INITIAL_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Ver todas */}
                  <button
                    type="button"
                    onClick={() => setActiveNav('contas')}
                    aria-label="Ver todas as contas e filtros"
                    className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Ver todas
                  </button>
                </div>

                <ExpenseList
                  expenses={monthExpenses}
                  categories={INITIAL_CATEGORIES}
                  selectedCategory={selectedCategory}
                  onEditExpense={(exp) => {
                    setEditingExpense(exp);
                    setIsExpenseModalOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                  onDuplicateExpense={handleDuplicateExpense}
                  onToggleStatus={handleToggleStatus}
                  onOpenAddModal={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              </div>
            )}

            {activeNav === 'contas' && (
              <div className="pt-2">
                <ExpenseList
                  expenses={displayedAccountExpenses}
                  categories={INITIAL_CATEGORIES}
                  selectedCategory={selectedCategory}
                  onEditExpense={(exp) => {
                    setEditingExpense(exp);
                    setIsExpenseModalOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                  onDuplicateExpense={handleDuplicateExpense}
                  onToggleStatus={handleToggleStatus}
                  onOpenAddModal={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              </div>
            )}

            {activeNav === 'fixas' && (
              <div className="pt-2 space-y-3">
                <div className="px-1">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Contas cadastradas como fixas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {displayedAccountExpenses.length === 1
                      ? '1 conta será reutilizada nos próximos meses.'
                      : `${displayedAccountExpenses.length} contas serão reutilizadas nos próximos meses.`}
                  </p>
                </div>
                <ExpenseList
                  expenses={displayedAccountExpenses}
                  categories={INITIAL_CATEGORIES}
                  selectedCategory="all"
                  onEditExpense={(exp) => {
                    setEditingExpense(exp);
                    setIsExpenseModalOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                  onDuplicateExpense={handleDuplicateExpense}
                  onToggleStatus={handleToggleStatus}
                  onOpenAddModal={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              </div>
            )}

            {activeNav === 'ajustes' && (
              <SettingsView
                onOpenRecurring={() => setIsRecurringModalOpen(true)}
                onOpenExportImport={() => setIsExportImportOpen(true)}
                onResetDemo={handleResetSampleData}
                monthlyBudget={user.monthlyBudget}
                onUpdateBudget={(budget) => setUser((prev) => ({ ...prev, monthlyBudget: budget }))}
                isDark={isDark}
                onToggleTheme={toggleTheme}
              />
            )}
          </main>
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-white/70 rounded-full z-50 pointer-events-none" />

        {/* Modals */}
        <IosAddExpenseModal
          isOpen={isIosQuickAddOpen}
          onClose={() => setIsIosQuickAddOpen(false)}
          onSaveExpense={handleSaveExpense}
          categories={INITIAL_CATEGORIES}
          currentMonthYear={currentMonthYear}
        />

        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          initialExpense={editingExpense}
          categories={INITIAL_CATEGORIES}
          currentMonthYear={currentMonthYear}
        />

        <RecurringExpensesModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          allExpenses={expenses}
          categories={INITIAL_CATEGORIES}
          currentMonthYear={currentMonthYear}
          onImportRecurring={handleImportRecurring}
        />

        <ExportImportModal
          isOpen={isExportImportOpen}
          onClose={() => setIsExportImportOpen(false)}
          expenses={monthExpenses}
          allExpenses={expenses}
          categories={INITIAL_CATEGORIES}
          user={user}
          summary={summary}
          currentMonthYear={currentMonthYear}
          onRestoreData={(newExp, newUser) => {
            setExpenses(newExp);
            if (newUser) setUser(newUser);
          }}
        />

        {/* iOS Floating Bottom Navigation */}
        <FloatingNav
          activeNav={activeNav}
          setActiveNav={handleNavChange}
          hidden={isMonthDropdownOpen}
        />
      </div>
    </div>
  );
}
