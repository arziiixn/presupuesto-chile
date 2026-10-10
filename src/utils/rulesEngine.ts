import { AutomationRule, BudgetCategory, Transaction, CategorySpending, MonthlySummary } from '../types/finance';

// Normalize text for robust accent-insensitive matching
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface MatchResult {
  categoryId: string;
  rule: AutomationRule;
  matchedPattern: string;
}

export function matchCategoryByRules(
  description: string,
  merchant: string | undefined,
  rules: AutomationRule[]
): MatchResult | null {
  const normDesc = normalizeText(description);
  const normMerchant = normalizeText(merchant || '');
  const combined = `${normDesc} ${normMerchant}`.trim();

  // Sort rules by priority (ascending: 1 has higher priority than 2)
  const activeRules = rules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of activeRules) {
    if (rule.conditionType === 'contains_keyword') {
      const keywords = rule.pattern
        .split(',')
        .map((k) => normalizeText(k))
        .filter((k) => k.length > 0);

      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          return {
            categoryId: rule.targetCategoryId,
            rule,
            matchedPattern: keyword,
          };
        }
      }
    } else if (rule.conditionType === 'exact_merchant') {
      const targetMerchant = normalizeText(rule.pattern);
      if (normMerchant === targetMerchant || normDesc.includes(targetMerchant)) {
        return {
          categoryId: rule.targetCategoryId,
          rule,
          matchedPattern: targetMerchant,
        };
      }
    } else if (rule.conditionType === 'regex') {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(combined)) {
          return {
            categoryId: rule.targetCategoryId,
            rule,
            matchedPattern: rule.pattern,
          };
        }
      } catch {
        // Ignore invalid regex safely
      }
    }
  }

  return null;
}

export interface ParsedQuickEntry {
  type: 'expense' | 'income';
  amount: number | null;
  description: string;
  merchant?: string;
  autoCategoryId: string | null;
  matchedRuleName?: string;
  matchedKeyword?: string;
}

export function parseNaturalLanguageInput(
  rawInput: string,
  rules: AutomationRule[],
  categories: BudgetCategory[]
): ParsedQuickEntry {
  const cleanInput = rawInput.trim();
  if (!cleanInput) {
    return {
      type: 'expense',
      amount: null,
      description: '',
      autoCategoryId: categories[0]?.id || null,
    };
  }

  // Detect type (income vs expense)
  const isIncome = /\b(nomina|salario|ingreso|sueldo|pago recibido|cobro|deposito|bonus)\b/i.test(cleanInput);
  const type = isIncome ? 'income' : 'expense';

  // Extract amount: e.g. "14.50", "14,50", "$45", "45€", "350"
  // Match digits with optional decimals
  const amountRegex = /(?:[$€]?\s*)(\d+(?:[.,]\d{1,2})?)(?:\s*[$€])?/i;
  const amountMatch = cleanInput.match(amountRegex);
  let amount: number | null = null;
  let remainingText = cleanInput;

  if (amountMatch && amountMatch[1]) {
    const rawNum = amountMatch[1].replace(',', '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
      // Remove amount from text to get clean description
      remainingText = cleanInput.replace(amountMatch[0], ' ').trim();
    }
  }

  // Clean description
  remainingText = remainingText.replace(/\s+/g, ' ').trim();
  const description = remainingText || (amount ? `Gasto de ${amount}` : 'Nuevo movimiento');

  // Match category via automation rules
  const match = matchCategoryByRules(description, undefined, rules);

  return {
    type,
    amount,
    description,
    autoCategoryId: match?.categoryId || (type === 'income' ? 'cat_savings' : categories[0]?.id || null),
    matchedRuleName: match?.rule.name,
    matchedKeyword: match?.matchedPattern,
  };
}

export function applyRulesToAllTransactions(
  transactions: Transaction[],
  rules: AutomationRule[]
): { updatedTransactions: Transaction[]; updatedCount: number } {
  let updatedCount = 0;
  const updatedTransactions = transactions.map((tx) => {
    // Only re-categorize expenses where rules match
    if (tx.type === 'expense') {
      const match = matchCategoryByRules(tx.description, tx.merchant, rules);
      if (match && match.categoryId !== tx.categoryId) {
        updatedCount++;
        return {
          ...tx,
          categoryId: match.categoryId,
          autoCategorizedRuleName: match.rule.name,
        };
      }
    }
    return tx;
  });

  return { updatedTransactions, updatedCount };
}

export function calculateFinancialMetrics(
  transactions: Transaction[],
  categories: BudgetCategory[],
  selectedYearMonth: string
): {
  monthlySummary: MonthlySummary;
  categorySpendingList: CategorySpending[];
} {
  // Filter transactions for selected year-month
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(selectedYearMonth));

  let totalIncome = 0;
  let totalExpenses = 0;
  const spendingMap = new Map<string, { spent: number; count: number }>();

  // Initialize category map
  categories.forEach((cat) => {
    spendingMap.set(cat.id, { spent: 0, count: 0 });
  });

  monthTransactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      const current = spendingMap.get(tx.categoryId) || { spent: 0, count: 0 };
      spendingMap.set(tx.categoryId, {
        spent: current.spent + tx.amount,
        count: current.count + 1,
      });
    }
  });

  let totalBudgetLimit = 0;
  let exceededCategoriesCount = 0;
  let warningCategoriesCount = 0;

  const categorySpendingList: CategorySpending[] = categories.map((cat) => {
    const data = spendingMap.get(cat.id) || { spent: 0, count: 0 };
    const spent = data.spent;
    const limit = cat.monthlyBudget;
    totalBudgetLimit += limit;

    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

    let status: 'safe' | 'warning' | 'exceeded' = 'safe';
    if (percentage >= 100) {
      status = 'exceeded';
      exceededCategoriesCount++;
    } else if (percentage >= 80) {
      status = 'warning';
      warningCategoriesCount++;
    }

    return {
      category: cat,
      spent,
      remaining,
      percentage,
      status,
      transactionCount: data.count,
    };
  });

  // Calculate day velocity and projection
  const now = new Date();
  const [selectedYear, selectedMonth] = selectedYearMonth.split('-').map(Number);
  const isCurrentMonth = now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

  const dailyAverageSpend = currentDay > 0 ? totalExpenses / currentDay : 0;
  const projectedMonthEndSpend = dailyAverageSpend * daysInMonth;
  const overallBudgetPercentage = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;

  const monthlySummary: MonthlySummary = {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalBudgetLimit,
    totalBudgetSpent: totalExpenses,
    overallBudgetPercentage,
    dailyAverageSpend,
    projectedMonthEndSpend,
    exceededCategoriesCount,
    warningCategoriesCount,
  };

  return { monthlySummary, categorySpendingList };
}
