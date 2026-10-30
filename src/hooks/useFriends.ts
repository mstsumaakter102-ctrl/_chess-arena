'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Friendship, Profile } from '@/types'
import { toast } from 'sonner'

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Profile[]>([])
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([])
  const [pendingSent, setPendingSent] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchFriendships = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // 1. Fetch where user is requester
      const { data: sentData, error: sentError } = await supabase
        .from('friendships')
        .select('*, requester:profiles!requester_id(*), addressee:profiles!addressee_id(*)')
        .eq('requester_id', user.id)

      if (sentError) throw sentError

      // 2. Fetch where user is addressee
      const { data: recData, error: recError } = await supabase
        .from('friendships')
        .select('*, requester:profiles!requester_id(*), addressee:profiles!addressee_id(*)')
        .eq('addressee_id', user.id)

      if (recError) throw recError

      const allSent = (sentData as Friendship[]) || []
      const allRec = (recData as Friendship[]) || []

      // Accepted friends: extract the counterpart profile
      const acceptedProfiles: Profile[] = []
      allSent.forEach((f) => {
        if (f.status === 'accepted' && f.addressee) {
          acceptedProfiles.push(f.addressee)
        }
      })
      allRec.forEach((f) => {
        if (f.status === 'accepted' && f.requester) {
          acceptedProfiles.push(f.requester)
        }
      })

      // Deduplicate by id
      const uniqueFriends = Array.from(
        new Map(acceptedProfiles.map((p) => [p.id, p])).values()
      )

      setFriends(uniqueFriends)
      setPendingReceived(allRec.filter((f) => f.status === 'pending'))
      setPendingSent(allSent.filter((f) => f.status === 'pending'))
    } catch (err: any) {
      console.error('Error fetching friendships:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchFriendships()

    if (!user) return

    // Subscribe to realtime changes on friendships table
    const channel = supabase
      .channel('friendships-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          fetchFriendships()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchFriendships, supabase])

  const sendFriendRequest = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false
    if (targetUserId === user.id) {
      toast.error("You cannot add yourself as a friend.")
      return false
    }

    try {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: 'pending',
      })

      if (error) {
        if (error.code === '23505') {
          toast.info('Friend request already sent or exists.')
        } else {
          toast.error(error.message)
        }
        return false
      }

      toast.success('Friend request sent!')
      fetchFriendships()
      return true
    } catch (err: any) {
      toast.error('Failed to send friend request.')
      return false
    }
  }

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)

      if (error) throw error
      toast.success('Friend request accepted!')
      fetchFriendships()
    } catch (err: any) {
      toast.error('Failed to accept friend request.')
    }
  }

  const declineFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)

      if (error) throw error
      toast.info('Friend request declined.')
      fetchFriendships()
    } catch (err: any) {
      toast.error('Failed to decline friend request.')
    }
  }

  const removeFriend = async (friendProfileId: string) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${friendProfileId}),and(requester_id.eq.${friendProfileId},addressee_id.eq.${user.id})`
        )

      if (error) throw error
      toast.success('Friend removed.')
      fetchFriendships()
    } catch (err: any) {
      toast.error('Failed to remove friend.')
    }
  }

  const searchUsers = async (query: string): Promise<Profile[]> => {
    if (!query.trim() || !user) return []
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10)

      if (error) throw error
      return (data as Profile[]) || []
    } catch (err) {
      console.error('Search error:', err)
      return []
    }
  }

  return {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    refreshFriends: fetchFriendships,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
  }
}
