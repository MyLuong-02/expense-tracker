export interface Expense {
  id: number;
  date: string;
  item: string;
  amount: number;
  category: string;
  purpose: string;
}

export interface Budget {
  total_money: number;
}
