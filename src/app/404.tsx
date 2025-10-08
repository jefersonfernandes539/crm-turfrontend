"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Custom404() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md shadow-lg border border-border">
          <CardHeader className="flex flex-col items-center space-y-2">
            <Image
              src="/404.png"
              alt="Página não encontrada"
              width={300}
              height={300}
              className="rounded-lg select-none"
              priority
            />
            <CardTitle className="text-4xl font-bold text-center">
              404 — Página não encontrada
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Oops! A página que você tentou acessar não existe ou foi movida.
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
