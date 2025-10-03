"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Loader2, Download, Edit, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/services/supabaseClient";
import { gerarVoucherPDF } from "@/utils/lib/pdf/generateVoucherpdf";
import { Toast } from "@/components";

type Voucher = {
  id: string;
  cliente_nome: string;
  codigo: string;
  issued_at: string;
  payload: any;
};

export function VoucherHistory() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vouchers")
      .select("id, cliente_nome, codigo, issued_at, payload")
      .order("issued_at", { ascending: false });

    if (error) {
      Toast.Base({
        title: "Error ao buscar voucher!",
        description: "voucher não encontrado.",
        variant: "error",
      });
    } else {
      setVouchers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVouchers();

    const channel = supabase
      .channel("vouchers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vouchers" },
        fetchVouchers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVouchers]);


  
  const handleDelete = async (voucherId: string) => {
    await supabase.from("voucher_itens").delete().eq("voucher_id", voucherId);
    const { error } = await supabase
      .from("vouchers")
      .delete()
      .eq("id", voucherId);

    if (error) {
      Toast.Base({
        title: "Error ao deletar voucher!",
        description: "voucher não deletado.",
        variant: "error",
      });
    } else {
      Toast.Base({
        title: "Sucesso ao deletar voucher!",
        description: "voucher deletado.",
        variant: "success",
      });
      fetchVouchers();
    }
  };

  const handleDownload = async (voucher: Voucher) => {
    if (!voucher.payload) {
      Toast.Base({
        title: "Dados incompletos",
        description:
          "Não é possível gerar o PDF sem os dados completos do voucher.",
        variant: "error",
      });
      return;
    }
    await gerarVoucherPDF(voucher.payload);
  };

  const handleEdit = (voucherId: string) => {
    router.push(`/dashboard/voucher/edit/${voucherId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Histórico de Vouchers</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Data de Emissão</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.length > 0 ? (
            vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell>{voucher.cliente_nome}</TableCell>
                <TableCell>{voucher.codigo}</TableCell>
                <TableCell>
                  {dayjs(voucher.issued_at).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(voucher)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(voucher.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o voucher de{" "}
                          <span className="font-medium">
                            {voucher.cliente_nome}
                          </span>
                          ? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(voucher.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum voucher gerado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
