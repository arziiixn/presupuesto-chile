export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'debito' | 'credito' | 'transferencia' | 'efectivo' | 'mach_tenpo' | 'tarjeta' | 'bizum_spei';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  merchant?: string;
  notes?: string;
  isRecurring?: boolean;
  autoCategorizedRuleName?: string;
  createdAt: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  monthlyBudget: number; // Target monthly budget limit
  description?: string;
}

export type RuleConditionType = 'contains_keyword' | 'exact_merchant' | 'amount_greater_than' | 'regex';

export interface AutomationRule {
  id: string;
  name: string;
  conditionType: RuleConditionType;
  pattern: string; // comma-separated keywords or regex string
  targetCategoryId: string;
  priority: number;
  enabled: boolean;
  matchCount: number;
  description?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface CategorySpending {
  category: BudgetCategory;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  transactionCount: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalBudgetLimit: number;
  totalBudgetSpent: number;
  overallBudgetPercentage: number;
  dailyAverageSpend: number;
  projectedMonthEndSpend: number;
  exceededCategoriesCount: number;
  warningCategoriesCount: number;
}

export interface BudgetThresholdAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  spent: number;
  limit: number;
  previousPercentage?: number;
  percentage: number;
  threshold: 80 | 100;
  exceededAmount?: number;
  remainingAmount?: number;
  timestamp: number;
  isRead?: boolean;
}
