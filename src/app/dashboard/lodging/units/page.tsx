"use client";

import { useState } from "react";
import { Edit, Loader2, PlusCircle, Trash2, Users } from "lucide-react";

import { PageHeader } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLodgingUnits } from "@/hooks/use-lodging";
import type { LodgingUnit } from "@/types/Lodging";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { PRICE_MODE_LABEL, UNIT_TYPES } from "@/utils/lodging";
import { UnitFormDialog } from "../components/unit-form-dialog";

export default function LodgingUnitsPage() {
  const { units, loading, saveUnit, deleteUnit } = useLodgingUnits();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LodgingUnit | null>(null);

  const totalBeds = units
    .filter((u) => u.active)
    .reduce((acc, u) => acc + u.capacity, 0);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Acomodações"
        description={`${units.length} cadastrada(s) · ${totalBeds} vaga(s) ativas`}
        actions={
          <Button onClick={openNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova acomodação
          </Button>
        }
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : units.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma acomodação cadastrada ainda.
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Cadastre quartos privativos, dormitórios (vendidos por cama),
              áreas de camping, vagas de motorhome, chalés ou glamping.
            </p>
            <Button onClick={openNew}>Cadastrar a primeira</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {units.map((unit) => {
            const t = UNIT_TYPES[unit.type] ?? UNIT_TYPES.other;
            return (
              <Card key={unit.id} className={unit.active ? "" : "opacity-60"}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {unit.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{t.label}</p>
                    </div>
                  </div>
                  {!unit.active && <Badge variant="outline">Inativa</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary" className="gap-1">
                      <Users /> {unit.capacity}{" "}
                      {unit.booking_mode === "shared" ? "vagas" : "pessoas"}
                    </Badge>
                    <Badge variant="outline">
                      {unit.booking_mode === "shared"
                        ? "Compartilhada"
                        : "Unidade inteira"}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {formatCurrency(unit.nightly_rate)}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {PRICE_MODE_LABEL[unit.price_mode]}
                    </span>
                  </p>
                  {unit.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {unit.description}
                    </p>
                  )}
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${unit.name}`}
                      onClick={() => {
                        setEditing(unit);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir ${unit.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir {unit.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Só é possível excluir acomodações sem estadias.
                            Para tirar de venda mantendo o histórico,
                            desative-a.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUnit(unit.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <UnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        unit={editing}
        onSubmit={(input) => saveUnit(input, editing?.id)}
      />
    </div>
  );
}
