import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Expense, Budget } from "../types";

interface DataContextType {
  expenses: Expense[];
  budget: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filteredExpenses: Expense[];
  byCategory: [string, number][];
  categories: string[];
  fetchExpenses: () => Promise<void>;
  fetchBudget: () => Promise<void>;
  saveExpense: (expense: { item: string; amount: number; category: string; purpose: string; date?: string }) => Promise<void>;
  updateExpense: (id: number, data: { item: string; amount: string; category: string; purpose: string; date: string }) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  updateBudget: (val: number) => Promise<void>;
  totalSpent: number;
  remaining: number;
  filteredTotal: number;
  hasActiveFilter: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.item.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.purpose && e.purpose.toLowerCase().includes(q))
      );
    }
    if (filterCategory) {
      list = list.filter((e) => e.category === filterCategory);
    }
    return list;
  }, [expenses, searchQuery, filterCategory]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filteredExpenses) {
      const cat = e.category || "Khác";
      map[cat] = (map[cat] || 0) + e.amount;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const categories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category).filter(Boolean));
    return Array.from(set).sort();
  }, [expenses]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget");
      const data: Budget = await res.json();
      setBudget(data.total_money);
    } catch (err) {
      console.error("Failed to fetch budget", err);
    }
  };

  const saveExpense = async (expense: { item: string; amount: number; category: string; purpose: string; date?: string }) => {
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to save expense", err);
    }
  };

  const updateExpense = async (
    id: number,
    data: { item: string; amount: string; category: string; purpose: string; date: string }
  ) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount)) return;
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount }),
      });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to update expense", err);
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const updateBudget = async (val: number) => {
    try {
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_money: val }),
      });
      setBudget(val);
    } catch (err) {
      console.error("Failed to update budget", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budget - totalSpent;
  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const hasActiveFilter = searchQuery.trim() !== "" || filterCategory !== "";

  const value: DataContextType = {
    expenses,
    budget,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filteredExpenses,
    byCategory,
    categories,
    fetchExpenses,
    fetchBudget,
    saveExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    totalSpent,
    remaining,
    filteredTotal,
    hasActiveFilter,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
