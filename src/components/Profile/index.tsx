"use client";

import { cn } from "@/utils/lib/utils";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarShadcn,
} from "../ui/avatar";

type Props = React.ComponentProps<typeof AvatarShadcn> & {
  fallback: string;
  src?: string;
  nameDisplay?: {
    name: string;
    className?: string;
  };
  descriptionDisplay?: {
    name: string;
    className?: string;
  };
};

const Profile: React.FC<Props> = ({
  fallback,
  src,
  nameDisplay,
  descriptionDisplay,
  ...rest
}) => {
  return (
    <div className="flex w-full items-center">
      <AvatarShadcn {...rest}>
        <AvatarImage src={src} alt={nameDisplay?.name || "Avatar"} />
        <AvatarFallback>{AvatarFallbackName(fallback) || "A"}</AvatarFallback>
      </AvatarShadcn>
      <div className="ml-3 flex flex-col items-start">
        {nameDisplay && (
          <span className={cn("text-sm font-medium", nameDisplay.className)}>
            {nameDisplay.name}
          </span>
        )}
        {descriptionDisplay && (
          <span
            className={cn(
              "text-xs text-muted-foreground",
              descriptionDisplay.className
            )}
          >
            {descriptionDisplay.name}
          </span>
        )}
      </div>
    </div>
  );
};

const AvatarFallbackName = (name: string): string => {
  const nameArray = name.split(" ");
  const firstInitial = nameArray[0].charAt(0).toUpperCase();
  const lastInitial = nameArray[nameArray.length - 1].charAt(0).toUpperCase();

  return firstInitial + lastInitial;
};

export default Profile;
