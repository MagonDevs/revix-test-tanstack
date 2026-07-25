import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy')
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}
