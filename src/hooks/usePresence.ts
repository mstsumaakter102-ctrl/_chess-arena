'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface OnlineUserPresence {
  user_id: string
  username: string
  display_name: string
  rating: number
  online_at?: string
}

export function usePresence() {
  const { user, profile } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user || !profile) return

    const channel = supabase.channel('online-lobby-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{
          user_id: string
          username: string
          display_name: string
          rating: number
          online_at: string
        }>()

        const usersMap = new Map<string, OnlineUserPresence>()

        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (p.user_id) {
              usersMap.set(p.user_id, {
                user_id: p.user_id,
                username: p.username || 'Player',
                display_name: p.display_name || 'Player',
                rating: p.rating || 1200,
                online_at: p.online_at,
              })
            }
          })
        })

        setOnlineUsers(Array.from(usersMap.values()))
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers((prev) => {
          const map = new Map(prev.map((u) => [u.user_id, u]))
          newPresences.forEach((p: any) => {
            if (p.user_id) {
              map.set(p.user_id, {
                user_id: p.user_id,
                username: p.username || 'Player',
                display_name: p.display_name || 'Player',
                rating: p.rating || 1200,
                online_at: p.online_at,
              })
            }
          })
          return Array.from(map.values())
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers((prev) => {
          const leftIds = new Set(leftPresences.map((p: any) => p.user_id))
          return prev.filter((u) => !leftIds.has(u.user_id))
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await channel.track({
            user_id: user.id,
            username: profile.username,
            display_name: profile.display_name,
            rating: profile.rating,
            online_at: new Date().toISOString(),
          })

          // Update profiles table status
          await supabase
            .from('profiles')
            .update({ is_online: true, last_seen: new Date().toISOString() })
            .eq('id', user.id)
        }
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [user, profile, supabase])

  return { onlineUsers, isConnected }
}
