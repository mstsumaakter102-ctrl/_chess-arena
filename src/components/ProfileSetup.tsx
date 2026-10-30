'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Check, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'
import { toast } from 'sonner'

interface ProfileSetupProps {
  profile: Profile
  onUpdate: (updated: Partial<Profile>) => void
}

export default function ProfileSetup({ profile, onUpdate }: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error('Display name cannot be blank.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile display name updated!')
      onUpdate({ display_name: displayName.trim() })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-[#12131a] border border-white/5 p-6 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-6">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Custom Profile Identity</h3>
          <p className="text-xs text-gray-400">
            Set your public display name shown across boards and leaderboards
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Public Display Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={28}
              className="w-full rounded-xl bg-[#1a1b26] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              placeholder="e.g. Grandmaster Bobby"
              required
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Your unique username handle is: @{profile.username}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <Shield className="h-4 w-4" />
            <span>Rating: {profile.rating} Elo</span>
          </div>

          <button
            type="submit"
            disabled={saving || displayName.trim() === profile.display_name}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
