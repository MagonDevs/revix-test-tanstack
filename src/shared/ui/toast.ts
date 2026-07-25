import { toast as sonnerToast } from 'sonner'

/** Thin wrapper around sonner so the app has one import path for toasts. */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast(message),
}
