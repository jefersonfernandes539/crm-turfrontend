// "use client";

// import { Table as TableComponent } from "@/components";
// import { PaginationMetadata } from "@/hooks/usePaginatedFetch";
// import { RequestParametersInterface } from "@/types/RequestParameters";

// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   InitialTableState,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
// import React, { useState } from "react";
// import { Filter } from "../Filter";
// import { SelectColumns } from "../SelectColumns";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// export interface DataTableProps<T> {
//   columns: ColumnDef<T>[];
//   data: Array<T>;
//   pagination?: PaginationMetadata;
//   hasFilter?: boolean;
//   hasColumnVisibility?: boolean;
//   updateParams?: (newParams: Partial<RequestParametersInterface>) => void;
//   filterOptionsChildren?: React.ReactNode;
//   className?: string;
//   initialState?: InitialTableState;
// }

// /**
//  * DataTableComponent é um componente de tabela genérico que suporta ordenação, filtragem, paginação e visibilidade de colunas.
//  *
//  * @template T - O tipo de dados exibidos na tabela.
//  *
//  * @param {Object} props - O objeto de propriedades.
//  * @param {string} [props.className] - Classes adicionais para o contêiner da tabela.
//  * @param {Array} props.data - Os dados a serem exibidos na tabela.
//  * @param {Array} props.columns - A configuração das colunas para a tabela. ColumnDef do tanstack/react-table.
//  * @param {Object} [props.initialState={}] - Estado inicial para a tabela. InitialTableState do tanstack/react-table. Utilizado para definir o estado inicial da ordenação ou de visibilidade de colunas.
//  * @param {boolean} [props.hasColumnVisibility=false] - Flag para indicar se a tabela deve ter opções de visibilidade de colunas.
//  * @param {boolean} [props.hasFilter=false] - Flag para indicar se a tabela deve ter um filtro. É necessário passar a função updateParams para que o filtro funcione.
//  * @param {Object} [props.pagination] - Metadados de paginação para a tabela.É necessário passar PaginationMetadata do usePaginatedFetch.
//  * @param {React.ReactNode} [props.filterOptionsChildren] - Opções de filtro adicionais a serem renderizadas. Utilizado para adicionar filtros personalizados.
//  * @param {Function} [props.updateParams] - Função para atualizar os parâmetros de filtragem e paginação. Função do usePaginatedFetch para atualizar os parâmetros de busca.
//  *
//  * @returns {JSX.Element} O DataTableComponent renderizado.
//  */
// const DataTableComponent = <T,>({
//   columns,
//   data,
//   hasFilter = false,
//   pagination,
//   hasColumnVisibility = false,
//   filterOptionsChildren,
//   updateParams,
//   className,
//   initialState = {},
// }: DataTableProps<T>) => {
//   const [sorting, setSorting] = useState<SortingState>([]);

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     state: {
//       sorting,
//     },
//     initialState: initialState,
//   });

//   return (
//     <div className={className}>
//       <div className="flex flex-col md:flex-row items-center py-4 justify-center md:justify-between gap-5">
//         {hasFilter && updateParams && <Filter updateParams={updateParams} />}
//         {filterOptionsChildren && filterOptionsChildren}
//         {hasColumnVisibility && <SelectColumns table={table} />}
//       </div>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id} className="whitespace-nowrap">
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id} className="whitespace-nowrap">
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   Nenhum dado encontrado
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       {pagination && updateParams && (
//         <TableComponent.Pagination
//           updateParams={updateParams}
//           paginationMetadata={pagination}
//         />
//       )}
//     </div>
//   );
// };

// export const DataTable = React.memo(
//   DataTableComponent
// ) as typeof DataTableComponent;
