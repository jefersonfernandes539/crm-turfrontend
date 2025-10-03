import { AxiosError } from "axios";

export function ErrorResponse(error: any): AxiosError {
  console.error("Error:", error);
  if (error.response.data[0] as AxiosError) {
    if (Array.isArray(error.response.data[0]))
      throw error.response.data[0].join(" - ");

    throw error.response.data[0] as AxiosError;
  } else if (error.response.data.message as AxiosError) {
    throw error.response.data.message as AxiosError;
  } else if (error.response.data.Message as AxiosError) {
    throw error.response.data.Message as AxiosError;
  } else if (error.response && error.response.data) {
    const e = error.response.data;

    if (typeof e === "object") {
      throw "Parece que algum campo está preenchido incorretamente";
    }
    throw e.Message;
  }

  throw "Erro desconhecido";
}
