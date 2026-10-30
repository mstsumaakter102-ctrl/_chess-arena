'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Radio, Shield, Loader2, Sparkles, UserCheck } from 'lucide-react'
import { usePresence, type OnlineUserPresence } from '@/hooks/usePresence'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface OnlinePlayersProps {
  onChallenge?: (user: OnlineUserPresence) => void
}

export default function OnlinePlayers({ onChallenge }: OnlinePlayersProps) {
  const { user } = useAuth()
  const { onlineUsers, isConnected } = usePresence()
  const [challengingId, setChallengingId] = useState<string | null>(null)
  const supabase = createClient()

  // Filter out self
  const otherPlayers = onlineUsers.filter((p) => p.user_id !== user?.id)

  const handleSendChallenge = async (targetUser: OnlineUserPresence) => {
    if (!user) return
    if (onChallenge) {
      onChallenge(targetUser)
      return
    }

    setChallengingId(targetUser.user_id)
    try {
      const { error } = await supabase.from('game_invites').insert({
        from_user_id: user.id,
        to_user_id: targetUser.user_id,
        status: 'pending',
        time_control: 600, // 10 minutes
      })

      if (error) {
        toast.error('Failed to send challenge: ' + error.message)
      } else {
        toast.success(`Challenge sent to ${targetUser.display_name}!`)
      }
    } catch (err) {
      toast.error('Could not send game challenge.')
    } finally {
      setTimeout(() => setChallengingId(null), 2500)
    }
  }

  return (
    <div className="rounded-2xl bg-[#12131a] border border-white/5 p-5 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Players Online
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
          {otherPlayers.length + 1} Connected
        </span>
      </div>

      {/* Players List */}
      {!isConnected ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mb-2" />
          <span className="text-xs text-gray-400">Connecting to arena lobby...</span>
        </div>
      ) : otherPlayers.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3 rounded-full bg-[#1a1b26] border border-white/5 text-gray-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-gray-300">
            You're currently the only player in the lobby!
          </p>
          <p className="text-[11px] text-gray-500 max-w-[200px]">
            Share your profile link or wait for opponents to join.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {otherPlayers.map((player) => {
            const isChallenging = challengingId === player.user_id

            return (
              <motion.div
                key={player.user_id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-xl bg-[#1a1b26]/70 hover:bg-[#1a1b26] border border-white/5 p-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600/30 to-blue-600/30 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                      {player.display_name?.charAt(0) || 'P'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#12131a]" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {player.display_name}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                      <Shield className="h-3 w-3" />
                      <span>{player.rating}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendChallenge(player)}
                  disabled={isChallenging}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isChallenging
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/40'
                  }`}
                >
                  {isChallenging ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Swords className="h-3.5 w-3.5" />
                      Challenge
                    </>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
