import { toast } from "sonner";
import { ApiError } from "./apiClient";

const PASS_THROUGH_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

export function getFriendlyErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      return "Could not reach the server. Please check your connection and try again.";
    }
    if (PASS_THROUGH_STATUSES.has(err.status) && err.message) {
      return err.message;
    }
    if (err.status >= 500) {
      return "Something went wrong on our end. Please try again in a moment.";
    }
    return err.message || fallback;
  }

  if (err instanceof Error && err.message) {
    return fallback;
  }

  return fallback;
}

export function isExpectedError(err: unknown): boolean {
  return err instanceof ApiError && err.status !== 0 && err.status < 500;
}

export function notifyError(err: unknown, options?: { fallback?: string; context?: string }): string {
  const message = getFriendlyErrorMessage(err, options?.fallback);
  toast.error(message);

  if (!isExpectedError(err)) {
    console.error(options?.context ?? "Unexpected error:", err);
  }

  return message;
}

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyInfo(message: string) {
  toast.info(message);
}

export function notifyWarning(message: string) {
  toast.warning(message);
}
