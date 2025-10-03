"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2, FileDown } from "lucide-react";

import type { ReservationWithDetails } from "@/types/Reservation";
import Link from "next/link";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";

interface ReservationDetailsDialogProps {
  reservationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function ReservationDetailsDialog({
  reservationId,
  open,
  onOpenChange,
  onDelete,
}: ReservationDetailsDialogProps) {
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && reservationId) {
      fetchReservationDetails();
    }
  }, [open, reservationId]);

  const fetchReservationDetails = async () => {
    if (!reservationId) return;

    setLoading(true);

    const { data: reservationData, error: reservationError } = await supabase
      .from("reservations")
      .select("*, operators(name), sellers(name)")
      .eq("id", reservationId)
      .single();

    if (reservationError) {
      Toast.Base({
        title: "Erro ao buscar detalhes",
        description: "error buscando detalhes",
        variant: "error",
      });
      setLoading(false);
      return;
    }

    const { data: itemsData } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("date", { ascending: true });

    const { data: passengersData } = await supabase
      .from("passengers")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: true });

    setReservation({
      ...reservationData,
      items: itemsData || [],
      passengers: passengersData || [],
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!reservationId) return;

    setDeleting(true);
    const success = await onDelete(reservationId);
    setDeleting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Visualize e gerencie os detalhes completos da reserva.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reservation ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Informações Gerais</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Código</p>
                  <p className="font-medium">{reservation.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(reservation.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{reservation.contractor_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{reservation.contractor_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Operadora</p>
                  <p className="font-medium">
                    {reservation.operators?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vendedor</p>
                  <p className="font-medium">
                    {reservation.sellers?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Itens da Reserva</h3>
              {reservation.items.length > 0 ? (
                <div className="space-y-3">
                  {reservation.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {index + 1}. {item.description}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(item.date)} às {item.time}
                          </p>
                          {item.observations && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.observations}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum item cadastrado.
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Passageiros</h3>
              {reservation.passengers.length > 0 ? (
                <div className="space-y-2">
                  {reservation.passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          {index + 1}. {passenger.name}
                        </p>
                        {passenger.phone && (
                          <p className="text-sm text-muted-foreground">
                            {passenger.phone}
                          </p>
                        )}
                      </div>
                      {passenger.is_lap_child && (
                        <Badge variant="secondary">Colo</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum passageiro cadastrado.
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Resumo Financeiro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="font-medium">
                    {formatCurrency(reservation.total_items_net)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entrada</span>
                  <span className="font-medium">
                    {formatCurrency(reservation.down_payment)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Saldo Restante</span>
                  <span className="font-semibold">
                    {formatCurrency(reservation.remaining_amount)}
                  </span>
                </div>
              </div>
            </div>

            {reservation.observations && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-sm text-muted-foreground">
                    {reservation.observations}
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                asChild
              >
                <Link href={`/reservas/${reservationId}/editar`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Deletar
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
