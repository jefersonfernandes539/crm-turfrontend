import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VoucherFormData } from "@/types/Voucher";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { calculateRemaining } from "@/utils/lib/helpers/voucher-utils";

interface PaymentSectionProps {
  register: UseFormRegister<VoucherFormData>;
  watch: UseFormWatch<VoucherFormData>;
}

export function PaymentSection({ register, watch }: PaymentSectionProps) {
  const total = Number(watch("total") ?? 0);
  const entrada = Number(watch("entrada") ?? 0);
  const remaining = calculateRemaining(total, entrada);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valores e Pagamento</CardTitle>
        <CardDescription>Resumo financeiro da reserva.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Total (R$)</Label>
            <Input type="number" step="0.01" {...register("total")} />
          </div>

          <div className="space-y-1">
            <Label>Entrada (R$)</Label>
            <Input type="number" step="0.01" {...register("entrada")} />
          </div>

          <div className="space-y-1">
            <Label>Restante</Label>
            <Input
              readOnly
              value={formatCurrency(remaining)}
              className="font-bold text-primary bg-muted/30"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Observações</Label>
          <Textarea
            {...register("observacoes")}
            placeholder="Ex: Taxas de Jeri não inclusas..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
