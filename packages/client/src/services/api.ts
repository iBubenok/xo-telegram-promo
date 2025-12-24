const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export type GameResultPayload = 'win' | 'loss' | 'draw';

export interface GameResultResponse {
  promoCode?: string | null;
}

export async function sendGameResult(
  result: GameResultPayload,
  chatId?: string
): Promise<GameResultResponse> {
  const response = await fetch(`${API_BASE_URL}/api/game/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result, chatId })
  });

  if (!response.ok) {
    throw new Error(`Запрос завершился с ошибкой ${response.status}`);
  }

  return response.json();
}
