import { Chess, Square } from 'chess.js'
import type { MoveResult } from '@/types'

/**
 * Validate and execute a move against the given FEN position.
 * Returns the full result including new FEN and game-over status.
 */
export function validateAndMakeMove(
  fen: string,
  from: string,
  to: string,
  promotion?: string
): MoveResult {
  const chess = new Chess(fen)

  try {
    const move = chess.move({
      from: from as Square,
      to: to as Square,
      promotion: (promotion || 'q') as 'q' | 'r' | 'b' | 'n',
    })

    return {
      valid: true,
      san: move.san,
      from: move.from,
      to: move.to,
      fen: chess.fen(),
      isGameOver: chess.isGameOver(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      isCheck: chess.isCheck(),
      turn: chess.turn(),
      moveNumber: chess.moveNumber(),
    }
  } catch {
    return {
      valid: false,
      san: null,
      from,
      to,
      fen,
      isGameOver: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isCheck: chess.isCheck(),
      turn: chess.turn(),
      moveNumber: chess.moveNumber(),
    }
  }
}

/** Check whether a move to the target square is a pawn promotion. */
export function isPromotion(fen: string, from: string, to: string): boolean {
  const chess = new Chess(fen)
  const moves = chess.moves({ square: from as Square, verbose: true })
  return moves.some((m) => m.to === to && m.flags.includes('p'))
}

/** Get all legal moves for a piece on the given square. */
export function getLegalMoves(fen: string, square: string) {
  const chess = new Chess(fen)
  return chess.moves({ square: square as Square, verbose: true })
}

/** Retrieve high-level game status from a FEN string. */
export function getGameStatus(fen: string) {
  const chess = new Chess(fen)
  return {
    isGameOver: chess.isGameOver(),
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    isCheck: chess.isCheck(),
    turn: chess.turn() as 'w' | 'b',
    isInsufficientMaterial: chess.isInsufficientMaterial(),
    isThreefoldRepetition: chess.isThreefoldRepetition(),
  }
}

/** Find the square of the king for the side to move. */
export function findKingSquare(fen: string, color: 'w' | 'b'): string | null {
  const chess = new Chess(fen)
  const board = chess.board()
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'k' && piece.color === color) {
        const file = String.fromCharCode(97 + col)
        const rank = String(8 - row)
        return `${file}${rank}`
      }
    }
  }
  return null
}
