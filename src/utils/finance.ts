import { Expense, MonthSummary, Category } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function parseAmountString(value: string): number {
  const cleaned = value.replace(/[^(\d.,)]/g, '').trim();
  if (!cleaned) return 0;

  let normalized = cleaned;
  if (cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  }

  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatAmountString(value: string | number): string {
  if (value === '' || value === null || value === undefined) return '';

  const numericValue = typeof value === 'number' ? value : parseAmountString(value.toString());
  if (numericValue === 0 && value.toString().trim() === '') return '';

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^0-9,]/g, '');
  if (!cleaned) return '';

  const hasComma = cleaned.includes(',');
  const [integerPart, decimalPart = ''] = cleaned.split(',');
  const integerDigits = integerPart.replace(/^0+(?=\d)/, '') || '0';
  const formattedInteger = Number(integerDigits).toLocaleString('pt-BR');

  if (!hasComma) {
    return formattedInteger;
  }

  const trimmedDecimal = decimalPart.slice(0, 2);
  return `${formattedInteger},${trimmedDecimal}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

export function formatShortDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const monthIdx = parseInt(month, 10) - 1;
  const monthName = months[monthIdx] || '';
  return `${day} de ${monthName}`;
}

export function getMonthYearLabel(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const monthNum = parseInt(month, 10);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthNames[monthNum - 1] || ''} de ${year}`;
}

export function getRelativeMonthYear(currentMonthYear: string, offset: number): string {
  const [year, month] = currentMonthYear.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function calculateMonthSummary(
  expenses: Expense[],
  categoriesMap?: Record<string, Category>
): MonthSummary {
  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let paidCount = 0;

  let essentialTotal = 0;
  let lifestyleTotal = 0;
  let otherTotal = 0;

  expenses.forEach((exp) => {
    const amt = exp.amount || 0;
    totalAmount += amt;

    if (exp.status === 'paid') {
      totalPaid += amt;
      paidCount += 1;
    } else {
      totalPending += amt;
    }

    if (categoriesMap && exp.categoryId) {
      const cat = categoriesMap[exp.categoryId];
      if (cat) {
        if (cat.type === 'essential' || cat.type === 'utility') {
          essentialTotal += amt;
        } else if (cat.type === 'lifestyle') {
          lifestyleTotal += amt;
        } else {
          otherTotal += amt;
        }
      } else {
        otherTotal += amt;
      }
    }
  });

  const percentPaid = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return {
    totalAmount,
    totalPaid,
    totalPending,
    paidCount,
    totalCount: expenses.length,
    percentPaid,
    essentialTotal,
    lifestyleTotal,
    otherTotal,
  };
}

