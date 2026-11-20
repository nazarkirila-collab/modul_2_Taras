import axios from "axios";
import type { FieldErrors } from "../types";

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (e.response) {
      const data = e.response.data as { error?: string } | undefined;
      return data?.error ?? "Помилка сервера";
    }
    return "Сервер недоступний";
  }
  return "Невідома помилка";
}

export function getFieldErrors(e: unknown): FieldErrors {
  if (axios.isAxiosError(e) && e.response?.status === 400) {
    const data = e.response.data as { errors?: FieldErrors } | undefined;
    return data?.errors ?? {};
  }
  return {};
}

export function isNotFound(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 404;
}
