"use client";

import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toggle } from "@/components";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { db } from "@/services/db";
import { getBreadcrumb } from "@/utils/constants/sidebar";

type Props = {
  children: React.ReactNode;
};

const FullScreenLoader = () => (
  <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Carregando seu painel...
    </div>
  </div>
);

const PageBreadcrumb = () => {
  const pathname = usePathname() || "";
  const crumb = getBreadcrumb(pathname);
  if (!crumb) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:inline-flex">
          {crumb.group}
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {crumb.subPage ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={crumb.page.url}>{crumb.page.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{crumb.subPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb.page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const Dashboard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
      }
      setLoading(false);
    });

    const { data: listener } = db.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.push("/auth/login");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return <FullScreenLoader />;

  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:rounded-t-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <PageBreadcrumb />
          <div className="ml-auto">
            <Toggle.Color />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
};
