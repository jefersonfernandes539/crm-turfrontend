"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, FileDown } from "lucide-react";
import type { Reservation } from "@/types/Reservation";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="rounded-lg border overflow-hidden bg-card p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Operadora</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-center">Ações</TableHead>{" "}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow
              key={reservation.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{reservation.code}</TableCell>
              <TableCell>{reservation.contractor_name}</TableCell>
              <TableCell>{formatDate(reservation.date)}</TableCell>
              <TableCell>{reservation.operators?.name || "N/A"}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(reservation.total_items_net)}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="outline" asChild size="sm">
                  <Link
                    href={`/dashboard/voucher/new?voucherId=${reservation.id}`}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Gerar Voucher
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
