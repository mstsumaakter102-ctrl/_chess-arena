'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FriendsList from '@/components/FriendsList'
import GameInvite from '@/components/GameInvite'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/types'
import { toast } from 'sonner'

export default function FriendsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const handleChallenge = async (friend: Profile) => {
    if (!user) return

    try {
      const { error } = await supabase.from('game_invites').insert({
        from_user_id: user.id,
        to_user_id: friend.id,
        status: 'pending',
        time_control: 600,
      })

      if (error) {
        toast.error('Failed to send challenge: ' + error.message)
      } else {
        toast.success(`Challenge sent to ${friend.display_name}! Awaiting their response...`)
      }
    } catch {
      toast.error('Could not send challenge.')
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <Navbar />
      <GameInvite />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Social & Community
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Player Connections
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Search players by custom name, manage incoming requests, and issue instant match challenges.
          </p>
        </div>

        <FriendsList onChallenge={handleChallenge} />
      </main>

      <Footer />
    </div>
  )
}
