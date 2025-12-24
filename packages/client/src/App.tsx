import { useCallback, useEffect, useMemo, useState } from 'react';
import { chooseAiMove } from './game/ai';
import { createEmptyBoard, getGameStatus } from './game/logic';
import { AI_MARK, PLAYER_MARK, type Cell, type GameStatus } from './game/types';
import { sendGameResult } from './services/api';
import { generateFallbackPromo } from './services/promo';
import { useSearchParams } from './hooks/useSearchParams';
import styles from './App.module.css';

type Actor = 'player' | 'ai';

const statusText: Record<GameStatus, string> = {
  playing: 'Игра продолжается',
  win: 'Победа! Промокод для вас уже готов.',
  loss: 'Компьютер победил, но реванш за вами.',
  draw: 'Ничья — сыграем ещё?'
};

function App() {
  const [board, setBoard] = useState<Cell[]>(createEmptyBoard());
  const [status, setStatus] = useState<GameStatus>('playing');
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [message, setMessage] = useState('Начните партию — вы ходите крестиками.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundId, setRoundId] = useState(1);
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') ?? undefined;

  const finishGame = useCallback(async (finalStatus: GameStatus) => {
    const currentRound = roundId;
    setStatus(finalStatus);
    setIsAiTurn(false);
    setMessage(statusText[finalStatus]);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await sendGameResult(
        finalStatus === 'win' ? 'win' : finalStatus === 'loss' ? 'loss' : 'draw',
        chatId
      );

      if (roundId !== currentRound) {
        return;
      }

      if (finalStatus === 'win') {
        const code = response.promoCode ?? generateFallbackPromo();
        setPromoCode(code);
        if (!response.promoCode) {
          setError('Не удалось получить промокод с сервера, показан резервный код.');
        }
      } else {
        setPromoCode(null);
      }
    } catch (err) {
      if (roundId !== currentRound) {
        return;
      }

      if (finalStatus === 'win') {
        setPromoCode((prev) => prev ?? generateFallbackPromo());
      }
      setError(
        'Не удалось отправить результат на сервер. Проверьте соединение или попробуйте позже.'
      );
    } finally {
      if (roundId === currentRound) {
        setIsSubmitting(false);
      }
    }
  }, [chatId, roundId]);

  const handleBoardAfterMove = useCallback(
    (nextBoard: Cell[], actor: Actor) => {
      if (status !== 'playing') {
        return;
      }

      const nextStatus = getGameStatus(nextBoard);
      setBoard(nextBoard);
      setError(null);

      if (nextStatus === 'playing') {
        setMessage(
          actor === 'player'
            ? 'Компьютер думает над своим ходом…'
            : 'Ваш ход. Заберите центр или углы для преимущества.'
        );
        setIsAiTurn(actor === 'player');
        return;
      }

      void finishGame(nextStatus);
    },
    [finishGame, status]
  );

  useEffect(() => {
    if (!isAiTurn || status !== 'playing') {
      return;
    }

    const timer = setTimeout(() => {
      const move = chooseAiMove(board);
      const updatedBoard = [...board];
      if (move !== null) {
        updatedBoard[move] = AI_MARK;
      }
      handleBoardAfterMove(updatedBoard, 'ai');
    }, 380);

    return () => clearTimeout(timer);
  }, [board, handleBoardAfterMove, isAiTurn, status]);

  const handleCellClick = (index: number) => {
    if (status !== 'playing' || isAiTurn || board[index]) {
      return;
    }

    const updatedBoard = [...board];
    updatedBoard[index] = PLAYER_MARK;
    handleBoardAfterMove(updatedBoard, 'player');
  };

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setStatus('playing');
    setIsAiTurn(false);
    setPromoCode(null);
    setMessage('Новая партия! Вы ходите первыми и играете крестиками.');
    setError(null);
    setIsSubmitting(false);
    setRoundId((id) => id + 1);
  };

  const highlight = useMemo(() => {
    if (status === 'playing') {
      return isAiTurn ? 'Компьютер выбирает лучший ход…' : 'Ваш ход — подберите удачную клетку.';
    }

    return statusText[status];
  }, [isAiTurn, status]);

  return (
    <div className={styles.app}>
        <div className={styles.hero}>
          <div className={styles.badge}>Мягкий режим</div>
          <h1>Крестики-нолики с бонусом</h1>
          <p>
            Сыграйте быстрый матч против внимательного компьютера. Победа приносит промокод на скидку и
            сообщение в Telegram.
          </p>
          <p className={styles.subtle}>
            {chatId
              ? `Уведомления будут отправляться в ваш Telegram (chatId: ${chatId}).`
              : 'Чтобы получать уведомления в свой Telegram, откройте игру по ссылке из сообщения бота.'}
          </p>
        </div>

      <div className={styles.layout}>
        <section className={styles.boardCard}>
          <header className={styles.cardHeader}>
            <div>
              <p className={styles.label}>Текущая партия</p>
              <h2>{highlight}</h2>
              <p className={styles.message}>{message}</p>
            </div>
            <span className={styles.turnBadge}>
              {status === 'playing' ? (isAiTurn ? 'Ход компьютера' : 'Ваш ход') : 'Игра завершена'}
            </span>
          </header>

          <div className={styles.board}>
            {board.map((cell, index) => (
              <button
                key={index}
                className={`${styles.cell} ${cell === PLAYER_MARK ? styles.x : ''} ${
                  cell === AI_MARK ? styles.o : ''
                }`}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiTurn}
                aria-label={`Клетка ${index + 1}`}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <div>
              <p className={styles.helper}>
                {status === 'playing'
                  ? 'Подсказка: центр и углы — самые сильные позиции.'
                  : 'Хотите реванш? Нажмите на кнопку ниже.'}
              </p>
              {error && <p className={styles.error}>{error}</p>}
            </div>
            <button className={styles.primary} onClick={handleRestart}>
              Сыграть ещё раз
            </button>
          </div>
        </section>

        <section className={styles.infoCard}>
          <p className={styles.label}>Награда</p>
          <h3>{status === 'win' ? 'Победа зафиксирована!' : 'Соберите линию, чтобы выиграть промокод'}</h3>

          {status === 'win' ? (
            <div className={styles.promoCard}>
              <span className={styles.promoLabel}>
                {isSubmitting ? 'Запрашиваем промокод…' : 'Ваш промокод'}
              </span>
              <div className={styles.promoValue}>{promoCode ?? '.....'}</div>
              <p className={styles.promoHint}>Код отправлен в Telegram вместе с уведомлением о победе.</p>
            </div>
          ) : (
            <ul className={styles.tips}>
              <li>Игрок — крестики, компьютер — нолики.</li>
              <li>Компьютер ходит сразу после вас с короткой задержкой для мягкой анимации.</li>
              <li>После каждого матча результат отправляется на сервер и в Telegram.</li>
            </ul>
          )}

          {status !== 'playing' && status !== 'win' && (
            <div className={styles.resultBox}>
              <p>
                {status === 'loss'
                  ? 'В этот раз компьютер оказался сильнее. Попробуйте другой старт!'
                  : 'Ничья — достойный результат. Можно сыграть ещё раз.'}
              </p>
              <button className={styles.secondary} onClick={handleRestart}>
                Сыграть ещё раз
              </button>
            </div>
          )}

          {isSubmitting && status !== 'win' && (
            <p className={styles.progress}>Отправляем результат в Telegram…</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
