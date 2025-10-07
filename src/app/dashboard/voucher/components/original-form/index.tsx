"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, FileDown, TestTube2 } from "lucide-react";

import dayjs from "dayjs";
import { supabase } from "@/services/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { VoucherFormData } from "@/types/Voucher";
import { Operator } from "@/types/Operator";
import { PricebookItem } from "@/types/Pricebook";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import eventBus from "@/utils/lib/helpers/eventBus";
import { Toast } from "@/components";
import { gerarVoucherPDF } from "@/utils/lib/pdf/generateVoucherpdf";

interface NovoVoucherFormProps {
  initialData?: VoucherFormData;
  voucherId?: string;
}

async function genUniqueCode() {
  let code;
  do {
    code =
      "BTJR" +
      dayjs().format("YYYYMMDDHHmmss") +
      Math.random().toString(36).slice(2, 6).toUpperCase();
    const { data } = await supabase
      .from("vouchers")
      .select("id")
      .eq("codigo", code)
      .limit(1);
    if (!data?.length) break;
  } while (true);
  return code;
}

const NovoVoucherForm = ({ initialData, voucherId }: NovoVoucherFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [pricebook, setPricebook] = useState<PricebookItem[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: initialData || {
      codigo: "",
      contratante: "",
      telefone: "",
      embarque: "",
      operadora: "",
      vendedor: "",
      itens: [{ descricao: "", data: "", hora: "", observacoes: "" }],
      passageiros: [{ nome: "", telefone: "", colo: false }],
      total: 0,
      entrada: 0,
      observacoes: "",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: "itens" });

  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({ control, name: "passageiros" });

  const selectedOperatorId = watch("operadora");

  const fetchPricebook = useCallback(async (operatorId?: string) => {
    if (!operatorId) return setPricebook([]);
    const { data, error } = await supabase
      .from("pricebook")
      .select("name, net");
    if (error) {
      Toast.Base({
        title: "Erro",
        description: "Erro ao buscar passeios da operadora.",
        variant: "error",
      });
      setPricebook([]);
    } else setPricebook(data as PricebookItem[]);
  }, []);

  useEffect(() => {
    fetchPricebook(selectedOperatorId);
  }, [selectedOperatorId, fetchPricebook]);

  useEffect(() => {
    const handlePricebookUpdate = (partnerId: string) => {
      if (partnerId === selectedOperatorId) fetchPricebook(partnerId);
    };

    eventBus.on("pricebook:updated", handlePricebookUpdate);

    return () => eventBus.off("pricebook:updated", handlePricebookUpdate);
  }, [selectedOperatorId, fetchPricebook]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: opData } = await supabase
        .from("operators")
        .select("id, name, whatsapp, active")
        .eq("active", true)
        .order("name");
      if (opData) setOperators(opData as Operator[]);

      const { data: sellersData } = await supabase
        .from("sellers")
        .select("name")
        .eq("active", true)
        .order("name");
      if (sellersData)
        setSellers((sellersData as { name: string }[]).map((s) => s.name));
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const setInitialCode = async () => {
      if (!voucherId) {
        const code = await genUniqueCode();
        setValue("codigo", code);
      }
    };
    setInitialCode();
  }, [voucherId, setValue]);

  useEffect(() => {
    const fromReservation = searchParams.get("fromReservation");
    const raw = localStorage.getItem("voucher_draft");

    if (fromReservation && raw) {
      try {
        const draft = JSON.parse(raw) as VoucherFormData;
        reset(draft);
      } catch (e) {
        console.error("Failed to parse voucher draft:", e);
      } finally {
        localStorage.removeItem("voucher_draft");
      }
    } else if (initialData) {
      reset(initialData);
    }
  }, [initialData, searchParams, reset]);

  const handleSaveAndGenerate = async (data: VoucherFormData) => {
    setGeneratingPdf(true);

    try {
      const total = data.total || 0;
      const entrada = data.entrada || 0;
      const operator = operators.find((op) => op.id === data.operadora);

      const voucherPayload = {
        ...data,
        total,
        entrada,
        restante: Math.max(total - entrada, 0),
        operadora: operator?.name || "N/A",
      };

      const voucherHeader = {
        codigo: data.codigo,
        cliente_nome: data.contratante,
        telefone: data.telefone,
        hotel: data.embarque,
        seller_name: data.vendedor,
        operator_name: operator?.name || "N/A",
        valor_total_centavos: Math.round(total * 100),
        entrada_centavos: Math.round(entrada * 100),
        restante_centavos: Math.round(Math.max(total - entrada, 0) * 100),
        obs: data.observacoes,
        status: "EMITIDO",
        issued_at: new Date().toISOString(),
        payload: voucherPayload,
      };

      let savedHeader: any;
      if (voucherId) {
        const { data: updated, error } = await supabase
          .from("vouchers")
          .update(voucherHeader)
          .eq("id", voucherId)
          .select()
          .single();
        if (error) throw error;
        savedHeader = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from("vouchers")
          .insert(voucherHeader)
          .select()
          .single();
        if (error) throw error;
        savedHeader = inserted;
      }

      const currentVoucherId: string = savedHeader.id;

      await supabase
        .from("voucher_itens")
        .delete()
        .eq("voucher_id", currentVoucherId);

      const itemsToSave = data.itens
        .filter((i) => i.descricao)
        .map((item) => ({
          ...item,
          voucher_id: currentVoucherId,
          hora: item.hora || null,
        }));

      if (itemsToSave.length > 0) {
        const { error } = await supabase
          .from("voucher_itens")
          .insert(itemsToSave);
        if (error) throw error;
      }

      Toast.Base({
        title: "Voucher salvo! Gerando PDF...",
        description: "Falha ao salvar voucher",
        variant: "error",
      });
      await gerarVoucherPDF(voucherPayload);

      router.push("/reservas/vouchers");
    } catch (error: any) {
      console.error("Erro no processo de salvar e gerar voucher:", error);

      Toast.Base({
        title: "Error no processo",
        description: error.message,
        variant: "error",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleGenerateDemoPdf = async () => {
    setGeneratingPdf(true);
    const today = new Date();
    const demoPayload: VoucherFormData = {
      codigo: `DEMO-${Date.now()}`,
      contratante: "Cliente de Demonstração",
      telefone: "(85) 99999-8888",
      embarque: "Hotel Fictício",
      operadora: "Operadora Demo",
      vendedor: "Vendedor Teste",
      itens: [
        {
          descricao: "Passeio Leste - 4x4 Privativo",
          data: today.toISOString().split("T")[0],
          hora: "09:00",
          observacoes: "Com emoção",
        },
        {
          descricao: "Transfer IN - Aeroporto x Jeri",
          data: new Date(today.setDate(today.getDate() + 1))
            .toISOString()
            .split("T")[0],
          hora: "14:30",
          observacoes: "",
        },
      ],
      passageiros: [
        { nome: "João da Silva", telefone: "(11) 98765-4321", colo: false },
        { nome: "Maria da Silva", telefone: "", colo: false },
        { nome: "Pedrinho da Silva", telefone: "", colo: true },
      ],
      total: 1250.0,
      entrada: 500.0,
      observacoes: "Voucher de demonstração, sem valor comercial.",
    };

    try {
      await gerarVoucherPDF(demoPayload);
    } catch (error: any) {
      Toast.Base({
        title: "Erro ao gerar PDF de demonstração",
        description: error.message,
        variant: "error",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSaveAndGenerate)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
          <CardDescription>
            Informações principais do contratante e da reserva.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Contratante *</Label>
            <Input
              {...register("contratante", {
                required: "Contratante é obrigatório",
              })}
            />
            {errors.contratante && (
              <p className="text-sm text-destructive">
                {errors.contratante.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input {...register("telefone")} />
          </div>
          <div className="space-y-1">
            <Label>Local de Embarque</Label>
            <Input {...register("embarque")} />
          </div>
          <div className="space-y-1">
            <Label>Operadora</Label>
            <Controller
              name="operadora"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Vendedor</Label>
            <Controller
              name="vendedor"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Código</Label>
            <Input
              readOnly
              {...register("codigo")}
              className="text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Itens do Voucher</CardTitle>
            <CardDescription>
              Detalhes dos passeios, transfers ou serviços.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendItem({ descricao: "", data: "", hora: "", observacoes: "" })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {itemFields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-10 gap-3 p-3 border rounded-md items-end bg-background/50"
            >
              <div className="md:col-span-4 space-y-1">
                <Label>Descrição *</Label>
                <Controller
                  name={`itens.${index}.descricao`}
                  control={control}
                  rules={{ required: "Descrição do item é obrigatória" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedOperatorId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedOperatorId
                              ? "Selecione uma operadora"
                              : "Selecione um passeio..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {pricebook.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name} ({formatCurrency(p.net)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.itens?.[index]?.descricao && (
                  <p className="text-sm text-destructive">
                    {errors.itens[index].descricao.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label>Data</Label>
                <Input type="date" {...register(`itens.${index}.data`)} />
              </div>
              <div className="md:col-span-1 space-y-1">
                <Label>Horário</Label>
                <Input type="time" {...register(`itens.${index}.hora`)} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label>Observações</Label>
                <Input {...register(`itens.${index}.observacoes`)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Passageiros</CardTitle>
            <CardDescription>
              Liste todos os passageiros da reserva.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendPassenger({ nome: "", telefone: "", colo: false })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Passageiro
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {passengerFields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-8 gap-3 p-3 border rounded-md items-end bg-background/50"
            >
              <div className="md:col-span-4 space-y-1">
                <Label>Nome *</Label>
                <Input
                  {...register(`passageiros.${index}.nome`, {
                    required: "Nome do passageiro é obrigatório",
                  })}
                />
                {errors.passageiros?.[index]?.nome && (
                  <p className="text-sm text-destructive">
                    {errors.passageiros[index].nome.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label>Telefone</Label>
                <Input {...register(`passageiros.${index}.telefone`)} />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Controller
                  name={`passageiros.${index}.colo`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id={`c-colo-${index}`}
                    />
                  )}
                />
                <label
                  htmlFor={`c-colo-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Criança de colo?
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePassenger(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores e Pagamento</CardTitle>
          <CardDescription>Resumo financeiro da reserva.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Total (R$)</Label>
              <Input type="number" step="0.01" {...register("total")} />
            </div>
            <div className="space-y-1">
              <Label>Entrada (R$)</Label>
              <Input type="number" step="0.01" {...register("entrada")} />
            </div>
            <div className="space-y-1">
              <Label>Restante</Label>
              <Input
                readOnly
                value={formatCurrency(
                  Math.max(
                    Number.parseFloat(String(watch("total") || 0)) -
                      Number.parseFloat(String(watch("entrada") || 0)),
                    0
                  )
                )}
                className="font-bold text-primary bg-muted/30"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Observações</Label>
            <Textarea
              {...register("observacoes")}
              placeholder="Ex: Taxas de Jeri não inclusas..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateDemoPdf}
          disabled={generatingPdf}
        >
          {generatingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TestTube2 className="mr-2 h-4 w-4" />
          )}
          Gerar PDF de Demonstração
        </Button>
        <div className="flex gap-4">
          <Button type="submit" disabled={generatingPdf || loading}>
            {generatingPdf || loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            {voucherId ? "Atualizar e Gerar PDF" : "Salvar e Gerar PDF"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NovoVoucherForm;
