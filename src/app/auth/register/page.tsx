"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import RegistrationForm from "./components/RegistrationForm";

export default function Signup() {
  return (
    <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center py-8">
      <Image
        src="/logo.png"
        alt="Tur Logo"
        width={150}
        height={60}
        className="mb-8"
      />

      <div className="w-full max-w-3xl">
        <Card className="rounded-lg p-8">
          <RegistrationForm />
        </Card>
      </div>
    </div>
  );
}
