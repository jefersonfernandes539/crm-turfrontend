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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import type { VoucherFormData } from "@/types/Voucher";

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
