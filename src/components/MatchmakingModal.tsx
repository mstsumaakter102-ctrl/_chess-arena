'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, X, Shield, Clock, Flame, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface MatchmakingModalProps {
  isOpen: boolean
  onClose: () => void
  onGameFound: (gameId: string) => void
}

export default function MatchmakingModal({
  isOpen,
  onClose,
  onGameFound,
}: MatchmakingModalProps) {
  const { user, profile } = useAuth()
  const [searching, setSearching] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timeControl, setTimeControl] = useState<number>(600) // 10 min default
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Start / stop timer
  useEffect(() => {
    if (searching) {
      setElapsedSeconds(0)
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsedSeconds(0)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [searching])

  // Handle Matchmaking
  const startMatchmaking = async () => {
    if (!user || !profile) return
    setSearching(true)

    try {
      // 1. Listen for game creation where user is white or black
      const channel = supabase
        .channel(`matchmaking-user-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'games',
          },
          (payload) => {
            const newGame = payload.new as any
            if (
              newGame.status === 'active' &&
              (newGame.white_player_id === user.id ||
                newGame.black_player_id === user.id)
            ) {
              setSearching(false)
              onGameFound(newGame.id)
            }
          }
        )
        .subscribe()

      channelRef.current = channel

      // 2. Call find_match RPC function
      const { data: matchedGameId, error } = await supabase.rpc('find_match', {
        p_user_id: user.id,
        p_rating: profile.rating,
      })

      if (error) {
        console.error('Matchmaking RPC error:', error)
        // Fallback: direct insert to queue
        await supabase
          .from('matchmaking_queue')
          .upsert({ user_id: user.id, rating: profile.rating })
      } else if (matchedGameId) {
        // Instant match found!
        setSearching(false)
        onGameFound(matchedGameId)
      }
    } catch (err) {
      console.error('Matchmaking error:', err)
    }
  }

  const cancelMatchmaking = async () => {
    if (!user) return
    setSearching(false)

    try {
      await supabase.from('matchmaking_queue').delete().eq('user_id', user.id)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    } catch (err) {
      console.error('Cancel matchmaking error:', err)
    }
  }

  const handleClose = () => {
    if (searching) {
      cancelMatchmaking()
    }
    onClose()
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#12131a] border border-white/10 p-6 shadow-2xl shadow-black/80 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Swords className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Matchmaking</h3>
                  <p className="text-xs text-gray-400">Play rated chess instantly</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            {!searching ? (
              <div className="py-6 space-y-6">
                {/* User Card */}
                <div className="flex items-center justify-between rounded-xl bg-[#1a1b26] p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-600/30 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/30">
                      {profile?.display_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {profile?.display_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                        <Shield className="h-3.5 w-3.5" />
                        <span>{profile?.rating} Elo</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Time Control Options */}
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-2">
                    Time Control:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '3 min Blitz', value: 180 },
                      { label: '5 min Rapid', value: 300 },
                      { label: '10 min Standard', value: 600 },
                    ].map((tc) => (
                      <button
                        key={tc.value}
                        type="button"
                        onClick={() => setTimeControl(tc.value)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          timeControl === tc.value
                            ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-[#1a1b26] border-white/5 text-gray-400 hover:bg-[#24253a] hover:text-white'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5 mx-auto mb-1 opacity-70" />
                        {tc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startMatchmaking}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition-all duration-200"
                >
                  <Flame className="h-4 w-4" />
                  Find Opponent Now
                </button>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                {/* Searching Radar Visual */}
                <div className="relative flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="absolute h-20 w-20 rounded-full border border-emerald-400/30 animate-ping opacity-60" />
                  <div className="absolute h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                    <Swords className="h-6 w-6 text-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Searching for an Opponent...</h4>
                  <p className="text-xs text-gray-400">
                    Pairing with similar Elo rating ({profile?.rating} ± 150)
                  </p>
                </div>

                <div className="font-mono text-sm font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Elapsed: {formatTime(elapsedSeconds)}
                </div>

                <button
                  onClick={cancelMatchmaking}
                  className="w-full rounded-xl bg-[#1a1b26] hover:bg-[#24253a] border border-white/10 py-2.5 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                >
                  Cancel Search
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
