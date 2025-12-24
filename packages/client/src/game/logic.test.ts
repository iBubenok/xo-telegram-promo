import { AI_MARK, PLAYER_MARK, type Cell } from './types';
import { calculateWinner, createEmptyBoard, getGameStatus, isBoardFull } from './logic';

describe('логика игры', () => {
  it('корректно находит победителя по строке', () => {
    const board: Cell[] = [PLAYER_MARK, PLAYER_MARK, PLAYER_MARK, null, null, null, null, null, null];
    expect(calculateWinner(board)).toBe(PLAYER_MARK);
  });

  it('корректно находит победителя по диагонали', () => {
    const board: Cell[] = [AI_MARK, null, PLAYER_MARK, null, AI_MARK, null, PLAYER_MARK, null, AI_MARK];
    expect(calculateWinner(board)).toBe(AI_MARK);
  });

  it('определяет заполненное поле', () => {
    const board: Cell[] = [
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      AI_MARK
    ];
    expect(isBoardFull(board)).toBe(true);
  });

  it('возвращает актуальный статус игры', () => {
    const playingBoard = createEmptyBoard();
    expect(getGameStatus(playingBoard)).toBe('playing');

    const winBoard: Cell[] = [PLAYER_MARK, PLAYER_MARK, PLAYER_MARK, null, null, null, null, null, null];
    expect(getGameStatus(winBoard)).toBe('win');

    const lossBoard: Cell[] = [AI_MARK, AI_MARK, AI_MARK, null, null, null, null, null, null];
    expect(getGameStatus(lossBoard)).toBe('loss');

    const drawBoard: Cell[] = [
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      AI_MARK,
      PLAYER_MARK,
      AI_MARK
    ];
    expect(getGameStatus(drawBoard)).toBe('draw');
  });
});
