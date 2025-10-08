"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Crown } from "lucide-react";
import type { PartnerCardProps } from "@/types/Dashboard";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";

export const PartnerOfTheMonthCard = ({
  partner,
  loading,
  onClick,
}: PartnerCardProps) => {
  const hasValidPartner = partner?.name && partner.name !== "—";

  return (
    <Card
      className={`col-span-1 md:col-span-2 flex flex-col justify-between transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:bg-muted/30 hover:shadow-md hover:scale-[1.01]"
          : ""
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-btj-text">
          <Crown className="h-5 w-5 text-btj-accent" />
          Parceiro do Mês
        </CardTitle>
        <CardDescription className="text-btj-muted">
          Operadora com maior faturamento no período
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-btj-muted/20 rounded-lg animate-pulse flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-40 bg-btj-muted/20 animate-pulse rounded-md" />
              <div className="h-4 w-28 bg-btj-muted/20 animate-pulse rounded-md" />
            </div>
          </div>
        ) : hasValidPartner ? (
          <div className="flex items-center space-x-4">
            {/* {showImage && (
              <div className="flex-shrink-0 relative h-16 w-16">
                <Image
                  src={partner.photo_url!}
                  alt={`Foto de ${partner.name}`}
                  fill
                  sizes="64px"
                  className="rounded-lg object-cover border border-btj-muted/20"
                  onError={() => setImageError(true)}
                />
              </div>
            )} */}
            <div className="flex-1 min-w-0">
              <p
                className="text-lg font-bold text-btj-text truncate"
                title={partner.name}
              >
                {partner.name}
              </p>
              <p className="text-sm font-semibold text-green-500">
                {formatCurrency(partner.total)} em vendas
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-btj-muted py-8">
            <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum parceiro encontrado no período.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
