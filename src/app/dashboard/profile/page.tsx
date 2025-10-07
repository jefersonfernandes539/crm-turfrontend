"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/stores/auth"; // seu hook de auth
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setProfile(data);
    } catch (err: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao carregar perfil",
        description: err.message || "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .upsert(profile, { onConflict: "id" });

      if (error) throw error;

      Toast.Base({
        variant: "success",
        title: "Perfil atualizado!",
        description: "",
      });
    } catch (err: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar perfil",
        description: err.message || "Erro desconhecido",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
      <p className="text-muted-foreground">Edite suas informações de conta.</p>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ProfilePage;
