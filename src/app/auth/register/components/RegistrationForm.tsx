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
import { Button } from "@/components/ui/button";
import { Toast } from "@/components";
import Image from "next/image";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
});

export default function RegistrationForm() {
  const router = useRouter();
  const { onRegister } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      setLoading(true);
      await onRegister({
        email: data.email,
        password: data.password,
      });

      Toast.Base({
        title: "Conta criada!",
        description: "Verifique seu e-mail para confirmar o cadastro.",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error: any) {
      Toast.Base({
        title: "Erro ao registrar",
        description: error.message || "Não foi possível criar a conta.",
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
        <CardHeader>
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>
            Informe seus dados para se registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="grid gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
