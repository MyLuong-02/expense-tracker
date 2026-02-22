/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ExpensesPage from "./pages/ExpensesPage";
import CategoryPage from "./pages/CategoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="categories" element={<CategoryPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
