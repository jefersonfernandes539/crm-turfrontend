"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar";
import clsx from "clsx";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

export interface LinkItemProps {
  name: string;
  icon: IconType | React.ComponentType<LucideProps>;
  redirect: string;
}

interface LinkItemActionProps
  extends Omit<LinkItemProps, "redirect" | "rolesPermited"> {
  action: () => void;
}

export const NavItem: React.FC<LinkItemProps> = ({
  name,
  icon: Icon,
  redirect,
}) => {
  const { isExpanded } = useSidebarStore();
  const pathname = usePathname();

  const isActive = pathname === "/" + redirect;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={redirect}
          className={clsx(
            "flex h-9 w-9 items-center justify-start rounded-lg ",
            {
              "w-full px-2": isExpanded,
              "w-8 justify-center": !isExpanded,
              "text-muted-foreground transition-colors hover:text-foreground hover:bg-accent md:h-8":
                !isActive,
              "text-foreground bg-accent": isActive,
            }
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {isExpanded && <span className="ml-2 text-sm">{name}</span>}
        </Link>
      </TooltipTrigger>
      {!isExpanded && <TooltipContent side="right">{name}</TooltipContent>}
    </Tooltip>
  );
};

export const NavItemAction: React.FC<LinkItemActionProps> = ({
  name,
  icon: Icon,
  action,
}) => {
  const { isExpanded } = useSidebarStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={action}
          className={clsx(
            "flex h-9 w-9 items-center justify-start rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent md:h-8",
            {
              "w-full px-2": isExpanded,
              "w-8 justify-center": !isExpanded,
            }
          )}
          variant="ghost"
        >
          <Icon className="h-5 w-5 shrink-0" />
          {isExpanded && <span className="ml-2 text-sm">{name}</span>}
        </Button>
      </TooltipTrigger>
      {!isExpanded && <TooltipContent side="right">{name}</TooltipContent>}
    </Tooltip>
  );
};
