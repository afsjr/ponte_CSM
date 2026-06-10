const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Limpa registros expirados (poderia ser feito num timer, mas fazemos lazy aqui)
  if (record && record.expiresAt < now) {
    rateLimitMap.delete(ip);
  }

  const currentRecord = rateLimitMap.get(ip);

  if (!currentRecord) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true; // Permitido
  }

  if (currentRecord.count >= limit) {
    return false; // Bloqueado
  }

  currentRecord.count += 1;
  return true; // Permitido
}
