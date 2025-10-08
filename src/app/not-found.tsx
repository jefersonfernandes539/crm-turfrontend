"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md text-center shadow-xl border border-border bg-card">
          <CardHeader className="flex flex-col items-center space-y-3">
            <Image
              src="/404.png"
              alt="Página não encontrada"
              width={320}
              height={320}
              className="rounded-lg select-none"
              priority
            />

            <CardTitle className="text-4xl font-bold text-foreground">
              404 — Página não encontrada
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-muted-foreground">
              Oops! A página que você está procurando não existe ou foi movida.
            </p>

            <Button asChild size="lg" className="mt-2">
              <Link href="/">Voltar para a página inicial</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
