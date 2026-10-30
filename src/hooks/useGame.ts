'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { validateAndMakeMove, getGameStatus } from '@/lib/chess-engine'
import type { Game, GameMove, MoveResult } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseGameReturn {
  game: Game | null
  moves: GameMove[]
  loading: boolean
  error: string | null
  makeMove: (from: string, to: string, promotion?: string) => boolean
  resignGame: (userId: string) => Promise<void>
}

export function useGame(gameId: string): UseGameReturn {
  const [game, setGame] = useState<Game | null>(null)
  const [moves, setMoves] = useState<GameMove[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const gameChannelRef = useRef<RealtimeChannel | null>(null)
  const movesChannelRef = useRef<RealtimeChannel | null>(null)

  // Fetch initial game + moves data
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch game with joined player profiles
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select(
            '*, white_player:profiles!white_player_id(*), black_player:profiles!black_player_id(*)'
          )
          .eq('id', gameId)
          .single()

        if (gameError) throw gameError
        if (cancelled) return

        setGame(gameData as Game)

        // Fetch all existing moves
        const { data: movesData, error: movesError } = await supabase
          .from('game_moves')
          .select('*')
          .eq('game_id', gameId)
          .order('move_number', { ascending: true })

        if (movesError) throw movesError
        if (cancelled) return

        setMoves((movesData as GameMove[]) || [])
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load game'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [gameId, supabase])

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to game row updates
    const gameChannel = supabase
      .channel(`game-updates-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame((prev) => {
            if (!prev) return prev
            // Merge the updated fields but keep the joined profiles
            return {
              ...prev,
              ...payload.new,
              white_player: prev.white_player,
              black_player: prev.black_player,
            } as Game
          })
        }
      )
      .subscribe()

    gameChannelRef.current = gameChannel

    // Subscribe to new moves
    const movesChannel = supabase
      .channel(`game-moves-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_moves',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newMove = payload.new as GameMove

          setMoves((prev) => {
            // Avoid duplicates (from optimistic inserts)
            const exists = prev.some((m) => m.id === newMove.id)
            if (exists) return prev
            return [...prev, newMove]
          })

          // Also update the game FEN to reflect the new move
          setGame((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              fen: newMove.fen_after,
            }
          })
        }
      )
      .subscribe()

    movesChannelRef.current = movesChannel

    return () => {
      if (gameChannelRef.current) {
        supabase.removeChannel(gameChannelRef.current)
        gameChannelRef.current = null
      }
      if (movesChannelRef.current) {
        supabase.removeChannel(movesChannelRef.current)
        movesChannelRef.current = null
      }
    }
  }, [gameId, supabase])

  // Make a move — synchronous validation, async persistence
  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!game) return false
      if (game.status !== 'active') return false

      const result: MoveResult = validateAndMakeMove(
        game.fen,
        from,
        to,
        promotion
      )

      if (!result.valid) return false

      // Optimistic update: immediately apply the move locally
      const newMove: GameMove = {
        id: crypto.randomUUID(),
        game_id: gameId,
        move_number: result.moveNumber,
        move_san: result.san!,
        move_from: result.from,
        move_to: result.to,
        fen_after: result.fen,
        created_at: new Date().toISOString(),
      }

      setMoves((prev) => [...prev, newMove])
      setGame((prev) => (prev ? { ...prev, fen: result.fen } : prev))

      // Determine new status and result
      let newStatus: Game['status'] = 'active'
      let newResult: Game['result'] = null
      let winnerId: string | null = null

      if (result.isGameOver) {
        newStatus = 'completed'
        if (result.isCheckmate) {
          // The side that just moved wins (turn has flipped, so the winner is the opposite of current turn)
          if (result.turn === 'b') {
            // White just moved and checkmated
            newResult = 'white'
            winnerId = game.white_player_id
          } else {
            newResult = 'black'
            winnerId = game.black_player_id
          }
        } else if (result.isStalemate || result.isDraw) {
          newResult = 'draw'
        }
      }

      // Update optimistically for game-over states
      if (result.isGameOver) {
        setGame((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                result: newResult,
                winner_id: winnerId,
              }
            : prev
        )
      }

      // Persist asynchronously
      ;(async () => {
        try {
          // Insert the move
          await supabase.from('game_moves').insert({
            game_id: gameId,
            move_number: result.moveNumber,
            move_san: result.san,
            move_from: result.from,
            move_to: result.to,
            fen_after: result.fen,
          })

          // Update the game record
          const gameUpdate: Record<string, unknown> = {
            fen: result.fen,
            last_move_at: new Date().toISOString(),
          }

          if (result.isGameOver) {
            gameUpdate.status = newStatus
            gameUpdate.result = newResult
            gameUpdate.winner_id = winnerId
          }

          await supabase.from('games').update(gameUpdate).eq('id', gameId)
        } catch (err) {
          console.error('Failed to persist move:', err)
          setError('Failed to save move. Please try again.')
        }
      })()

      return true
    },
    [game, gameId, supabase]
  )

  // Resign the game
  const resignGame = useCallback(
    async (userId: string) => {
      if (!game) return
      if (game.status !== 'active') return

      const isWhite = userId === game.white_player_id
      const winnerId = isWhite ? game.black_player_id : game.white_player_id
      const result: Game['result'] = isWhite ? 'black' : 'white'

      // Optimistic update
      setGame((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed' as const,
              result,
              winner_id: winnerId,
            }
          : prev
      )

      try {
        await supabase
          .from('games')
          .update({
            status: 'completed',
            result,
            winner_id: winnerId,
          })
          .eq('id', gameId)
      } catch (err) {
        console.error('Failed to resign:', err)
        setError('Failed to resign. Please try again.')
      }
    },
    [game, gameId, supabase]
  )

  return { game, moves, loading, error, makeMove, resignGame }
}
