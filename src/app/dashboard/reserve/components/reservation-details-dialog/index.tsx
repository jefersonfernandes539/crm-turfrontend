"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, Trash2 } from "lucide-react";

import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { formatDate } from "@/utils/lib/helpers/formatCurrency";
import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import { EditVoucherDialog } from "../../edit";

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
    const [reservation, setReservation] = useState<ReservationFormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchReservationDetails = useCallback(async () => {
    if (!reservationId) return;
    setLoading(true);

    try {
      const { data: reservationData, error: resError } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", reservationId)
        .single();

      if (resError) throw resError;
      if (!reservationData) throw new Error("Reserva não encontrada");

      const { data: itemsData } = await supabase
        .from("reservation_items")
        .select("*")
        .eq("reservation_id", reservationId);

      const { data: passengersData } = await supabase
        .from("passengers")
        .select("*")
        .eq("reservation_id", reservationId);

      const formattedData: ReservationFormValues = {
        code: reservationData.code,
        contractor_name: reservationData.contractor_name,
        embark_place: reservationData.embark_place || "",
        date: reservationData.date || "",
        entry_value: reservationData.entry_value ?? 0,
        entry_value_str: (reservationData.entry_value ?? 0).toFixed(2),
        total_items_net: reservationData.total_items_net ?? 0,
        remaining: reservationData.remaining ?? 0,
        operator_id: reservationData.operator_id || "",
        seller_id: reservationData.seller_id || "",
        passengers: (passengersData ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone || "",
          is_infant: p.is_infant ?? false,
        })),
        items: (itemsData ?? []).map((i) => ({
          id: i.id,
          pricebook_id: i.pricebook_id || "",
          name: i.name,
          category: i.category || "",
          date: i.date || "",
          quantity: Number(i.quantity ?? 0),
          net: Number(i.net ?? 0),
          transfer_multiplier: Number(i.transfer_multiplier ?? 1),
          subtotal: Number(i.subtotal ?? 0),
        })),
      };

      setReservation(formattedData);
    } catch (error: any) {
      console.error(error);
      Toast.Base({
        title: "Erro ao carregar reserva",
        description: error.message || "Não foi possível carregar os dados.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  // ✅ Agora o useEffect pode usar a função sem erro
  useEffect(() => {
    if (open && reservationId) fetchReservationDetails();
  }, [open, reservationId, fetchReservationDetails]);

  const handleDelete = async () => {
    if (!reservationId) return;
    setDeleting(true);
    const success = await onDelete(reservationId);
    setDeleting(false);
    if (success) onOpenChange(false);
  };

  const handleSaveEdit = async (updatedData: ReservationFormValues) => {
    try {
      setIsSaving(true);
      await supabase
        .from("reservations")
        .update({
          contractor_name: updatedData.contractor_name,
          embark_place: updatedData.embark_place,
          date: updatedData.date,
          entry_value: updatedData.entry_value,
          total_items_net: updatedData.total_items_net,
          seller_id: updatedData.seller_id,
        })
        .eq("id", reservationId);

      Toast.Base({
        title: "Reserva atualizada com sucesso",
        variant: "success",
        description: "",
      });

      setEditOpen(false);
      fetchReservationDetails();
    } catch (error) {
      console.error(error);
      Toast.Base({
        title: "Erro ao atualizar reserva",
        variant: "error",
        description: "",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Passageiros</h3>
                {reservation.passengers.length > 0 ? (
                  <div className="space-y-2">
                    {reservation.passengers.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">
                            {idx + 1}. {p.name}
                          </p>
                          {p.phone && (
                            <p className="text-sm text-muted-foreground">
                              {p.phone}
                            </p>
                          )}
                        </div>
                        {p.is_infant && <Badge variant="secondary">Colo</Badge>}
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
                <h3 className="font-semibold mb-3">Itens da Reserva</h3>
                {reservation.items.length > 0 ? (
                  <div className="space-y-2">
                    {reservation.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-lg border bg-muted/50"
                      >
                        <p className="font-medium">
                          {idx + 1}. {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Categoria: {item.category} | Quantidade:{" "}
                          {item.quantity} | Data: {formatDate(item.date)}
                        </p>
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

              <div className="flex gap-2 pt-4">
                {/* <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </Button> */}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>
              Atualize os dados da reserva e gere o voucher.
            </DialogDescription>
          </DialogHeader>

          {reservation && (
            <EditVoucherDialog
              reservationData={reservation}
              open={editOpen}
              onOpenChange={setEditOpen}
              onSave={handleSaveEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
