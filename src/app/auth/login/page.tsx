"use client";

import Image from "next/image";
import LoginForm from "./components/LoginForm";

export default function SignIn() {
  return (
    <div className="w-full min-h-screen bg-[#02001d] flex flex-col items-center justify-center">
      <Image
        src="/logo.png"
        alt="Tur Logo"
        width={150}
        height={60}
        className="mb-8"
      />

      <div className="w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}
