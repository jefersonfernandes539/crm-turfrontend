"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/stores/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, Toast } from "@/components";
import Image from "next/image";

type LoginFormData = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

export default function LoginForm() {
  const router = useRouter();
  const { onLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setLoading(true);
      await onLogin(data);

      Toast.Base({
        title: "Login realizado!",
        description: "Redirecionando para a dashboard...",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error: any) {
      Toast.Base({
        title: "Erro ao entrar",
        description: error.message || "Verifique suas credenciais.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm flex flex-row gap-0 py-0">
      <div className="sm:block hidden relative w-1/2 rounded-l-xl overflow-hidden">
        <Image
          src="/blue.webp"
          alt="logo"
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col py-6 w-full md:min-w-60">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl">Bem-vindo Beach Tur</CardTitle>
          <CardDescription className="text-xs text-[#f8b00e] transition-colors duration-200">
            Informe seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Button.Link href={routes.public.auth.register}>
                Cadastre-se
              </Button.Link>
            </div> */}

            <Button.Primary
              type="submit"
              className="w-full hover:bg-[#f8b00e] transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button.Primary>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
