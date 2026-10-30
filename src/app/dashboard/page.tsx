'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Swords,
  Trophy,
  Flame,
  Users,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OnlinePlayers from '@/components/OnlinePlayers'
import MatchmakingModal from '@/components/MatchmakingModal'
import GameInvite from '@/components/GameInvite'
import type { Game } from '@/types'

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false)
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [loadingGames, setLoadingGames] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchRecentGames = async () => {
      setLoadingGames(true)
      try {
        const { data, error } = await supabase
          .from('games')
          .select(
            '*, white_player:profiles!white_player_id(*), black_player:profiles!black_player_id(*)'
          )
          .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(6)

        if (!error && data) {
          setRecentGames(data as Game[])
        }
      } catch (err) {
        console.error('Error fetching recent games:', err)
      } finally {
        setLoadingGames(false)
      }
    }

    fetchRecentGames()
  }, [user, supabase])

  const handleGameFound = (gameId: string) => {
    setIsMatchmakingOpen(false)
    router.push(`/game/${gameId}`)
  }

  // Calculate statistics
  const gamesPlayed = profile?.games_played || 0
  const gamesWon = profile?.games_won || 0
  const winRate =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <Navbar />
      <GameInvite />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Combat Headquarters
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
              Welcome, {profile?.display_name || 'Grandmaster'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Ready for your next rated battle? The arena awaits your tactical brilliance.
            </p>
          </div>

          <button
            onClick={() => setIsMatchmakingOpen(true)}
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/60 hover:shadow-emerald-900/50 transition-all duration-200"
          >
            <Swords className="h-5 w-5" />
            Instant Matchmaking
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#12131a] border border-white/5 p-5 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Elo Rating</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                {profile?.rating || 1200}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-[#12131a] border border-white/5 p-5 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Games Played</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {gamesPlayed}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[#12131a] border border-white/5 p-5 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Victories</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {gamesWon}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-[#12131a] border border-white/5 p-5 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Win Ratio</span>
              <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">
                {winRate}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Percent className="h-5 w-5" />
            </div>
          </motion.div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Center: Quick Play & History (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Play Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#12131a] to-[#12131a] border border-emerald-500/20 p-6 sm:p-8">
              <div className="relative z-10 max-w-lg space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase font-bold">
                  <Flame className="h-3 w-3" />
                  Speed Pairing Active
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Start a Rated 10-Minute Battle
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Join hundreds of chess enthusiasts in our live matchmaking pool. 
                  Fair play guaranteed with certified chess rule enforcement.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsMatchmakingOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-950"
                  >
                    <Swords className="h-4 w-4" />
                    Find Match Now
                  </button>
                  <button
                    onClick={() => router.push('/friends')}
                    className="flex items-center gap-2 rounded-xl bg-[#1a1b26] hover:bg-[#24253a] border border-white/10 px-5 py-3 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                  >
                    <Users className="h-4 w-4" />
                    Challenge Friends
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Match History */}
            <div className="rounded-3xl bg-[#12131a] border border-white/5 p-6 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Recent Match History
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  Last {recentGames.length} matches
                </span>
              </div>

              {loadingGames ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Loading match records...
                </div>
              ) : recentGames.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Trophy className="h-8 w-8 text-gray-600 mx-auto opacity-40" />
                  <p className="text-xs text-gray-400">
                    No completed matches yet. Jump into the queue to record your first game!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentGames.map((game) => {
                    const isWhite = game.white_player_id === user?.id
                    const opponent = isWhite ? game.black_player : game.white_player
                    const isWinner = game.winner_id === user?.id
                    const isDraw = game.result === 'draw'
                    const isActive = game.status === 'active'

                    return (
                      <div
                        key={game.id}
                        onClick={() => router.push(`/game/${game.id}`)}
                        className="flex items-center justify-between rounded-xl bg-[#1a1b26]/70 hover:bg-[#1a1b26] border border-white/5 p-3.5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              isActive
                                ? 'bg-amber-400 animate-pulse'
                                : isWinner
                                ? 'bg-emerald-400'
                                : isDraw
                                ? 'bg-gray-400'
                                : 'bg-red-400'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                              vs {opponent?.display_name || 'Chess Opponent'}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Played as {isWhite ? 'White' : 'Black'} •{' '}
                              {new Date(game.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isActive
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : isWinner
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isDraw
                                ? 'bg-gray-500/10 text-gray-300 border border-gray-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {isActive
                              ? 'In Progress'
                              : isWinner
                              ? 'Victory (+15)'
                              : isDraw
                              ? 'Draw (0)'
                              : 'Defeat (-15)'}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Live Online Players (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <OnlinePlayers
              onChallenge={(targetUser) => {
                supabase
                  .from('game_invites')
                  .insert({
                    from_user_id: user?.id,
                    to_user_id: targetUser.user_id,
                    status: 'pending',
                    time_control: 600,
                  })
                  .then(() => {
                    // toast handled inside component
                  })
              }}
            />
          </div>
        </div>
      </main>

      {/* Matchmaking Modal */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        onClose={() => setIsMatchmakingOpen(false)}
        onGameFound={handleGameFound}
      />

      <Footer />
    </div>
  )
}
