import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { useData } from "../contexts/DataContext";

export default function HomePage() {
  const {
    budget,
    totalSpent,
    remaining,
    filteredExpenses,
    filteredTotal,
    hasActiveFilter,
    updateBudget,
  } = useData();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(String(budget));

  React.useEffect(() => {
    setNewBudget(String(budget));
  }, [budget]);

  const handleUpdateBudget = () => {
    const val = parseFloat(newBudget);
    if (!isNaN(val)) {
      updateBudget(val);
      setIsEditingBudget(false);
    }
  };

  const recentExpenses = filteredExpenses.slice(0, 5);
  const currentMonth = new Date().toLocaleString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan</h2>
          <p className="text-sm opacity-60 mt-0.5">
            Tháng {currentMonth}
            {hasActiveFilter && " · Đang áp dụng bộ lọc"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-labelledby="stats-heading"
      >
        <h2 id="stats-heading" className="sr-only">
          Tổng quan ngân sách và chi tiêu
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between"
          role="group"
          aria-labelledby="budget-label"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600" aria-hidden="true">
              <DollarSign size={20} />
            </div>
            {isEditingBudget ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-24 border-b border-black text-right focus:outline-none font-mono text-sm"
                  aria-label="Tổng ngân sách"
                />
                <button
                  onClick={handleUpdateBudget}
                  className="text-xs font-bold uppercase underline"
                  aria-label="Lưu ngân sách"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="text-[10px] font-bold uppercase opacity-30 hover:opacity-100 transition-opacity"
                aria-label="Sửa ngân sách"
              >
                Sửa
              </button>
            )}
          </div>
          <div className="mt-4">
            <p id="budget-label" className="text-xs uppercase font-bold opacity-40">
              Tổng ngân sách
            </p>
            <p className="text-3xl font-mono" aria-live="polite">
              {budget.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between"
          role="group"
        >
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600 self-start" aria-hidden="true">
            <ArrowUpRight size={20} />
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase font-bold opacity-40">Đã chi tiêu</p>
            <p className="text-3xl font-mono" aria-live="polite">
              {totalSpent.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${
            remaining >= 0 ? "bg-white border-black/5" : "bg-red-50 border-red-200 text-red-900"
          }`}
          role="group"
        >
          <div
            className={`p-2 rounded-lg self-start ${
              remaining >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-100 text-red-600"
            }`}
            aria-hidden="true"
          >
            <ArrowDownRight size={20} />
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase font-bold opacity-40">Còn lại</p>
            <p className="text-3xl font-mono" aria-live="polite">
              {remaining.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </motion.div>
      </section>

      {/* Recent expenses */}
      <section
        className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
        aria-labelledby="recent-heading"
      >
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2
            id="recent-heading"
            className="text-sm font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"
          >
            <Calendar size={14} aria-hidden="true" />
            Chi tiêu gần đây
            {hasActiveFilter && (
              <span className="text-xs font-normal normal-case opacity-70">(đã lọc)</span>
            )}
          </h2>
          <Link
            to="/expenses"
            className="text-xs font-bold uppercase flex items-center gap-1 hover:underline"
          >
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="px-6 py-12 text-center opacity-30 italic font-serif">
            Chưa có chi tiêu nào.
          </div>
        ) : (
          <ul className="divide-y divide-black/5" role="list">
            {recentExpenses.map((exp) => (
              <li key={exp.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="font-medium">{exp.item}</span>
                  <span className="ml-2 px-2 py-0.5 bg-black/5 rounded text-[10px] font-bold uppercase">
                    {exp.category}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm">
                  {exp.amount.toLocaleString("vi-VN")}₫
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/expenses"
          className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4 hover:bg-black/5 transition-colors group"
        >
          <div className="p-3 bg-[#141414] text-white rounded-xl">
            <Plus size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Thêm chi tiêu</h3>
            <p className="text-sm opacity-60">Ghi nhận khoản chi mới</p>
          </div>
          <ChevronRight className="opacity-40 group-hover:opacity-100" size={20} aria-hidden="true" />
        </Link>
        <Link
          to="/categories"
          className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4 hover:bg-black/5 transition-colors group"
        >
          <div className="p-3 bg-black/5 rounded-xl">
            <Calendar size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Chi tiêu theo danh mục</h3>
            <p className="text-sm opacity-60">
              Xem breakdown theo danh mục
              {hasActiveFilter && " (đã lọc)"}
            </p>
          </div>
          <ChevronRight className="opacity-40 group-hover:opacity-100" size={20} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
