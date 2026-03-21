"use client";

import { create } from "zustand";
import { ProductCategory, ProductMaterial } from "@/types";

type FilterState = {
  category: ProductCategory | "all";
  material: ProductMaterial | "all";
  maxPrice: number;
  search: string;
  setCategory: (value: ProductCategory | "all") => void;
  setMaterial: (value: ProductMaterial | "all") => void;
  setMaxPrice: (value: number) => void;
  setSearch: (value: string) => void;
  resetFilters: () => void;
};

const defaults = {
  category: "all" as const,
  material: "all" as const,
  maxPrice: 50000,
  search: "",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setCategory: (value) => set({ category: value }),
  setMaterial: (value) => set({ material: value }),
  setMaxPrice: (value) => set({ maxPrice: value }),
  setSearch: (value) => set({ search: value }),
  resetFilters: () => set(defaults),
}));
