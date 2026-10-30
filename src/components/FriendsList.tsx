'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Swords,
  Trash2,
  Shield,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useFriends } from '@/hooks/useFriends'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'
import { toast } from 'sonner'

interface FriendsListProps {
  onChallenge?: (friend: Profile) => void
}

export default function FriendsList({ onChallenge }: FriendsListProps) {
  const { user } = useAuth()
  const {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
  } = useFriends()

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [challengingId, setChallengingId] = useState<string | null>(null)
  const supabase = createClient()

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    const results = await searchUsers(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }

  // Handle Challenge Friend
  const handleChallenge = async (friend: Profile) => {
    if (!user) return
    if (onChallenge) {
      onChallenge(friend)
      return
    }

    setChallengingId(friend.id)
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
        toast.success(`Challenge sent to ${friend.display_name}!`)
      }
    } catch {
      toast.error('Could not send challenge.')
    } finally {
      setTimeout(() => setChallengingId(null), 3000)
    }
  }

  return (
    <div className="rounded-3xl bg-[#12131a] border border-white/5 p-6 shadow-2xl shadow-black/50">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Friends Network</h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-[#1a1b26] p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('friends')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Friends ({friends.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Requests
            {pendingReceived.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                {pendingReceived.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('find')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'find'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Find
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500 mb-2" />
            <span className="text-xs text-gray-400">Loading your friends...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Tab 1: Friends */}
            {activeTab === 'friends' && (
              <motion.div
                key="friends-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {friends.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#1a1b26] border border-white/5 text-gray-400">
                      <Users className="h-8 w-8 text-gray-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No Friends Added Yet</h4>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Search for players using their custom display name or handle to challenge them anytime!
                    </p>
                    <button
                      onClick={() => setActiveTab('find')}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      Find Chess Players
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between rounded-2xl bg-[#1a1b26] border border-white/5 p-4 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-amber-600/20 flex items-center justify-center text-sm font-bold text-white border border-white/10">
                              {friend.display_name?.charAt(0) || 'F'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[#1a1b26] ${
                                friend.is_online ? 'bg-emerald-500' : 'bg-gray-500'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">
                              {friend.display_name}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <span>@{friend.username}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-mono flex items-center gap-0.5">
                                <Shield className="h-3 w-3" />
                                {friend.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleChallenge(friend)}
                            disabled={challengingId === friend.id}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-950 transition-all"
                          >
                            <Swords className="h-3.5 w-3.5" />
                            {challengingId === friend.id ? 'Sent' : 'Play'}
                          </button>
                          <button
                            onClick={() => removeFriend(friend.id)}
                            title="Remove friend"
                            className="p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 2: Requests */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Received Requests */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
                    Received Requests ({pendingReceived.length})
                  </h4>
                  {pendingReceived.length === 0 ? (
                    <div className="rounded-xl bg-[#1a1b26]/50 border border-white/5 p-6 text-center text-xs text-gray-500">
                      No pending friend requests.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingReceived.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-2xl bg-[#1a1b26] border border-white/5 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-600/30 flex items-center justify-center font-bold text-white border border-white/10">
                              {req.requester?.display_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {req.requester?.display_name}
                              </div>
                              <div className="text-xs text-amber-400 font-mono">
                                {req.requester?.rating} Elo
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => acceptFriendRequest(req.id)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Accept
                            </button>
                            <button
                              onClick={() => declineFriendRequest(req.id)}
                              className="flex items-center gap-1 rounded-xl bg-[#24253a] hover:bg-[#2e2f4a] px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
                    Sent Requests ({pendingSent.length})
                  </h4>
                  {pendingSent.length === 0 ? (
                    <div className="rounded-xl bg-[#1a1b26]/50 border border-white/5 p-6 text-center text-xs text-gray-500">
                      No outgoing requests.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingSent.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-2xl bg-[#1a1b26] border border-white/5 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gray-700/50 flex items-center justify-center font-bold text-white border border-white/10">
                              {req.addressee?.display_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {req.addressee?.display_name}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{req.addressee?.username}
                              </div>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-amber-400 font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Pending Response
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Find Users */}
            {activeTab === 'find' && (
              <motion.div
                key="find-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Search Input Form */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search player by display name or handle..."
                      className="w-full rounded-xl bg-[#1a1b26] border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </button>
                </form>

                {/* Results List */}
                <div className="space-y-2 mt-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((player) => {
                      const isAlreadyFriend = friends.some((f) => f.id === player.id)
                      const isPendingSent = pendingSent.some(
                        (p) => p.addressee_id === player.id
                      )

                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between rounded-2xl bg-[#1a1b26] border border-white/5 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-600/30 flex items-center justify-center font-bold text-white border border-white/10">
                              {player.display_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {player.display_name}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <span>@{player.username}</span>
                                <span>•</span>
                                <span className="text-amber-400 font-mono">
                                  {player.rating} Elo
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {isAlreadyFriend ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <Check className="h-3.5 w-3.5" />
                                Friends
                              </span>
                            ) : isPendingSent ? (
                              <span className="flex items-center gap-1 text-xs text-amber-400 font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <Clock className="h-3.5 w-3.5" />
                                Requested
                              </span>
                            ) : (
                              <button
                                onClick={() => sendFriendRequest(player.id)}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : searchQuery && !searching ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No players found matching "{searchQuery}".
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center">
                      <Sparkles className="h-5 w-5 mb-2 opacity-50 text-emerald-400" />
                      Type a username and hit search to expand your chess circle.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
