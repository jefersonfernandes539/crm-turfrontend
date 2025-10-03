"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ReservationsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReservationsSearch({
  value,
  onChange,
}: ReservationsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Buscar por código ou nome do cliente..."
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
