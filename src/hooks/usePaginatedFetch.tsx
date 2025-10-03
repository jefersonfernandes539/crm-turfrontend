"use client";

import api from "@/services/api";
import { RequestParametersInterface } from "@/types/RequestParameters";

import { useEffect, useState } from "react";
import useSWR, { BareFetcher, SWRConfiguration } from "swr";

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginatedData<T> {
  data: T | null;
  pagination: PaginationMetadata | null;
}

export default function usePaginatedFetch<
  T,
  P extends RequestParametersInterface
>(
  url: string | null,
  initialParams: P,
  config?: SWRConfiguration<T, unknown, BareFetcher<T>>
) {
  const [params, setParams] = useState<P>(initialParams);
  const [paginatedData, setPaginatedData] = useState<PaginatedData<T>>({
    data: null,
    pagination: null,
  });
  const [mounted, setMounted] = useState(false);

  const fetcher = async (url: string): Promise<T> => {
    const response = await api.get(url);
    const responseData = response.data;

    setPaginatedData({
      data: responseData.data,
      pagination: responseData.meta,
    });

    return responseData.data;
  };

  const { data, error, mutate, isLoading } = useSWR<T>(
    url && mounted ? `${url}?${formatQueryParams(params)}` : null,
    fetcher,
    {
      ...config,
      revalidateOnFocus: false,
    }
  );

  const updateParams = (newParams: Partial<P>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !paginatedData.pagination && data) {
      mutate();
    }
  }, [mounted, paginatedData.pagination, data, mutate]);

  if (!mounted) {
    return {
      data: null,
      error: null,
      mutate: () => {},
      isLoading: true,
      params,
      updateParams,
      pagination: null,
    };
  }

  return {
    data: paginatedData.data,
    error,
    mutate,
    isLoading,
    params,
    updateParams,
    pagination: paginatedData.pagination,
  };
}

export function formatQueryParams(
  data: RequestParametersInterface
): URLSearchParams {
  const queryParams = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          queryParams.append(key, item.toString());
        });
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  return queryParams;
}
