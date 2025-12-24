import { AI_MARK, PLAYER_MARK, type Cell, type GameStatus, type PlayerMark } from './types';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
] as const;

export function createEmptyBoard(): Cell[] {
  return Array<Cell>(9).fill(null);
}

export function calculateWinner(board: Cell[]): PlayerMark | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export function isBoardFull(board: Cell[]): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: Cell[]): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

export function getGameStatus(board: Cell[]): GameStatus {
  const winner = calculateWinner(board);

  if (winner === PLAYER_MARK) {
    return 'win';
  }

  if (winner === AI_MARK) {
    return 'loss';
  }

  if (isBoardFull(board)) {
    return 'draw';
  }

  return 'playing';
}
