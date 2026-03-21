"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, IProduct } from "@/types";

type ProductQueryOptions = {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
};

export function useProducts(options: ProductQueryOptions = {}) {
  const query = new URLSearchParams();

  if (options.q) query.set("q", options.q);
  if (options.category) query.set("category", options.category);
  if (options.page) query.set("page", String(options.page));
  if (options.limit) query.set("limit", String(options.limit));

  const queryString = query.toString();

  return useQuery({
    queryKey: ["products", queryString],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          products: IProduct[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>
      >(
        `/products${queryString ? `?${queryString}` : ""}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Unable to fetch products");
      }

      return data.data;
    },
  });
}
