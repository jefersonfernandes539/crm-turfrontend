"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { getSellerOptions } from "@/utils/lib/sellers";
import { canonical } from "@/utils/lib/canonical";
import { Toast } from "@/components";
import { supabase } from "@/services/supabaseClient";

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
const PAYMENT_TYPES = ["PIX", "LINK DE PAGAMENTO"];
const RECEIVING_ACCOUNTS = ["WELLISON", "EDUARDA", "FILIPE"];

type FormData = {
  cliente: string;
  estado: string;
  vendedor: string;
  data: string;
  pix: string;
  comissao: string;
  tipo: string;
  conta: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

const NewSale = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [sellers, setSellers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cliente: "",
    estado: "",
    vendedor: "",
    data: new Date().toISOString().split("T")[0],
    pix: "",
    comissao: "",
    tipo: "",
    conta: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const fetchSellers = async () => {
      const options = await getSellerOptions();
      setSellers(options);
    };
    fetchSellers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    const normalizedSeller = canonical(formData.vendedor, sellers);

    if (!formData.cliente) newErrors.cliente = "Nome do cliente é obrigatório.";
    if (!formData.estado) newErrors.estado = "UF é obrigatória.";
    if (!formData.vendedor) newErrors.vendedor = "Vendedor é obrigatório.";
    else if (!normalizedSeller) newErrors.vendedor = "Vendedor inválido.";
    if (!formData.data) newErrors.data = "Data é obrigatória.";
    if (formData.pix === "" || parseFloat(formData.pix) < 0)
      newErrors.pix = "Valor do PIX deve ser >= 0.";
    if (formData.comissao === "" || parseFloat(formData.comissao) < 0)
      newErrors.comissao = "Comissão deve ser >= 0.";
    if (!formData.tipo) newErrors.tipo = "Tipo de pagamento é obrigatório.";
    if (!formData.conta)
      newErrors.conta = "Conta de recebimento é obrigatória.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      Toast.Base({
        variant: "error",
        title: "Corrija os erros no formulário.",
        description: "",
      });
      return;
    }

    setLoading(true);

    const saleToInsert = {
      ...formData,
      user_id: user.id,
      pix: parseFloat(formData.pix),
      comissao: parseFloat(formData.comissao),
      vendedor: canonical(formData.vendedor, sellers),
    };

    const { error } = await supabase
      .from("spreadsheet_sales")
      .insert([saleToInsert]);
    setLoading(false);

    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar venda.",
        description: error.message,
      });
    else {
      Toast.Base({
        title: "Venda registrada com sucesso!",
        variant: "success",
        description: "",
      });
      router.push("/dashboard/sales/home");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight hologram-text">
          Registrar Nova Venda
        </h1>
        <p className="text-muted-foreground">Preencha os detalhes abaixo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Venda</CardTitle>
          <CardDescription>Campos com * são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nome do Cliente *" error={errors.cliente}>
                <Input
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do cliente"
                />
              </FormField>

              <FormField label="UF *" error={errors.estado}>
                <Select
                  value={formData.estado}
                  onValueChange={(val) => handleSelectChange("estado", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Vendedor *" error={errors.vendedor}>
                <Select
                  value={formData.vendedor}
                  onValueChange={(val) => handleSelectChange("vendedor", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Data *" error={errors.data}>
                <Input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Valor do PIX (R$) *" error={errors.pix}>
                <Input
                  type="number"
                  name="pix"
                  step="0.01"
                  value={formData.pix}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Comissão (R$) *" error={errors.comissao}>
                <Input
                  type="number"
                  name="comissao"
                  step="0.01"
                  value={formData.comissao}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Tipo de Pagamento *" error={errors.tipo}>
                <Select
                  value={formData.tipo}
                  onValueChange={(val) => handleSelectChange("tipo", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        {pt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Conta de Recebimento *" error={errors.conta}>
                <Select
                  value={formData.conta}
                  onValueChange={(val) => handleSelectChange("conta", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECEIVING_ACCOUNTS.map((acc) => (
                      <SelectItem key={acc} value={acc}>
                        {acc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Venda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewSale;
