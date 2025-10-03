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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="novo-voucher">Novo Voucher Manual</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Vouchers</TabsTrigger>
      </TabsList>

      <TabsContent value="novo-voucher">
        <Card>
          <CardHeader>
            <CardTitle>Criar Voucher Manualmente</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para gerar um novo voucher sem uma
              reserva vinculada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoucherForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="historico">
        <Card>
          <CardHeader>
            <CardTitle>Vouchers Gerados</CardTitle>
            <CardDescription>
              Liste e baixe os vouchers que já foram emitidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoucherHistory />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
