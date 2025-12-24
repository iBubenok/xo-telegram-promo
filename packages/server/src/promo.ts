export function generatePromoCode(): string {
  const code = Math.floor(Math.random() * 100_000);
  return code.toString().padStart(5, '0');
}
