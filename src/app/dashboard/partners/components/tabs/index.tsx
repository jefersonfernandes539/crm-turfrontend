"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OperadorasTabs() {
  return (
    <Tabs defaultValue="OPERADORA" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="OPERADORA">Operadoras</TabsTrigger>
        <TabsTrigger value="POUSADA">Pousadas</TabsTrigger>
      </TabsList>

      <TabsContent value="OPERADORA">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Operadoras</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as operadoras cadastradas no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Aqui vai a listagem/gerenciamento de Operadoras.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="POUSADA">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Pousadas</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as pousadas cadastradas no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Aqui vai a listagem/gerenciamento de Pousadas.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
