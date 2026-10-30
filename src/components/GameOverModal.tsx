'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Frown, Equal, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import type { Game } from '@/types'

interface GameOverModalProps {
  isOpen: boolean
  game: Game
  currentUserId: string
  onClose: () => void
  onRematch?: () => void
}

export default function GameOverModal({
  isOpen,
  game,
  currentUserId,
  onClose,
  onRematch,
}: GameOverModalProps) {
  if (!isOpen) return null

  const isWhite = game.white_player_id === currentUserId
  const isWinner = game.winner_id === currentUserId
  const isDraw = game.result === 'draw'

  const opponent = isWhite ? game.black_player : game.white_player

  let title = 'Game Finished'
  let subtext = 'Game has concluded.'
  let outcomeColor = 'emerald'

  if (isDraw) {
    title = 'Stalemate / Draw'
    subtext = 'The match concluded in an honorable tie.'
    outcomeColor = 'amber'
  } else if (isWinner) {
    title = 'Victory!'
    subtext = 'Glorious checkmate! You proved your mastery.'
    outcomeColor = 'emerald'
  } else {
    title = 'Defeat'
    subtext = 'Your king was brought down. Learn and conquer next time.'
    outcomeColor = 'red'
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#12131a] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black z-10 text-center"
        >
          {/* Ambient Glow */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-30 ${
              isWinner
                ? 'bg-emerald-500'
                : isDraw
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />

          {/* Outcome Icon */}
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1a1b26] border border-white/10 shadow-inner">
            {isWinner ? (
              <Trophy className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            ) : isDraw ? (
              <Equal className="h-10 w-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
            ) : (
              <Frown className="h-10 w-10 text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]" />
            )}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            {title}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">
            {subtext}
          </p>

          {/* Summary Details */}
          <div className="rounded-2xl bg-[#1a1b26] border border-white/5 p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Opponent</span>
              <span className="font-semibold text-white">
                {opponent?.display_name || 'Chess Opponent'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Rating Impact</span>
              <span
                className={`font-mono font-bold ${
                  isWinner
                    ? 'text-emerald-400'
                    : isDraw
                    ? 'text-gray-300'
                    : 'text-red-400'
                }`}
              >
                {isWinner ? '+15 Elo' : isDraw ? '+0 Elo' : '-15 Elo'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Time Control</span>
              <span className="text-gray-300 font-medium">
                {Math.floor(game.time_control / 60)} min match
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {onRematch && (
              <button
                onClick={onRematch}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-950/40"
              >
                <RotateCcw className="h-4 w-4" />
                Challenge Again
              </button>
            )}

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1b26] hover:bg-[#24253a] border border-white/10 py-3 text-sm font-medium text-gray-300 hover:text-white transition-all"
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
