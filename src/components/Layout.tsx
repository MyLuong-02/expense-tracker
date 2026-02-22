import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, List, PieChart } from "lucide-react";
import SearchFilter from "./SearchFilter";

const navItems = [
  { to: "/", icon: Home, label: "Trang chủ" },
  { to: "/expenses", icon: List, label: "Lịch sử chi tiêu" },
  { to: "/categories", icon: PieChart, label: "Chi tiêu theo danh mục" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#141414] focus:text-white focus:rounded-xl"
      >
        Chuyển đến nội dung chính
      </a>

      <header
        className="sticky top-0 z-40 bg-[#F5F5F4]/95 backdrop-blur border-b border-[#141414]/10"
        role="banner"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <NavLink to="/" className="flex items-center gap-2">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight uppercase italic font-serif">
                Quản Lý Chi Tiêu
              </h1>
            </NavLink>
            <nav className="flex items-center gap-1" aria-label="Điều hướng chính">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#141414] text-white"
                        : "text-[#141414]/70 hover:bg-black/5 hover:text-[#141414]"
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-4">
            <SearchFilter />
          </div>
        </div>
      </header>

      <main id="main-content" role="main" tabIndex={-1} className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      <footer className="py-8 text-center" role="contentinfo">
        <p className="text-[10px] uppercase font-bold opacity-20 tracking-[0.3em]">
          &copy; {new Date().getFullYear()} Hệ thống Quản Lý Chi Tiêu
        </p>
      </footer>
    </div>
  );
}
