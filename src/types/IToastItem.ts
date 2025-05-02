import type { ToastType } from '@/types/ToastType.ts'

export interface IToastItem {
  id: number,
  title: string,
  message: string,
  type: ToastType,
  durationShow?: number
}
