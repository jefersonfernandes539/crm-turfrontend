"use client";

import React, { useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Toast } from "@/components";

// Schema Zod
const vendedorSchema = z.object({
  nome: z.string().min(1, "Nome do vendedor é obrigatório"),
  whatsapp_e164: z
    .string()
    .optional()
    .refine((val) => !val || /^\+\d{6,15}$/.test(val), {
      message: "Número inválido. Use formato E.164 (+5585999999999)",
    }),
  ativo: z.boolean(),
});

export type VendedorFormData = z.infer<typeof vendedorSchema>;

interface VendedorFormProps {
  initialData?: VendedorFormData;
  onSubmit: (data: VendedorFormData) => void;
  onCancel: () => void;
}

const SellersForm: React.FC<VendedorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const form = useForm<VendedorFormData>({
    resolver: zodResolver(vendedorSchema),
    defaultValues: initialData ?? {
      nome: "",
      whatsapp_e164: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (values: VendedorFormData) => {
    onSubmit(values);
    Toast.Base({
      title: initialData ? "Vendedor atualizado!" : "Vendedor criado!",
      description: `O vendedor ${values.nome} foi salvo com sucesso.`,
      variant: "success",
    });
  };

  return (
    <>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Vendedor" : "Novo Vendedor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="nome"
                control={form.control}
                render={({ field }) => (
                  <Input.Base
                    id="nome"
                    label="Nome"
                    isRequired
                    isInvalid={!!form.formState.errors.nome}
                    errorMessage={form.formState.errors.nome?.message as string}
                    classNameContainer="w-full"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="whatsapp_e164"
                control={form.control}
                render={({ field }) => (
                  <Input.Phone
                    id="whatsapp_e164"
                    label="WhatsApp (E.164)"
                    isRequired={false}
                    isInvalid={!!form.formState.errors.whatsapp_e164}
                    errorMessage={
                      form.formState.errors.whatsapp_e164?.message as string
                    }
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Vendedor ativo</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {initialData ? "Atualizar" : "Criar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="glass-card border-white/20 hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
};

export default SellersForm;
