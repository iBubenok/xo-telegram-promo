export type PlayerMark = 'X' | 'O';
export type Cell = PlayerMark | null;

export type GameStatus = 'playing' | 'win' | 'loss' | 'draw';

export const PLAYER_MARK: PlayerMark = 'X';
export const AI_MARK: PlayerMark = 'O';
