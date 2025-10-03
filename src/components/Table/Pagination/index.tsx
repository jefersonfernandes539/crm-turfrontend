import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationMetadata } from "@/hooks/usePaginatedFetch";
import { RequestParametersInterface } from "@/types/RequestParameters";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";

interface DataTablePaginationProps {
  paginationMetadata: PaginationMetadata | null;
  updateParams: (params: Partial<RequestParametersInterface>) => void;
}

export function DataTablePagination({
  paginationMetadata,
  updateParams,
}: DataTablePaginationProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = paginationMetadata?.totalPages || 1;
  const pageSize = paginationMetadata?.pageSize || 10;

  useEffect(() => {
    if (paginationMetadata) {
      setPageIndex(paginationMetadata.currentPage - 1 || 0);
    }
  }, [paginationMetadata]);

  const pageOptions = useMemo(() => {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }, [pageCount]);

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
    updateParams({ pageNumber: page });
  };

  return (
    <div className="flex items-center justify-center md:justify-between p-2">
      <div className="hidden md:flex items-center space-x-2">
        <p className="text-sm font-medium">itens por páginas</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            const newSize = Number(value);
            updateParams({ pageSize: newSize, pageNumber: 1 });
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 20, 30, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          páginas {paginationMetadata?.currentPage} de{" "}
          {paginationMetadata?.totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={pageIndex === 0}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pageIndex)}
            disabled={pageIndex === 0}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Select
            value={`${pageIndex + 1}`}
            onValueChange={(value) => handlePageChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageOptions.map((page) => (
                <SelectItem key={page} value={`${page}`}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pageIndex + 2)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(pageCount)}
            disabled={pageIndex >= pageCount - 1}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
