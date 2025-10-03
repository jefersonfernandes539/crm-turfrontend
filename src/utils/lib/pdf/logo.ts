const KEY = "btjr_logo_v3";
const LOGO_URL =
  "https://aobmttppcusilrxsrcbp.supabase.co/storage/v1/object/public/vouchers/logo/logo%2001.png";

const toDataURL = (b: Blob): Promise<string> =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(b);
  });

async function fromSupabasePublic(): Promise<string | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) {
      console.error(
        "Failed to fetch logo from public URL:",
        response.statusText
      );
      return null;
    }
    const blob = await response.blob();
    return await toDataURL(blob);
  } catch (error) {
    console.error("Error fetching logo from Supabase public URL:", error);
    return null;
  }
}

export async function getBrandLogo(): Promise<string | null> {
  try {
    const cached = localStorage.getItem(KEY);
    if (cached) return cached;

    const dataUrl = await fromSupabasePublic();
    if (dataUrl) localStorage.setItem(KEY, dataUrl);

    return dataUrl;
  } catch (error) {
    console.error("Error in getBrandLogo:", error);
    return null;
  }
}
