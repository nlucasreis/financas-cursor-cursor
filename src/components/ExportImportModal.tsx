import React, { useState } from 'react';
import { X, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Expense, Category, UserProfile, MonthSummary, PaymentMethod } from '../types';
import { formatCurrency, formatDateBR, getMonthYearLabel } from '../utils/finance';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  allExpenses: Expense[];
  categories: Category[];
  user: UserProfile;
  summary: MonthSummary;
  currentMonthYear: string;
  onRestoreData: (expenses: Expense[], user: UserProfile) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  allExpenses,
  categories,
  user,
  summary,
  currentMonthYear,
  onRestoreData,
}) => {
  const [importJson, setImportJson] = useState('');

  if (!isOpen) return null;

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    switch (method) {
      case 'pix': return 'Pix';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit': return 'Débito';
      case 'boleto': return 'Boleto';
      case 'auto_debit': return 'Débito Automático';
      case 'cash': return 'Dinheiro';
      default: return 'Pix';
    }
  };

  // CSV Generator
  const generateCSV = () => {
    const headers = ['Titulo', 'Valor (R$)', 'Vencimento', 'Categoria', 'Forma de Pagamento', 'Status', 'Notas'];
    const rows = expenses.map((exp) => {
      const cat = categories.find((c) => c.id === exp.categoryId)?.name || 'Outros';
      return [
        `"${exp.title.replace(/"/g, '""')}"`,
        exp.amount.toFixed(2),
        exp.dueDate,
        `"${cat}"`,
        `"${getPaymentMethodLabel(exp.paymentMethod)}"`,
        exp.status === 'paid' ? 'Pago' : 'Pendente',
        `"${(exp.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    return [headers.join(';'), ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(generateCSV());
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Financas_${currentMonthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupJSON = () => {
    const backupObj = {
      version: 2,
      exportedAt: new Date().toISOString(),
      user,
      expenses: allExpenses,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `Backup_Financas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreJSON = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (parsed && Array.isArray(parsed.expenses)) {
        onRestoreData(parsed.expenses, parsed.user || user);
        alert('Dados restaurados com sucesso!');
        onClose();
      } else {
        alert('Formato de arquivo JSON inválido.');
      }
    } catch (err) {
      alert('Erro ao ler JSON. Verifique se o texto colado é um JSON válido.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Exportar & Backup
              </h2>
              <p className="text-xs text-slate-500">
                Baixe relatórios em Excel/CSV ou salve cópias de segurança
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
          {/* Option 1: CSV Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Planilha Excel/CSV do Mês</span>
            </div>
            <p className="text-xs text-slate-500">
              Gera um arquivo .CSV pronto para abrir no Microsoft Excel, Google Sheets ou Apple Numbers com todos os gastos de {getMonthYearLabel(currentMonthYear)}.
            </p>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Planilha CSV</span>
            </button>
          </div>

          {/* Option 2: JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Backup Geral dos Dados (JSON)</span>
            </div>
            <p className="text-xs text-slate-500">
              Salva um arquivo completo de segurança com todas as suas contas de todos os meses e configurações.
            </p>
            <button
              onClick={handleBackupJSON}
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo de Backup</span>
            </button>
          </div>

          {/* Option 3: Restore */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Restaurar Backup</span>
            </div>
            <textarea
              rows={2}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Cole o conteúdo do seu arquivo .JSON de backup aqui..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden dark:text-white"
            />
            {importJson.trim() && (
              <button
                onClick={handleRestoreJSON}
                className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-all"
              >
                Restaurar Agora
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

