import { chooseAiMove, chooseAiMoveWithDifficulty } from './ai';
import { AI_MARK, PLAYER_MARK, type Cell } from './types';

describe('ИИ (minimax)', () => {
  it('выбирает победный ход, если он есть', () => {
    const board: Cell[] = [AI_MARK, AI_MARK, null, PLAYER_MARK, PLAYER_MARK, null, null, null, null];
    const move = chooseAiMove(board);
    expect(move).toBe(2);
  });

  it('блокирует победу игрока, если возможно', () => {
    const board: Cell[] = [PLAYER_MARK, PLAYER_MARK, null, AI_MARK, null, null, null, AI_MARK, null];
    const move = chooseAiMove(board);
    expect(move).toBe(2);
  });

  it('возвращает null, если ходов не осталось', () => {
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
    const move = chooseAiMove(board);
    expect(move).toBeNull();
  });

  it('на легком уровне выбирает доступный ход', () => {
    const board: Cell[] = [PLAYER_MARK, null, null, null, null, null, null, null, null];
    const move = chooseAiMoveWithDifficulty(board, 'легкий');
    expect(move).not.toBeNull();
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(9);
  });
});
