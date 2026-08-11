import React from 'react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Expense, Category, MonthSummary } from '../types';
import { formatCurrency } from '../utils/finance';
import { PieChart, BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  expenses: Expense[];
  categories: Category[];
  summary: MonthSummary;
}

const COLORS = [
  '#4f46e5', '#059669', '#d97706', '#0891b2', 
  '#e11d48', '#2563eb', '#db2777', '#9333ea', '#475569'
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  categories,
  summary,
}) => {
  // 1. Group by category
  const categoryData = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const totalAmount = catExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      name: cat.name,
      value: totalAmount,
      count: catExpenses.length,
    };
  }).filter((c) => c.value > 0);

  // 2. Group by Payment Method
  const paymentMethodsMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const method = e.paymentMethod || 'pix';
    paymentMethodsMap[method] = (paymentMethodsMap[method] || 0) + e.amount;
  });

  const methodNames: Record<string, string> = {
    pix: 'Pix',
    credit_card: 'Cartão de Crédito',
    debit: 'Débito',
    boleto: 'Boleto',
    auto_debit: 'Débito Automático',
    cash: 'Dinheiro',
  };

  const paymentData = Object.keys(paymentMethodsMap).map((m) => ({
    method: methodNames[m] || m,
    Valor: paymentMethodsMap[m],
  }));

  // 3. Essential vs Lifestyle
  let essentialTotal = 0;
  let lifestyleTotal = 0;
  let otherTotal = 0;

  expenses.forEach((e) => {
    const cat = categories.find((c) => c.id === e.categoryId);
    if (cat?.type === 'essential' || cat?.type === 'utility') {
      essentialTotal += e.amount;
    } else if (cat?.type === 'lifestyle') {
      lifestyleTotal += e.amount;
    } else {
      otherTotal += e.amount;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-zinc-800 p-6 rounded-2xl text-white shadow-sm border border-slate-800 dark:border-zinc-700/60 transition-colors">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Análise Financeira Pessoal
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">
            Distribuição de Gastos do Mês
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Entenda para onde está indo o seu dinheiro, quais categorias consomem mais orçamento e acompanhe seu fluxo de caixa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Gastos por Categoria</span>
              </h3>
              <p className="text-xs text-slate-500">
                Divisão do total de {formatCurrency(summary.totalAmount)}
              </p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Nenhuma conta cadastrada no mês para gerar o gráfico.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Valor']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2. Payment Method Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Gastos por Forma de Pagamento</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pix, Cartões, Débito e Boletos
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="method" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v}`} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val)]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="Valor" fill="#52525b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Essential vs Lifestyle Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Natureza dos Gastos (Regra de Saúde Financeira)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
            <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold uppercase tracking-wider">
              Contas Essenciais & Moradia
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(essentialTotal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.totalAmount > 0 ? ((essentialTotal / summary.totalAmount) * 100).toFixed(1) : 0}% do total do mês
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
            <div className="text-xs text-rose-800 dark:text-rose-300 font-semibold uppercase tracking-wider">
              Lazer & Estilo de Vida
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(lifestyleTotal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.totalAmount > 0 ? ((lifestyleTotal / summary.totalAmount) * 100).toFixed(1) : 0}% do total do mês
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
              Outros Gastos
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(otherTotal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.totalAmount > 0 ? ((otherTotal / summary.totalAmount) * 100).toFixed(1) : 0}% do total do mês
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

