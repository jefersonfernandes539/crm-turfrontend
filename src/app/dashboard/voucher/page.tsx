"use client";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { VoucherTabs } from "./components/tabs";

export default function VoucherPage() {
  const router = useRouter();
  return (
    <>
      <div className="mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Novo Voucher</h1>
              <p className="text-muted-foreground mt-2">
                Crie um novo voucher de reserva com todos os detalhes
                necessários.
              </p>
            </div>

            <Button onClick={() => router.push("/dashboard/reserve")}>
              <FilePlus className="mr-2 h-4 w-4" /> Gerar a partir de Reserva
            </Button>
          </div>
          <VoucherTabs />
        </div>
      </div>
    </>
  );
}
