"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function ReservationsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Lista de Reservas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todas as suas reservas em um só lugar.
        </p>
      </div>

      <div className="flex gap-2">
        {/* <Button variant="outline" asChild>
          <Link href="/dashboard/voucher/new">
            <FileDown className="mr-2 h-4 w-4" />
            Gerar Voucher
          </Link>
        </Button> */}
        <Button asChild>
          <Link href="/dashboard/reserve/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Reserva
          </Link>
        </Button>
      </div>
    </div>
  );
}
