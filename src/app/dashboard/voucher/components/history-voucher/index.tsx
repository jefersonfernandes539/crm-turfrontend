"use client";

import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Download, Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Toast } from "@/components";
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
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/services/supabaseClient";
import { VoucherPayload } from "@/types/Voucher";
import { gerarVoucherPDF } from "@/utils/lib/pdf/generateVoucherpdf";

type Voucher = {
  id: string;
  cliente_nome: string;
  codigo: string;
  issued_at: string;
  payload: any;
  vendedor_id?: string;
  valor_total_centavos?: number;
  entrada_centavos?: number;
  restante_centavos?: number;
};

export function VoucherHistory() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("vouchers")
      .select(
        `
        id,
        cliente_nome,
        codigo,
        issued_at,
        payload,
        vendedor_id,
        valor_total_centavos,
        entrada_centavos,
        restante_centavos
      `,
        { count: "exact" }
      )
      .order("issued_at", { ascending: false })
      .range(from, to);

    if (error) {
      Toast.Base({
        title: "Erro ao buscar vouchers",
        description: error.message,
        variant: "error",
      });
      setLoading(false);
      return;
    }

    // Buscar nomes dos vendedores em batch
    const vendedorIds = Array.from(new Set(data?.map((v) => v.vendedor_id).filter(Boolean)));
    let vendedoresMap: Record<string, string> = {};
    if (vendedorIds.length) {
      const { data: sellers } = await supabase
        .from("sellers")
        .select("id, name")
        .in("id", vendedorIds);

      if (sellers) {
        vendedoresMap = Object.fromEntries(sellers.map((s) => [s.id, s.name]));
      }
    }

    const formatted = (data || []).map((v) => ({
      ...v,
      vendedor: v.vendedor_id ? vendedoresMap[v.vendedor_id] || "—" : "—",
      total: v.valor_total_centavos ? v.valor_total_centavos / 100 : 0,
      entrada: v.entrada_centavos ? v.entrada_centavos / 100 : 0,
      restante: v.restante_centavos ? v.restante_centavos / 100 : 0,
    }));

    setVouchers(formatted);
    setTotalCount(count || 0);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchVouchers();
    };
    fetchData();

    const channel = supabase
      .channel("vouchers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "vouchers" }, fetchVouchers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVouchers]);

  const handleDelete = async (voucherId: string) => {
    await supabase.from("voucher_itens").delete().eq("voucher_id", voucherId);
    const { error } = await supabase.from("vouchers").delete().eq("id", voucherId);

    if (error) {
      Toast.Base({
        title: "Erro ao deletar voucher!",
        description: error.message,
        variant: "error",
      });
    } else {
      Toast.Base({
        title: "Voucher deletado!",
        description: "Operação realizada com sucesso.",
        variant: "success",
      });
      fetchVouchers();
    }
  };

  const handleDownload = async (voucher: Voucher) => {
    if (!voucher.payload) {
      Toast.Base({
        title: "Dados incompletos",
        description: "Não é possível gerar o PDF sem os dados completos do voucher.",
        variant: "error",
      });
      return;
    }

    const payload: VoucherPayload = { ...voucher.payload };

    // Buscar vendedor se não existir
    if (!payload.vendedor && voucher.vendedor_id) {
      const { data: seller } = await supabase
        .from("sellers")
        .select("name")
        .eq("id", voucher.vendedor_id)
        .maybeSingle();

      payload.vendedor = seller?.name || "—";
    } else {
      payload.vendedor = payload.vendedor || "—";
    }

    // Preencher valores se não existirem
    payload.total = payload.total ?? (voucher.valor_total_centavos ? voucher.valor_total_centavos / 100 : 0);
    payload.entrada = payload.entrada ?? (voucher.entrada_centavos ? voucher.entrada_centavos / 100 : 0);
    payload.restante = payload.restante ?? (voucher.restante_centavos ? voucher.restante_centavos / 100 : 0);

    try {
      await gerarVoucherPDF(payload);
      Toast.Base({
        title: "Voucher gerado!",
        description: "O download do PDF começará em breve.",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      Toast.Base({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um problema ao tentar gerar o PDF.",
        variant: "error",
      });
    }
  };

  const handleEdit = (voucherId: string) => {
    router.push(`/dashboard/voucher/edit/${voucherId}`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Histórico de Vouchers</h2>

      <div className="min-w-[600px]">
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
                <TableRow key={voucher.id} className="group hover:bg-muted">
                  <TableCell className="whitespace-nowrap">{voucher.cliente_nome}</TableCell>
                  <TableCell className="whitespace-nowrap">{voucher.codigo}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {dayjs(voucher.issued_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right flex justify-end space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(voucher)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(voucher.id)}>
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
                            <span className="font-medium">{voucher.cliente_nome}</span>? Esta ação não pode ser desfeita.
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

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 sm:gap-0">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="w-full sm:w-auto flex justify-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>

        <span className="text-center">
          Página {page} de {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="w-full sm:w-auto flex justify-center"
        >
          Próxima <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
