"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { VoucherForm } from "../voucher-form";
import { VoucherHistory } from "../history-voucher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function VoucherTabs() {
  return (
    <Tabs defaultValue="novo-voucher" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
        <TabsTrigger value="novo-voucher">Novo Voucher Manual</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Vouchers</TabsTrigger>
      </TabsList>

      <TabsContent value="novo-voucher" className="w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <CardTitle>Criar Voucher Manualmente</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para gerar um novo voucher sem uma
              reserva vinculada.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <VoucherForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="historico" className="w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <CardTitle>Vouchers Gerados</CardTitle>
            <CardDescription>
              Liste e baixe os vouchers que já foram emitidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <VoucherHistory />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
