import { calculateWinner, getAvailableMoves, isBoardFull } from './logic';
import { AI_MARK, PLAYER_MARK, type Cell, type PlayerMark } from './types';

const WIN_SCORE = 10;
const LOSS_SCORE = -10;

export type AiDifficulty = 'уверенный' | 'легкий';

const getRandomElement = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export function chooseAiMove(
  board: Cell[],
  aiMark: PlayerMark = AI_MARK,
  playerMark: PlayerMark = PLAYER_MARK
): number | null {
  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) {
    return null;
  }

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    const nextBoard = [...board];
    nextBoard[move] = aiMark;
    const score = minimax(nextBoard, 0, false, aiMark, playerMark);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function chooseAiMoveWithDifficulty(
  board: Cell[],
  difficulty: AiDifficulty,
  aiMark: PlayerMark = AI_MARK,
  playerMark: PlayerMark = PLAYER_MARK
): number | null {
  if (difficulty === 'легкий') {
    const available = getAvailableMoves(board);
    return available.length ? getRandomElement(available) : null;
  }

  return chooseAiMove(board, aiMark, playerMark);
}

function minimax(
  board: Cell[],
  depth: number,
  isMaximizing: boolean,
  aiMark: PlayerMark,
  playerMark: PlayerMark
): number {
  const winner = calculateWinner(board);
  if (winner === aiMark) {
    return WIN_SCORE - depth;
  }
  if (winner === playerMark) {
    return LOSS_SCORE + depth;
  }
  if (isBoardFull(board)) {
    return 0;
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const move of availableMoves) {
      const nextBoard = [...board];
      nextBoard[move] = aiMark;
      const score = minimax(nextBoard, depth + 1, false, aiMark, playerMark);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;
  for (const move of availableMoves) {
    const nextBoard = [...board];
    nextBoard[move] = playerMark;
    const score = minimax(nextBoard, depth + 1, true, aiMark, playerMark);
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
}
