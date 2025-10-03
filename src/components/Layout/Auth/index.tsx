"use client";

import { Toggle } from "@/components";
import { routes } from "@/utils/constants/routes/routes";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export const Auth: React.FC<Props> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div
        className="flex items-center justify-between px-4 py-2 bg-background text-foreground shadow-lg dark:shadow-zinc-700 dark:shadow"
        style={{
          backdropFilter: "blur(20px)",
        }}
      >
        <Link
          href={routes.public.auth.login}
          className="flex items-center gap-2"
        >
          <Image
            src={theme === "light" ? "/positivo.svg" : "/negativo.svg"}
            alt="Eyna"
            width={140}
            height={32}
          />
        </Link>
        <Toggle.Color />
      </div>
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-background">
        {children}
      </div>
    </div>
  );
};
