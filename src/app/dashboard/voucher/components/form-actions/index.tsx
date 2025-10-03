"use client";

import { Button } from "@/components/ui/button";
import { Loader2, FileDown, TestTube2 } from "lucide-react";

interface FormActionsProps {
  onGenerateDemo: () => void;
  isGeneratingPdf: boolean;
  isLoading: boolean;
  isEditing: boolean;
}

export function FormActions({
  onGenerateDemo,
  isGeneratingPdf,
  isLoading,
  isEditing,
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
