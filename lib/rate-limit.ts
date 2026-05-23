const rateMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(options: { interval: number; max: number }) {
  return {
    check: (key: string): { success: boolean; remaining: number } => {
      const now = Date.now()
      const entry = rateMap.get(key)

      if (!entry || now > entry.resetAt) {
        rateMap.set(key, { count: 1, resetAt: now + options.interval })
        return { success: true, remaining: options.max - 1 }
      }

      if (entry.count >= options.max) {
        return { success: false, remaining: 0 }
      }

      entry.count++
      return { success: true, remaining: options.max - entry.count }
    },
  }
}
