'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { motion } from 'framer-motion'
import {
  isPromotion,
  getLegalMoves,
  getGameStatus,
  findKingSquare,
} from '@/lib/chess-engine'

interface ChessBoardProps {
  fen: string
  orientation: 'white' | 'black'
  onMove: (from: string, to: string, promotion?: string) => boolean
  disabled?: boolean
  lastMove?: { from: string; to: string } | null
  isCheck?: boolean
}

type CustomSquareStyles = Record<
  string,
  React.CSSProperties
>

export default function ChessBoard({
  fen,
  orientation,
  onMove,
  disabled = false,
  lastMove = null,
  isCheck = false,
}: ChessBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(560)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoveSquares, setLegalMoveSquares] = useState<string[]>([])

  // Responsive board sizing via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const width = container.clientWidth
      // Cap at 640px max, with some padding
      const size = Math.min(width, 640)
      setBoardWidth(size)
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Compute custom square styles for last move + check + legal moves
  const customSquareStyles = useMemo<CustomSquareStyles>(() => {
    const styles: CustomSquareStyles = {}

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
      }
      styles[lastMove.to] = {
        backgroundColor: 'rgba(16, 185, 129, 0.35)',
      }
    }

    // King in check — red radial glow
    if (isCheck) {
      const status = getGameStatus(fen)
      const kingSquare = findKingSquare(fen, status.turn)
      if (kingSquare) {
        styles[kingSquare] = {
          background:
            'radial-gradient(circle at center, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 70%)',
          borderRadius: '0',
        }
      }
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: 'rgba(16, 185, 129, 0.45)',
      }
    }

    // Legal move dots
    legalMoveSquares.forEach((sq) => {
      const chess = new Chess(fen)
      const board = chess.board()
      // Determine if the square is occupied (capture target)
      const file = sq.charCodeAt(0) - 97
      const rank = 8 - parseInt(sq[1])
      const piece = board[rank]?.[file]

      if (piece) {
        // Capture ring
        styles[sq] = {
          ...styles[sq],
          background:
            (styles[sq]?.background as string) ||
            (styles[sq]?.backgroundColor as string) ||
            '',
          boxShadow: 'inset 0 0 0 4px rgba(107, 114, 128, 0.5)',
          borderRadius: '0',
        }
      } else {
        // Empty square dot
        styles[sq] = {
          ...styles[sq],
          backgroundImage:
            'radial-gradient(circle at center, rgba(107, 114, 128, 0.4) 24%, transparent 25%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      }
    })

    return styles
  }, [fen, lastMove, isCheck, selectedSquare, legalMoveSquares])

  // Handle square click for move selection
  const onSquareClick = useCallback(
    (square: Square) => {
      if (disabled) return

      // If we have a selected square and click a legal target, make the move
      if (selectedSquare && legalMoveSquares.includes(square)) {
        const promotion = isPromotion(fen, selectedSquare, square)
          ? 'q'
          : undefined
        const success = onMove(selectedSquare, square, promotion)
        setSelectedSquare(null)
        setLegalMoveSquares([])
        if (success) return
      }

      // Otherwise select the new square and compute legal moves
      const chess = new Chess(fen)
      const piece = chess.get(square)

      if (piece) {
        const currentTurn = chess.turn()
        // Only allow selecting your own pieces
        if (piece.color === currentTurn) {
          setSelectedSquare(square)
          const moves = getLegalMoves(fen, square)
          setLegalMoveSquares(moves.map((m) => m.to))
          return
        }
      }

      // Clicked empty or opponent piece without prior selection
      setSelectedSquare(null)
      setLegalMoveSquares([])
    },
    [disabled, selectedSquare, legalMoveSquares, fen, onMove]
  )

  // Handle piece drag-and-drop
  const onPieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (disabled) return false

      const promotion = isPromotion(fen, sourceSquare, targetSquare)
        ? 'q'
        : undefined

      const success = onMove(sourceSquare, targetSquare, promotion)

      // Clear selection after drop
      setSelectedSquare(null)
      setLegalMoveSquares([])

      return success
    },
    [disabled, fen, onMove]
  )

  // Show legal moves on drag start
  const onPieceDragBegin = useCallback(
    (_piece: string, sourceSquare: Square) => {
      if (disabled) return
      setSelectedSquare(sourceSquare)
      const moves = getLegalMoves(fen, sourceSquare)
      setLegalMoveSquares(moves.map((m) => m.to))
    },
    [disabled, fen]
  )

  const onPieceDragEnd = useCallback(() => {
    setSelectedSquare(null)
    setLegalMoveSquares([])
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[640px] mx-auto"
    >
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
        <Chessboard
          id="chess-arena-board"
          position={fen}
          boardOrientation={orientation}
          boardWidth={boardWidth}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          customSquareStyles={customSquareStyles}
          customDarkSquareStyle={{ backgroundColor: '#779952' }}
          customLightSquareStyle={{ backgroundColor: '#edeed1' }}
          animationDuration={200}
          arePiecesDraggable={!disabled}
        />
      </div>
    </motion.div>
  )
}
