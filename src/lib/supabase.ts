import { createBrowserClient } from '@supabase/ssr'

/**
 * Robustly resolve the Supabase Project URL.
 * Automatically trims whitespace/newlines and recovers the project ref if
 * a generic or truncated URL like "https://supabase.co" was provided.
 */
export function getSupabaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/[\r\n]+/g, '').trim()
  const key = getSupabaseAnonKey()

  // Clean trailing slashes
  url = url.replace(/\/+$/, '')

  // If missing or set to generic 'https://supabase.co' without project ref
  if (!url || url === 'https://supabase.co' || url === 'http://supabase.co' || url.endsWith('//supabase.co')) {
    if (key) {
      try {
        const parts = key.split('.')
        if (parts.length >= 2) {
          let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          while (b64.length % 4 !== 0) {
            b64 += '='
          }
          const jsonStr =
            typeof atob === 'function'
              ? atob(b64)
              : typeof Buffer !== 'undefined'
              ? Buffer.from(b64, 'base64').toString('utf-8')
              : ''
          const payload = JSON.parse(jsonStr)
          if (payload?.ref) {
            return `https://${payload.ref}.supabase.co`
          }
        }
      } catch {
        // Fallback below
      }
    }
    return 'https://bofonllkeycqrtehrtty.supabase.co'
  }

  return url
}

export function getSupabaseAnonKey(): string {
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/[\r\n]+/g, '').trim()
  if (key) return key
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZm9ubGxrZXljcXJ0ZWhydHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjE0NjksImV4cCI6MjEwODkzNzQ2OX0.xSYsqGGMidXRCJ_dk3QBRyx_KW4ZB0PtbZKgJUIZYPQ'
}

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
}
