"use client";

import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import type { VoucherFormData } from "@/types/Voucher";
import { Input } from "@/components";

interface PassengersSectionProps {
  register: any;
  control: Control<VoucherFormData>;
  errors: FieldErrors<VoucherFormData>;
  passengerFields: UseFieldArrayReturn<
    VoucherFormData,
    "passageiros",
    "id"
  >["fields"];
  appendPassenger: UseFieldArrayReturn<
    VoucherFormData,
    "passageiros",
    "id"
  >["append"];
  removePassenger: UseFieldArrayReturn<
    VoucherFormData,
    "passageiros",
    "id"
  >["remove"];
}

export function PassengersSection({
  register,
  control,
  errors,
  passengerFields,
  appendPassenger,
  removePassenger,
}: PassengersSectionProps) {
  return (
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
            appendPassenger({
              nome: "",
              telefone: "",
              colo: false,
            })
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
            className="flex flex-wrap items-end gap-4 p-4 border rounded-md"
          >
            <div className="md:col-span-4 space-y-1">
              <Controller
                name={`passageiros.${index}.nome`}
                control={control}
                rules={{ required: "Nome do passageiro é obrigatório" }}
                render={({ field }) => (
                  <Input.Base
                    id={`passageiros-${index}-nome`}
                    label="Nome"
                    isRequired
                    isInvalid={!!errors.passageiros?.[index]?.nome}
                    errorMessage={
                      errors.passageiros?.[index]?.nome?.message as string
                    }
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <Controller
                name={`passageiros.${index}.telefone`}
                control={control}
                render={({ field }) => (
                  <Input.Phone
                    id={`passageiros-${index}-telefone`}
                    label="Telefone"
                    value={field.value}
                    onChange={field.onChange}
                    defaultCountry="BR"
                    isInvalid={!!errors.passageiros?.[index]?.telefone}
                    errorMessage={
                      errors.passageiros?.[index]?.telefone?.message as string
                    }
                  />
                )}
              />
            </div>

            <div className="flex items-center space-x-2 pt-6 justify-center">
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
              <Button
                type="button"
                variant="ghost"
                className="mt-4"
                size="icon"
                onClick={() => removePassenger(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
