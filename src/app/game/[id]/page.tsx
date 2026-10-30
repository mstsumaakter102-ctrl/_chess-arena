'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Clock,
  Flag,
  RotateCcw,
  Shield,
  Loader2,
  Swords,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Chess } from 'chess.js'
import { useAuth } from '@/context/AuthContext'
import { useGame } from '@/hooks/useGame'
import { getGameStatus } from '@/lib/chess-engine'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChessBoard from '@/components/ChessBoard'
import GameOverModal from '@/components/GameOverModal'
import { toast } from 'sonner'

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string
  const { user } = useAuth()
  const { game, moves, loading, error, makeMove, resignGame } = useGame(gameId)

  const [confirmResign, setConfirmResign] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Determine player colors & turn
  const isWhitePlayer = user?.id === game?.white_player_id
  const isBlackPlayer = user?.id === game?.black_player_id
  const isParticipant = isWhitePlayer || isBlackPlayer

  const playerColor: 'white' | 'black' = isBlackPlayer ? 'black' : 'white'

  // Turn from current FEN
  const gameStatus = useMemo(() => {
    if (!game?.fen) return null
    return getGameStatus(game.fen)
  }, [game?.fen])

  const isMyTurn = useMemo(() => {
    if (!gameStatus || !isParticipant) return false
    if (game?.status !== 'active') return false
    return (
      (gameStatus.turn === 'w' && isWhitePlayer) ||
      (gameStatus.turn === 'b' && isBlackPlayer)
    )
  }, [gameStatus, isParticipant, game?.status, isWhitePlayer, isBlackPlayer])

  // Last Move calculation
  const lastMove = useMemo(() => {
    if (moves.length === 0) return null
    const last = moves[moves.length - 1]
    return { from: last.move_from, to: last.move_to }
  }, [moves])

  // Format move history into pairs: 1. e4 e5, 2. Nf3 Nc6
  const formattedMovePairs = useMemo(() => {
    const pairs: { moveNum: number; white: string; black?: string }[] = []
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        moveNum: Math.floor(i / 2) + 1,
        white: moves[i]?.move_san || '',
        black: moves[i + 1]?.move_san || undefined,
      })
    }
    return pairs
  }, [moves])

  const movesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    movesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves.length])

  // Clocks / Timers
  const [whiteSeconds, setWhiteSeconds] = useState(game?.white_time_remaining ?? 600)
  const [blackSeconds, setBlackSeconds] = useState(game?.black_time_remaining ?? 600)

  useEffect(() => {
    if (game) {
      setWhiteSeconds(game.white_time_remaining)
      setBlackSeconds(game.black_time_remaining)
    }
  }, [game?.white_time_remaining, game?.black_time_remaining])

  useEffect(() => {
    if (!game || game.status !== 'active') return

    const timer = setInterval(() => {
      if (gameStatus?.turn === 'w') {
        setWhiteSeconds((prev) => Math.max(0, prev - 1))
      } else {
        setBlackSeconds((prev) => Math.max(0, prev - 1))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [game?.status, gameStatus?.turn])

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Handle Resign
  const handleResign = async () => {
    if (!user) return
    await resignGame(user.id)
    setConfirmResign(false)
    toast.info('You have resigned the game.')
  }

  // Handle Share Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    toast.success('Game link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-gray-400 font-medium">Entering Chess Arena...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <h2 className="text-xl font-bold">Game Not Found</h2>
          <p className="text-xs text-gray-400 max-w-sm">
            {error || 'The requested game room does not exist or has expired.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const whitePlayer = game.white_player
  const blackPlayer = game.black_player
  const opponent = isWhitePlayer ? blackPlayer : whitePlayer
  const isOpponentTurn = !isMyTurn && game.status === 'active'

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-xl bg-[#12131a] hover:bg-[#1a1b26] border border-white/5 text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {game.status === 'active' ? 'Live Rated Match' : 'Match Completed'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">
                  10m Standard
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                {whitePlayer?.display_name || 'White'} vs {blackPlayer?.display_name || 'Black'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-xl bg-[#12131a] hover:bg-[#1a1b26] border border-white/10 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Share Match</span>
            </button>
          </div>
        </div>

        {/* Game Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chessboard Column (7-8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Opponent Banner */}
            <div
              className={`flex items-center justify-between rounded-2xl bg-[#12131a] border p-3.5 transition-all ${
                isOpponentTurn
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-sm text-white border border-white/10">
                    {opponent?.display_name?.charAt(0) || 'O'}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#12131a] ${
                      opponent?.is_online ? 'bg-emerald-500' : 'bg-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {opponent?.display_name || 'Opponent'}
                    <span className="text-[10px] text-gray-400 font-normal">
                      ({playerColor === 'white' ? 'Black' : 'White'})
                    </span>
                  </div>
                  <div className="text-xs text-amber-400 font-mono flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {opponent?.rating || 1200} Elo
                  </div>
                </div>
              </div>

              {/* Opponent Clock */}
              <div
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-sm font-bold transition-all ${
                  isOpponentTurn
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-[#1a1b26] border border-white/5 text-gray-400'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>
                  {formatClock(playerColor === 'white' ? blackSeconds : whiteSeconds)}
                </span>
              </div>
            </div>

            {/* The Interactive Board */}
            <div className="relative">
              <ChessBoard
                fen={game.fen}
                orientation={playerColor}
                onMove={(from, to, promotion) => {
                  if (!isMyTurn) {
                    toast.error("It's not your turn!")
                    return false
                  }
                  return makeMove(from, to, promotion)
                }}
                disabled={!isMyTurn || game.status !== 'active'}
                lastMove={lastMove}
                isCheck={gameStatus?.isCheck}
              />
            </div>

            {/* Current Player Banner */}
            <div
              className={`flex items-center justify-between rounded-2xl bg-[#12131a] border p-3.5 transition-all ${
                isMyTurn
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-sm text-white border border-emerald-400/30">
                    {user ? (isWhitePlayer ? whitePlayer?.display_name?.charAt(0) : blackPlayer?.display_name?.charAt(0)) : 'Y'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#12131a]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {isWhitePlayer ? whitePlayer?.display_name : blackPlayer?.display_name} (You)
                    <span className="text-[10px] text-gray-400 font-normal">
                      ({playerColor})
                    </span>
                  </div>
                  <div className="text-xs text-amber-400 font-mono flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {(isWhitePlayer ? whitePlayer?.rating : blackPlayer?.rating) || 1200} Elo
                  </div>
                </div>
              </div>

              {/* Player Clock */}
              <div
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-sm font-bold transition-all ${
                  isMyTurn
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-[#1a1b26] border border-white/5 text-gray-400'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>
                  {formatClock(playerColor === 'white' ? whiteSeconds : blackSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Move Notation History & Controls (4-5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Status Card */}
            <div className="rounded-2xl bg-[#12131a] border border-white/5 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Turn Indicator:</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-full ${
                    game.status !== 'active'
                      ? 'bg-gray-500/20 text-gray-400'
                      : isMyTurn
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {game.status !== 'active'
                    ? 'Game Completed'
                    : isMyTurn
                    ? 'Your Turn'
                    : "Opponent's Turn"}
                </span>
              </div>

              {gameStatus?.isCheck && game.status === 'active' && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/25 p-2.5 text-xs text-red-400 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  King is currently in check!
                </div>
              )}
            </div>

            {/* Move History Log */}
            <div className="rounded-2xl bg-[#12131a] border border-white/5 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold">
                  Move History ({moves.length})
                </h3>
                <span className="text-[10px] font-mono text-gray-500">PGN Notation</span>
              </div>

              <div className="h-64 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {formattedMovePairs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    Game starts when White makes the first move.
                  </div>
                ) : (
                  formattedMovePairs.map((pair) => (
                    <div
                      key={pair.moveNum}
                      className="grid grid-cols-12 py-1 px-2 rounded hover:bg-[#1a1b26] transition-colors"
                    >
                      <span className="col-span-3 text-gray-500">{pair.moveNum}.</span>
                      <span className="col-span-4 font-semibold text-white">
                        {pair.white}
                      </span>
                      <span className="col-span-5 font-semibold text-gray-300">
                        {pair.black || ''}
                      </span>
                    </div>
                  ))
                )}
                <div ref={movesEndRef} />
              </div>
            </div>

            {/* Game Controls: Resign */}
            {isParticipant && game.status === 'active' && (
              <div className="rounded-2xl bg-[#12131a] border border-white/5 p-4 space-y-3">
                {!confirmResign ? (
                  <button
                    onClick={() => setConfirmResign(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2.5 text-xs font-semibold text-red-400 transition-all"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Resign Game
                  </button>
                ) : (
                  <div className="space-y-2 p-2 rounded-xl bg-red-950/20 border border-red-500/30">
                    <p className="text-xs text-red-300 font-semibold text-center">
                      Are you sure you want to resign?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleResign}
                        className="rounded-lg bg-red-600 hover:bg-red-500 py-1.5 text-xs font-bold text-white transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmResign(false)}
                        className="rounded-lg bg-[#1a1b26] hover:bg-[#24253a] py-1.5 text-xs font-semibold text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {game.status === 'completed' && (
        <GameOverModal
          isOpen={true}
          game={game}
          currentUserId={user?.id || ''}
          onClose={() => router.push('/dashboard')}
        />
      )}

      <Footer />
    </div>
  )
}
