'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Check, X, Shield, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GameInvite as GameInviteType } from '@/types'
import { toast } from 'sonner'

export default function GameInvite() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeInvite, setActiveInvite] = useState<GameInviteType | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(30)

  useEffect(() => {
    if (!user) return

    // 1. Initial check for pending invites
    const checkPendingInvites = async () => {
      const { data, error } = await supabase
        .from('game_invites')
        .select('*, from_user:profiles!from_user_id(*)')
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setActiveInvite(data[0] as GameInviteType)
        setSecondsRemaining(30)
      }
    }

    checkPendingInvites()

    // 2. Realtime listener for incoming invites
    const channel = supabase
      .channel(`incoming-invites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invites',
          filter: `to_user_id=eq.${user.id}`,
        },
        async (payload) => {
          const invite = payload.new as GameInviteType
          if (invite.status === 'pending') {
            // Fetch sender profile details
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', invite.from_user_id)
              .single()

            setActiveInvite({
              ...invite,
              from_user: sender || undefined,
            })
            setSecondsRemaining(30)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Countdown timer for active invite
  useEffect(() => {
    if (!activeInvite) return

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleDecline(true) // Auto-expire
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeInvite])

  const handleAccept = async () => {
    if (!activeInvite || !user) return

    try {
      // Call accept_invite RPC function
      const { data: gameId, error } = await supabase.rpc('accept_invite', {
        p_invite_id: activeInvite.id,
        p_user_id: user.id,
      })

      if (error) {
        toast.error('Failed to accept challenge: ' + error.message)
      } else if (gameId) {
        setActiveInvite(null)
        toast.success('Challenge accepted! Entering arena...')
        router.push(`/game/${gameId}`)
      }
    } catch (err: any) {
      toast.error('Error accepting challenge.')
    }
  }

  const handleDecline = async (expired: boolean = false) => {
    if (!activeInvite) return

    try {
      await supabase
        .from('game_invites')
        .update({ status: expired ? 'expired' : 'declined' })
        .eq('id', activeInvite.id)

      setActiveInvite(null)
      if (!expired) toast.info('Game challenge declined.')
    } catch (err) {
      console.error('Error declining invite:', err)
    }
  }

  return (
    <AnimatePresence>
      {activeInvite && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 right-4 sm:right-6 z-50 w-full max-w-sm rounded-2xl bg-[#12131a]/95 backdrop-blur-xl border border-emerald-500/30 p-4 shadow-2xl shadow-black/80"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Swords className="h-6 w-6 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Challenge Received
                </span>
                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {secondsRemaining}s
                </span>
              </div>

              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {activeInvite.from_user?.display_name || 'Online Player'}
              </h4>

              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-amber-400 font-mono">
                  <Shield className="h-3 w-3" />
                  {activeInvite.from_user?.rating || 1200}
                </span>
                <span>•</span>
                <span>{Math.floor(activeInvite.time_control / 60)} min</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-white/5">
            <button
              onClick={() => handleDecline(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1a1b26] hover:bg-[#24253a] border border-white/10 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950 transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              Accept & Play
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
