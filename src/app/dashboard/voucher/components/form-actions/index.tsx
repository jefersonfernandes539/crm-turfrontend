"use client";

import { Button } from "@/components/ui/button";
import { Loader2, FileDown, TestTube2, Copy } from "lucide-react";

interface FormActionsProps {
  onGenerateDemo: () => void;
  isGeneratingPdf: boolean;
  isLoading: boolean;
  isEditing: boolean;
  onDuplicate?: () => void; 
}

export function FormActions({
  onGenerateDemo,
  isGeneratingPdf,
  isLoading,
  isEditing,
  onDuplicate,
}: FormActionsProps) {
  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <Button
        type="button"
        variant="outline"
        onClick={onGenerateDemo}
        disabled={isGeneratingPdf}
      >
        {isGeneratingPdf ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <TestTube2 className="mr-2 h-4 w-4" />
        )}
        Gerar PDF de Demonstração
      </Button>

      <div className="flex gap-4">
        {/* Botão duplicar voucher */}
        {onDuplicate && (
          <Button
            type="button"
            variant="secondary"
            onClick={onDuplicate}
            disabled={isLoading || isGeneratingPdf}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicar Voucher
          </Button>
        )}

        {/* Botão salvar/gerar PDF */}
        <Button type="submit" disabled={isGeneratingPdf || isLoading}>
          {isGeneratingPdf || isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          {isEditing ? "Atualizar e Gerar PDF" : "Salvar e Gerar PDF"}
        </Button>
      </div>
    </div>
  );
}
