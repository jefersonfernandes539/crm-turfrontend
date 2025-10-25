"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Reservation } from "@/types/Reservation";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ReservationsTableProps {
  reservations: Reservation[];
  loading: boolean;
  onRowClick?: (id: string) => void;
}

export function ReservationsTable({
  reservations,
  loading,
  onRowClick,
}: ReservationsTableProps) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const totalPages = Math.max(1, Math.ceil(reservations.length / itemsPerPage));

  useEffect(() => {
    if (reservations.length === 0) {
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [reservations, itemsPerPage, totalPages, currentPage]);

  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return reservations.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage, reservations]);

  const handleCreate = (reservationId: string) => {
    router.push(`/dashboard/reserve/new-voucher/${reservationId}`);
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      </div>
    );
  }

  const renderPageNumbers = () => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="text-sm text-muted-foreground">
          Mostrando {paginatedReservations.length} de {reservations.length}{" "}
          reservas
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Por página</label>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setItemsPerPage(val);
              setCurrentPage(1); // voltar pra 1 ao trocar
            }}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={reservations.length}>Tudo</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Operadora</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedReservations.map((reservation) => (
              <TableRow
                key={reservation.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(reservation.id)}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {reservation.code}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {reservation.contractor_name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(reservation.date)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {reservation.operators?.name || "N/A"}
                </TableCell>
                <TableCell className="text-right font-medium whitespace-nowrap">
                  {formatCurrency(reservation.total_items_net)}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate(reservation.id);
                    }}
                  >
                    <span>Gerar Vourcher</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
        <p className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Primeira
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {renderPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`h-8 min-w-[36px] rounded-md px-2 text-sm ${
                  p === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "border bg-background"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Última
          </Button>
        </div>
      </div>
    </div>
  );
}
