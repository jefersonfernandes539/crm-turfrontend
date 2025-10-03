import { Text } from "@/components";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RequestParametersInterface } from "@/types/RequestParameters";

import { cn } from "@/utils/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  updateParams: (params: Partial<RequestParametersInterface>) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  updateParams,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSorted = column.getIsSorted();
  const handleSort = (direction: "asc" | "desc") => {
    const sort = direction === "asc" ? false : true;
    column.toggleSorting(sort);
    updateParams({
      orderBy: `${column.id} ${direction}`,
    });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent text-sm text-muted-foreground"
            onClick={() => handleSort(isSorted === "asc" ? "desc" : "asc")}
          >
            <Text.Base className="text-right text-muted-foreground">
              {title}
            </Text.Base>
            {isSorted === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : isSorted === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSort("asc")}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("desc")}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
