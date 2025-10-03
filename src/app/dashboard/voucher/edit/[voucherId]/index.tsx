"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  VoucherFormData,
  voucherSchema,
} from "@/utils/lib/schemas/voucher-schema";
import { gerarVoucherPDF } from "@/utils/lib/pdf/generateVoucherpdf";
import { Toast } from "@/components";
import { supabase } from "@/services/supabaseClient";

interface EditVoucherProps {
  voucherId: string;
}

const EditVoucher: React.FC<EditVoucherProps> = ({ voucherId }) => {
  const resolver = zodResolver(voucherSchema) as Resolver<VoucherFormData>;

  const form = useForm<VoucherFormData>({
    resolver,
    defaultValues: {
      codigo: "",
      vendedor: "",
      contratante: "",
      telefone: "",
      embarque: "",
      itens: [],
      passageiros: [],
      total: 0,
      entrada: 0,
      restante: 0,
      observacoes: "",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "itens" });
  const {
    fields: passageiroFields,
    append: appendPassageiro,
    remove: removePassageiro,
  } = useFieldArray({ control: form.control, name: "passageiros" });

  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔎 Buscar voucher do Supabase
  useEffect(() => {
    if (!voucherId) {
      console.error("voucherId ausente!");
      setLoading(false);
      return;
    }

    const fetchVoucher = async () => {
      try {
        const { data, error } = await supabase
          .from("vouchers")
          .select("*")
          .eq("id", voucherId)
          .single();

        console.log("voucherId:", voucherId);
        console.log("data:", data);
        console.log("error:", error);

        if (error || !data) throw error || new Error("Voucher não encontrado");

        const formattedData: VoucherFormData = {
          codigo: data.codigo,
          vendedor:
            data.vendedor || data.seller_name || data.operator_name || "",
          contratante: data.cliente_nome || data.contratante || "",
          telefone: data.telefone || "",
          embarque: data.hotel || data.embarque || "",
          itens: data.payload?.itens || [],
          passageiros: data.payload?.passageiros || [],
          total: data.total || data.valor_total_centavos / 100 || 0,
          entrada: data.entrada || data.entrada_centavos / 100 || 0,
          restante: data.restante || data.restante_centavos / 100 || 0,
          observacoes: data.observacoes || data.obs || "",
        };

        form.reset(formattedData);
      } catch (error) {
        console.error("Erro ao buscar voucher:", error);
        Toast.Base({
          title: "Erro ao carregar voucher",
          description: "Não foi possível carregar os dados do voucher.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId, supabase, form]);

  // 🔎 Recalcular restante
  const watchTotal = form.watch("total");
  const watchEntrada = form.watch("entrada");

  useEffect(() => {
    const newRestante = (watchTotal || 0) - (watchEntrada || 0);
    form.setValue("restante", newRestante >= 0 ? newRestante : 0);
  }, [watchTotal, watchEntrada, form]);

  // 🔎 Submit (gera PDF)
  const onSubmit = async (values: VoucherFormData) => {
    setIsGenerating(true);
    try {
      await gerarVoucherPDF(values);
      Toast.Base({
        title: "Voucher Gerado!",
        description: "O download do seu voucher em PDF começará em breve.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Toast.Base({
        title: "Erro ao gerar voucher",
        description:
          "Ocorreu um problema ao tentar gerar o PDF. Verifique o console para mais detalhes.",
        variant: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div>Carregando voucher {voucherId}...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto p-4"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <h1 className="text-2xl font-bold text-btj-text">
            Gerador de Voucher Manual
          </h1>

          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                name="codigo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Reserva</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="vendedor"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendedor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                name="contratante"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contratante</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="telefone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="embarque"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel / Embarque</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Passeios / Hospedagem */}
          <Card>
            <CardHeader>
              <CardTitle>Passeios / Hospedagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-end gap-4 p-4 border rounded-md"
                >
                  <FormField
                    name={`itens.${index}.descricao`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-[200px]">
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`itens.${index}.data`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`itens.${index}.hora`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendItem({ descricao: "", data: "", hora: "" })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Passageiros */}
          <Card>
            <CardHeader>
              <CardTitle>Passageiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passageiroFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-end gap-4 p-4 border rounded-md"
                >
                  <FormField
                    name={`passageiros.${index}.nome`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-[200px]">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`passageiros.${index}.telefone`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`passageiros.${index}.colo`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            className="form-checkbox h-5 w-5"
                          />
                        </FormControl>
                        <FormLabel>Criança de Colo?</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePassageiro(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendPassageiro({ nome: "", telefone: "", colo: false })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Passageiro
              </Button>
            </CardContent>
          </Card>

          {/* Resumo de Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Valores</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                name="total"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="entrada"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinal / Entrada (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="restante"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Restante (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        readOnly
                        className="bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <FormField
                name="observacoes"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Observações / Regras</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardFooter>
          </Card>

          {/* Botão Gerar PDF */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Gerar e Baixar Voucher
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default EditVoucher;
