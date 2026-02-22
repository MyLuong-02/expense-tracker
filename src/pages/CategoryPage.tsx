import React from "react";
import { PieChart } from "lucide-react";
import { useData } from "../contexts/DataContext";

export default function CategoryPage() {
  const { byCategory, filteredTotal, filteredExpenses, hasActiveFilter } = useData();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Chi tiêu theo danh mục</h2>
        <p className="text-sm opacity-60 mt-0.5">
          {hasActiveFilter
            ? "Đang hiển thị theo bộ lọc đã chọn"
            : "Tổng quan chi tiêu theo từng danh mục"}
        </p>
      </div>

      <section
        className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
        aria-labelledby="by-category-heading"
      >
        <div className="p-6 border-b border-black/5 flex justify-between items-center flex-wrap gap-2">
          <h2
            id="by-category-heading"
            className="text-sm font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"
          >
            <PieChart size={14} aria-hidden="true" />
            Chi tiêu theo danh mục
            {hasActiveFilter && (
              <span className="text-xs font-normal normal-case opacity-70">(đang lọc)</span>
            )}
          </h2>
          <p className="text-sm font-mono font-bold">
            Tổng: {filteredTotal.toLocaleString("vi-VN")}₫
            {hasActiveFilter && ` · ${filteredExpenses.length} khoản`}
          </p>
        </div>

        {byCategory.length === 0 ? (
          <div className="px-6 py-12 text-center opacity-30 italic font-serif">
            Chưa có chi tiêu nào.
          </div>
        ) : (
          <ul className="divide-y divide-black/5" role="list">
            {byCategory.map(([cat, amount]) => {
              const pct = filteredTotal > 0 ? (amount / filteredTotal) * 100 : 0;
              return (
                <li
                  key={cat}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <span className="px-2 py-1 bg-black/5 rounded text-[10px] font-bold uppercase tracking-tighter">
                    {cat}
                  </span>
                  <div className="flex items-center gap-3 flex-1 max-w-[60%] justify-end">
                    <div
                      className="h-2 bg-black/10 rounded-full overflow-hidden min-w-[80px]"
                      role="presentation"
                    >
                      <div
                        className="h-full bg-[#141414]/20 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-sm tabular-nums whitespace-nowrap">
                      {amount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
