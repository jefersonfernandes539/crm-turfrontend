import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Hotel,
  Camera,
  Eye,
  EyeOff,
  Edit,
  List,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeletePartnerItem } from "../delete-partner";

const displayName = (p: any) => p.name || `Parceiro ${p.id.slice(-4)}`;

interface PartnerItemProps {
  partner: any;
  onEdit: (partner: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (partner: any) => void;
  onUploadPhoto: (file: File, id: string) => void;
  onViewPasseios: (id: string) => void;
}

export function PartnerItem({
  partner,
  onEdit,
  onDelete,
  onToggleStatus,
  onUploadPhoto,
  onViewPasseios,
}: PartnerItemProps) {
  const Icon = partner.type === "OPERADORA" ? Building : Hotel;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadPhoto(file, partner.id);
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.li
      variants={itemVariants}
      className="flex items-center gap-4 p-4 bg-card/80 border border-border/80 rounded-lg hover:border-primary transition-colors duration-300"
      role="listitem"
    >
      <div
        className="relative group cursor-pointer"
        onClick={handleAvatarClick}
      >
        <Avatar className="h-14 w-14">
          <AvatarImage src={partner.photo_url} alt={displayName(partner)} />
          <AvatarFallback className="bg-muted">
            <Icon className="w-6 h-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1">
        <strong className="text-lg font-semibold text-foreground">
          {displayName(partner)}
        </strong>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              partner.active
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {partner.active ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {partner.type === "OPERADORA" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewPasseios(partner.id);
              }}
            >
              <List className="w-4 h-4 mr-2" />
              Ver Passeios
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(partner);
            }}
          >
            {partner.active ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" /> Desativar
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" /> Ativar
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(partner);
            }}
          >
            <Edit className="w-4 h-4 mr-2" /> Editar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DeletePartnerItem partnerId={partner.id} onDelete={onDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.li>
  );
}
