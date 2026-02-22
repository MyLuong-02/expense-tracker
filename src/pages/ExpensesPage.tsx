import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Camera,
  Calendar,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { parseExpenseText, parseExpenseImage } from "../services/geminiService";
import { useData } from "../contexts/DataContext";
import { Expense } from "../types";

export default function ExpensesPage() {
  const {
    filteredExpenses,
    filteredTotal,
    hasActiveFilter,
    categories,
    saveExpense,
    updateExpense,
    deleteExpense,
  } = useData();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<{
    item: string;
    amount: string;
    category: string;
    purpose: string;
    date: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setEditForm({
        item: editingExpense.item,
        amount: String(editingExpense.amount),
        category: editingExpense.category,
        purpose: editingExpense.purpose || "",
        date: editingExpense.date,
      });
    } else {
      setEditForm(null);
    }
  }, [editingExpense]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const parsed = await parseExpenseText(inputText);
      await saveExpense(parsed);
      setInputText("");
    } catch (err) {
      console.error("Failed to parse text", err);
      alert("Không thể phân tích chi tiêu. Vui lòng mô tả rõ hơn.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const parsed = await parseExpenseImage(base64, file.type);
        await saveExpense(parsed);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to parse image", err);
      alert("Không thể đọc hóa đơn. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editForm) return;
    updateExpense(editingExpense.id, editForm).then(() => setEditingExpense(null));
  };

  const handleDelete = (id: number) => {
    setOpenMenuId(null);
    deleteExpense(id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Lịch sử chi tiêu</h2>
        <p className="text-sm opacity-60 mt-0.5">
          Thêm mới và quản lý các khoản chi tiêu
          {hasActiveFilter && " · Đang áp dụng bộ lọc"}
        </p>
      </div>

      {/* Add expense form */}
      <section
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        aria-labelledby="add-expense-heading"
      >
        <h2 id="add-expense-heading" className="sr-only">
          Thêm chi tiêu mới
        </h2>
        <div className="md:col-span-3">
          <form
            onSubmit={handleTextSubmit}
            className="relative group"
            role="search"
            aria-label="Thêm chi tiêu bằng văn bản"
          >
            <label htmlFor="expense-input" className="sr-only">
              Nhập mô tả chi tiêu
            </label>
            <input
              id="expense-input"
              type="text"
              placeholder="Nhập chi tiêu (VD: '100k xăng' hoặc 'Ăn tối 500k')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-white border border-black/5 p-5 pr-14 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg placeholder:opacity-30"
              aria-describedby={isProcessing ? "processing-msg" : undefined}
              autoComplete="off"
            />
            <span id="processing-msg" className="sr-only" aria-live="polite">
              {isProcessing ? "Đang xử lý..." : ""}
            </span>
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#141414] text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
              aria-label={isProcessing ? "Đang xử lý" : "Thêm chi tiêu"}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              ) : (
                <Plus size={20} aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 bg-white border border-black/5 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-black/5 transition-colors disabled:opacity-50 py-4"
            aria-label="Quét hóa đơn bằng ảnh"
          >
            <Camera size={20} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase">Quét hóa đơn</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            aria-label="Chọn ảnh hóa đơn"
          />
        </div>
      </section>

      {/* Edit modal */}
      {editingExpense && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-expense-title"
          onClick={() => setEditingExpense(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-black/10 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black/5">
              <h2 id="edit-expense-title" className="text-lg font-bold">
                Sửa chi tiêu
              </h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-item" className="block text-xs font-bold uppercase opacity-60 mb-1">
                  Khoản mục
                </label>
                <input
                  id="edit-item"
                  type="text"
                  value={editForm.item}
                  onChange={(e) => setEditForm((f) => f && { ...f, item: e.target.value })}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-amount" className="block text-xs font-bold uppercase opacity-60 mb-1">
                  Số tiền (₫)
                </label>
                <input
                  id="edit-amount"
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((f) => f && { ...f, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-category" className="block text-xs font-bold uppercase opacity-60 mb-1">
                  Danh mục
                </label>
                <input
                  id="edit-category"
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => f && { ...f, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                  list="edit-category-list"
                />
                <datalist id="edit-category-list">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="edit-purpose" className="block text-xs font-bold uppercase opacity-60 mb-1">
                  Mục đích
                </label>
                <input
                  id="edit-purpose"
                  type="text"
                  value={editForm.purpose}
                  onChange={(e) => setEditForm((f) => f && { ...f, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label htmlFor="edit-date" className="block text-xs font-bold uppercase opacity-60 mb-1">
                  Ngày
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((f) => f && { ...f, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 py-2.5 border border-black/10 rounded-xl font-medium hover:bg-black/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#141414] text-white rounded-xl font-medium hover:opacity-90"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense table */}
      <section
        className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-visible"
        aria-labelledby="history-heading"
      >
        <div className="p-6 border-b border-black/5 flex justify-between items-center flex-wrap gap-2">
          <h2
            id="history-heading"
            className="text-sm font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"
          >
            <Calendar size={14} aria-hidden="true" />
            Lịch sử chi tiêu
            {hasActiveFilter && (
              <span className="text-xs font-normal normal-case opacity-70">(đang lọc)</span>
            )}
          </h2>
          <div className="text-[10px] font-mono opacity-30" aria-live="polite">
            {filteredExpenses.length} KHOẢN
            {hasActiveFilter ? ` (tổng)` : " ĐÃ GHI"}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse" role="table" aria-labelledby="history-heading">
            <thead>
              <tr className="bg-[#F5F5F4]/50 text-[10px] uppercase font-bold tracking-wider opacity-40">
                <th scope="col" className="px-6 py-4">Ngày</th>
                <th scope="col" className="px-6 py-4">Khoản mục</th>
                <th scope="col" className="px-6 py-4">Danh mục</th>
                <th scope="col" className="px-6 py-4">Mục đích</th>
                <th scope="col" className="px-6 py-4 text-right">Số tiền</th>
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody aria-live="polite" aria-relevant="additions removals" aria-atomic="false">
              <AnimatePresence initial={false}>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center opacity-30 italic font-serif">
                      {hasActiveFilter
                        ? "Không có chi tiêu nào khớp bộ lọc."
                        : "Chưa có chi tiêu nào trong tháng này."}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-[#F5F5F4]/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{expense.date}</td>
                      <td className="px-6 py-4 font-medium">{expense.item}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-black/5 rounded text-[10px] font-bold uppercase tracking-tighter">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm opacity-60">{expense.purpose}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        {expense.amount.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className="relative inline-block"
                          ref={openMenuId === expense.id ? menuRef : undefined}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((id) => (id === expense.id ? null : expense.id));
                            }}
                            className="p-2 opacity-60 hover:opacity-100 hover:bg-black/5 rounded-lg transition-all"
                            aria-label="Mở menu hành động (Sửa, Xóa)"
                            aria-expanded={openMenuId === expense.id}
                            aria-haspopup="true"
                          >
                            <MoreVertical size={18} aria-hidden="true" />
                          </button>
                          {openMenuId === expense.id && (
                            <div
                              className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-white border border-black/15 rounded-xl shadow-lg py-1"
                              role="menu"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5"
                                onClick={() => {
                                  setEditingExpense(expense);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Pencil size={14} aria-hidden="true" /> Sửa
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <Trash2 size={14} aria-hidden="true" /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
            {filteredExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-[#F5F5F4]/50 font-bold">
                  <td colSpan={4} className="px-6 py-4 text-right text-[10px] uppercase tracking-widest opacity-40">
                    {hasActiveFilter ? "Tổng (đã lọc)" : "Tổng tháng"}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xl" scope="row">
                    {filteredTotal.toLocaleString("vi-VN")}₫
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
