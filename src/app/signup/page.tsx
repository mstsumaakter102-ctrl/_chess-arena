'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crown, Mail, Lock, User, AtSign, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    const cleanDisplayName = displayName.trim()

    if (!cleanUsername || cleanUsername.length < 3) {
      toast.error('Username must be at least 3 alphanumeric characters.')
      return
    }
    if (!cleanDisplayName) {
      toast.error('Please enter a public display name.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      // 1. Sign up user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanDisplayName,
          },
        },
      })

      if (error) {
        toast.error(error.message || 'Signup failed.')
        return
      }

      if (data?.user) {
        // Guarantee profile row exists with display name
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: cleanUsername,
          display_name: cleanDisplayName,
          rating: 1200,
          is_online: true,
        })

        toast.success('Account created! Welcome to Chess Arena.')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred during signup.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md rounded-3xl bg-[#12131a] border border-white/10 p-8 shadow-2xl shadow-black z-10"
        >
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <Crown className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Claim Your Crown
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Create your account to start playing live rated chess
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Custom Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Magnus Carlsen"
                  required
                  className="w-full rounded-xl bg-[#1a1b26] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Username Handle
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="magnus_c"
                  required
                  className="w-full rounded-xl bg-[#1a1b26] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all lowercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl bg-[#1a1b26] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full rounded-xl bg-[#1a1b26] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Join the Arena
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-5 pt-5 border-t border-white/5 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
