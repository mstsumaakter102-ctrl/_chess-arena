'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Crown, Users, LayoutDashboard, User as UserIcon, LogOut, Loader2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Play / Lobby', icon: LayoutDashboard },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
            <Crown className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Chess Arena
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-normal">
              Live
            </span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/40'
                      : 'text-gray-400 hover:bg-[#1a1b26] hover:text-white border border-transparent'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : user && profile ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-xl bg-[#12131a] border border-white/10 px-3 py-1.5 hover:border-emerald-500/40 transition-all group"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-600/30 flex items-center justify-center text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  {profile.display_name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-white group-hover:text-emerald-300 transition-colors line-clamp-1 max-w-[100px]">
                    {profile.display_name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">
                    {profile.rating} Elo
                  </span>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 rounded-xl p-2 sm:px-3 sm:py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl px-4 py-2 text-sm shadow-lg shadow-emerald-950/40 transition-all duration-200"
              >
                Play Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
