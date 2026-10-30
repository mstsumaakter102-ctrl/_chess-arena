'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Shield,
  Trophy,
  Percent,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Equal,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileSetup from '@/components/ProfileSetup'
import GameInvite from '@/components/GameInvite'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [currentProfile, setCurrentProfile] = useState(profile)

  // Keep synced if profile updates
  const handleProfileUpdated = (updated: any) => {
    if (currentProfile) {
      setCurrentProfile({ ...currentProfile, ...updated })
    }
  }

  const p = currentProfile || profile

  const gamesPlayed = p?.games_played || 0
  const gamesWon = p?.games_won || 0
  const gamesLost = p?.games_lost || 0
  const gamesDrawn = p?.games_drawn || 0

  const winRate =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0
  const lossRate =
    gamesPlayed > 0 ? Math.round((gamesLost / gamesPlayed) * 100) : 0
  const drawRate =
    gamesPlayed > 0 ? Math.round((gamesDrawn / gamesPlayed) * 100) : 0

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <Navbar />
      <GameInvite />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#12131a] to-[#12131a] border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-black text-3xl text-white border-2 border-emerald-400/40 shadow-xl shadow-emerald-950">
                {p?.display_name?.charAt(0) || 'P'}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-[#12131a]" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {p?.display_name || 'Chess Arena Player'}
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Verified Competitor
                </span>
              </div>

              <p className="text-xs text-gray-400 font-mono">
                @{p?.username} • Member since{' '}
                {p?.created_at ? new Date(p.created_at).toLocaleDateString() : '2026'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                  <Shield className="h-3.5 w-3.5" />
                  {p?.rating || 1200} Elo Rating
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {gamesPlayed} Total Matches
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Win/Loss Performance Bar */}
        <div className="rounded-3xl bg-[#12131a] border border-white/5 p-6 shadow-xl shadow-black/40">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-400" />
            Competitive Win/Loss Breakdown
          </h3>

          {/* Graphical Percentage Bar */}
          <div className="h-3 w-full rounded-full bg-[#1a1b26] flex overflow-hidden mb-4 border border-white/5">
            <div
              style={{ width: `${winRate}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Won: ${winRate}%`}
            />
            <div
              style={{ width: `${drawRate}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Drawn: ${drawRate}%`}
            />
            <div
              style={{ width: `${lossRate}%` }}
              className="bg-red-500 h-full transition-all"
              title={`Lost: ${lossRate}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#1a1b26] border border-white/5">
              <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Victories
              </span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {gamesWon} ({winRate}%)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1a1b26] border border-white/5">
              <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <Equal className="h-3.5 w-3.5 text-amber-400" />
                Draws
              </span>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                {gamesDrawn} ({drawRate}%)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1a1b26] border border-white/5">
              <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                Defeats
              </span>
              <div className="text-lg font-black text-red-400 font-mono mt-0.5">
                {gamesLost} ({lossRate}%)
              </div>
            </div>
          </div>
        </div>

        {/* Edit Custom Profile Display Name */}
        {p && (
          <ProfileSetup profile={p} onUpdate={handleProfileUpdated} />
        )}
      </main>

      <Footer />
    </div>
  )
}
