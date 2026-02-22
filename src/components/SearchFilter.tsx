import React from "react";
import { Search, Filter } from "lucide-react";
import { useData } from "../contexts/DataContext";

export default function SearchFilter() {
  const {
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    categories,
  } = useData();

  return (
    <section
      className="bg-white rounded-2xl shadow-sm border border-black/5 p-4"
      aria-labelledby="filter-heading"
    >
      <h2 id="filter-heading" className="sr-only">
        Tìm kiếm và lọc chi tiêu
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="search-expenses" className="sr-only">
            Tìm theo khoản mục, danh mục hoặc mục đích
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"
            aria-hidden="true"
          />
          <input
            id="search-expenses"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo khoản mục, danh mục, mục đích..."
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
            aria-label="Tìm kiếm chi tiêu"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-5 h-5 opacity-40 shrink-0" aria-hidden="true" />
          <label htmlFor="filter-category" className="sr-only">
            Lọc theo danh mục
          </label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 py-2.5 px-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 bg-white text-sm"
            aria-label="Chọn danh mục để lọc"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
