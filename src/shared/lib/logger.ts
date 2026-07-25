type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, event: string, data?: Record<string, unknown>) {
  const payload = { level, event, at: new Date().toISOString(), ...data }
  if (level === 'error') console.error(payload)
  else if (level === 'warn') console.warn(payload)
  else console.info(payload)
}

export const logger = {
  debug: (event: string, data?: Record<string, unknown>) => {
    if (import.meta.env.DEV) emit('debug', event, data)
  },
  info: (event: string, data?: Record<string, unknown>) =>
    emit('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) =>
    emit('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) =>
    emit('error', event, data),
}
