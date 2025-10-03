import { supabase } from "@/services/supabaseClient";

/**
 * Verifica se a string é uma URL completa.
 */
const isFullUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

type LoadAs = "base64" | "blob";

/**
 * Carrega uma imagem do Supabase Storage ou de uma URL pública.
 * @param path Caminho do arquivo no bucket ou URL pública
 * @param as Retorno esperado: "base64" (default) ou "blob"
 * @returns Retorna a imagem em base64, blob URL ou null em caso de erro
 */
export async function loadStorageImage(
  path: string,
  as: LoadAs = "base64"
): Promise<string | null> {
  if (typeof window === "undefined" || !path) return null;

  try {
    const isPublicUrl = isFullUrl(path);

    if (isPublicUrl) {
      const response = await fetch(path);
      if (!response.ok)
        throw new Error(`Failed to fetch public image: ${response.statusText}`);
      const data = await response.blob();

      if (as === "blob") {
        return URL.createObjectURL(data);
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(data);
      });
    } else {
      const { data, error } = await supabase.storage
        .from("vouchers")
        .download(path);

      if (error || !data) throw error;

      if (as === "blob") {
        return URL.createObjectURL(data);
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(data);
      });
    }
  } catch (error) {
    console.error(`Error loading storage image at path: ${path}`, error);
    return null;
  }
}

/**
 * Faz upload de uma foto de parceiro para o bucket `vouchers`.
 * @param file Arquivo a ser enviado
 * @param partnerId ID do parceiro
 * @returns Retorna a URL pública do arquivo
 */
export async function uploadPartnerPhoto(
  file: File,
  partnerId: string
): Promise<string> {
  if (!file || !partnerId) {
    throw new Error("Arquivo e ID do parceiro são necessários.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${partnerId}-${Date.now()}.${fileExt}`;
  const filePath = `partners/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("vouchers")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("vouchers").getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error("Não foi possível obter a URL pública da imagem.");
  }

  return data.publicUrl;
}
