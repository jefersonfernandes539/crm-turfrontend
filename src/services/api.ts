import { env } from "@/utils/constants/envs";
import { getSession, signOut } from "next-auth/react";
import { routes } from "@/utils/constants/routes/routes";
import axios from "axios";

const API = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(async (config) => {
  const session = await getSession();
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      try {
        await signOut({
          callbackUrl: routes.public.auth.login,
          redirect: true,
        });
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default API;
