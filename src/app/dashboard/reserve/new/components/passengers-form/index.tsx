"use client";
import { Input } from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";

interface Props {
  control: any;
  register: any;
  errors: any;
}

const PassengersForm: React.FC<Props> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>👥 Passageiros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-1 gap-3 items-end"
          >
            <div className="flex space-y-1">
              <Input.Base
                id={`passengers-${index}-name`}
                label="Nome"
                isInvalid={!!errors.passengers?.[index]?.name}
                errorMessage={
                  errors.passengers?.[index]?.name?.message as string
                }
                classNameContainer="w-full"
                {...register(`passengers.${index}.name`)}
              />
            </div>

            <div className="flex items-center space-x-2 justify-center">
              <div className="space-y-1">
                <Controller
                  name={`passengers.${index}.phone`}
                  control={control}
                  render={({ field }) => (
                    <Input.Phone
                      id={`passengers-${index}-phone`}
                      label="Telefone"
                      isInvalid={!!errors.passengers?.[index]?.phone}
                      errorMessage={
                        errors.passengers?.[index]?.phone?.message as string
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center space-x-2 justify-center mt-6">
                <Controller
                  name={`passengers.${index}.is_infant`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Criança (0-2 anos)</Label>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          onClick={() => append({ name: "", phone: "", is_infant: false })}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Passageiro
        </Button>
      </CardContent>
    </Card>
  );
};

export default PassengersForm;
