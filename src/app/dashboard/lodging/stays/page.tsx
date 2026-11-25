"use client";

import { useState } from "react";
import {
  Ban,
  Edit,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { useLodgingStays, useLodgingUnits } from "@/hooks/use-lodging";
import type { LodgingStay, LodgingStayStatus } from "@/types/Lodging";
import {
  formatCurrency,
  formatDate,
} from "@/utils/lib/helpers/formatCurrency";
import {
  NEXT_STATUS_ACTION,
  STAY_STATUS,
  guestsOf,
  nightsBetween,
} from "@/utils/lodging";
import { cn } from "@/utils/lib/utils";
import { StayFormDialog } from "../components/stay-form-dialog";
import { StayStatusBadge } from "../components/stay-status-badge";

const FILTERS: { value: LodgingStayStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  ...(Object.keys(STAY_STATUS) as LodgingStayStatus[]).map((k) => ({
    value: k,
    label: STAY_STATUS[k].label,
  })),
];

export default function LodgingStaysPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LodgingStayStatus | "all">("all");
  const debounced = useDebounce(search, 300);

  const { units } = useLodgingUnits();
  const { stays, loading, saveStay, updateStatus, deleteStay } =
    useLodgingStays({ search: debounced, status });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LodgingStay | null>(null);

  const openForm = (stay: LodgingStay | null) => {
    setEditing(stay);
    setFormOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Estadias"
        description="Reservas de hospedagem, check-in e check-out."
        actions={
          <Button onClick={() => openForm(null)} disabled={units.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova estadia
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por hóspede, código, telefone ou documento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={status === f.value ? "default" : "outline"}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stays.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">Nenhuma estadia encontrada.</p>
            {units.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre uma acomodação antes de criar estadias.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Acomodação</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-center">Pax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">A receber</TableHead>
                  <TableHead className="w-[1%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stays.map((stay) => {
                  const next = NEXT_STATUS_ACTION[stay.status];
                  const remaining = Math.max(
                    0,
                    Number(stay.total) - Number(stay.paid_amount)
                  );
                  return (
                    <TableRow
                      key={stay.id}
                      className="cursor-pointer"
                      onClick={() => openForm(stay)}
                    >
                      <TableCell className="font-mono text-xs">
                        {stay.code}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{stay.guest_name}</div>
                        {stay.guest_phone && (
                          <div className="text-xs text-muted-foreground">
                            {stay.guest_phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {stay.lodging_units?.name ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(stay.check_in)} → {formatDate(stay.check_out)}
                        <div className="text-xs text-muted-foreground">
                          {nightsBetween(stay.check_in, stay.check_out)} noite(s)
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {guestsOf(stay)}
                      </TableCell>
                      <TableCell>
                        <StayStatusBadge status={stay.status} />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(stay.total)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right whitespace-nowrap",
                          remaining > 0 && stay.status !== "cancelled"
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {next && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="whitespace-nowrap"
                              onClick={() => updateStatus(stay, next.to)}
                            >
                              {next.label}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" aria-label="Mais ações">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openForm(stay)}>
                                <Edit className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              {stay.status !== "cancelled" &&
                                stay.status !== "checked_out" && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatus(stay, "cancelled")}
                                  >
                                    <Ban className="h-4 w-4" /> Cancelar estadia
                                  </DropdownMenuItem>
                                )}
                              {/* Exclusão só após cancelar, evitando perder estadia ativa por engano */}
                              {stay.status === "cancelled" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteStay(stay.id)}
                                  >
                                    <Trash2 className="h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <StayFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        units={units.filter((u) => u.active || u.id === editing?.unit_id)}
        stay={editing}
        onSubmit={(input) => saveStay(input, editing?.id)}
      />
    </div>
  );
}
