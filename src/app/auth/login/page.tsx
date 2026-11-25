"use client";

import LoginForm from "./components/LoginForm";

export default function SignIn() {
  return (
    <div className="w-full min-h-screen bg-[#02001d] flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}
