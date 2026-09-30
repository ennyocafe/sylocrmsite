'use strict';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16 * 1024;
const requestBuckets = new Map();

const ALLOWED_TEAM_SIZES = new Set([
  '1 a 5',
  '6 a 20',
  '21 a 50',
  '51 a 200',
  'Mais de 200'
]);

const ALLOWED_ROLES = new Set([
  'Proprietário / Sócio',
  'Diretor',
  'Gerente / Coordenador',
  'Consultor / Vendedor',
  'Outro'
]);

const ALLOWED_AVAILABILITY = new Set([
  'Segunda a sexta, manhã (8h–12h)',
  'Segunda a sexta, tarde (13h–18h)',
  'Qualquer dia útil, qualquer horário',
  'Prefiro combinar por e-mail'
]);

function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function getHeader(req, name) {
  const value = req.headers && req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function isSameOrigin(req) {
  const origin = getHeader(req, 'origin');
  const forwardedHost = getHeader(req, 'x-forwarded-host');
  const host = (forwardedHost || getHeader(req, 'host') || '').split(',')[0].trim();

  if (!origin || !host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function getClientIp(req) {
  const forwarded = getHeader(req, 'x-forwarded-for');
  return (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

function isRateLimited(ip, now = Date.now()) {
  const bucket = requestBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    requestBuckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function getBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return req.body;
}

function validate(body) {
  const data = {
    nome: cleanText(body.nome, 120),
    email: cleanText(body.email, 180).toLowerCase(),
    empresa: cleanText(body.empresa, 160),
    pessoas_equipe: cleanText(body.pessoas_equipe, 30),
    cargo: cleanText(body.cargo, 50),
    disponibilidade: cleanText(body.disponibilidade, 80),
    pagina: cleanText(body.pagina, 500)
  };

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const pageIsValid = !data.pagina || /^https?:\/\//i.test(data.pagina);

  if (
    data.nome.length < 2 ||
    !emailIsValid ||
    data.empresa.length < 2 ||
    !ALLOWED_TEAM_SIZES.has(data.pessoas_equipe) ||
    !ALLOWED_ROLES.has(data.cargo) ||
    !ALLOWED_AVAILABILITY.has(data.disponibilidade) ||
    !pageIsValid
  ) {
    return null;
  }

  return data;
}

function getWebhookUrl() {
  const value = process.env.MAKE_LEADS_WEBHOOK_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.make.com')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método não permitido.' });
  }

  if (!isSameOrigin(req) || getHeader(req, 'x-sylo-form') !== 'demonstracao') {
    return send(res, 403, { error: 'Origem não autorizada.' });
  }

  const contentType = getHeader(req, 'content-type') || '';
  const contentLength = Number(getHeader(req, 'content-length') || 0);
  if (!contentType.toLowerCase().startsWith('application/json') || contentLength > MAX_BODY_BYTES) {
    return send(res, 413, { error: 'Requisição inválida.' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.setHeader('Retry-After', String(WINDOW_MS / 1000));
    return send(res, 429, { error: 'Muitas tentativas. Tente novamente mais tarde.' });
  }

  let body;
  try {
    body = getBody(req);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('Invalid body');
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
      return send(res, 413, { error: 'Requisição muito grande.' });
    }
  } catch {
    return send(res, 400, { error: 'Dados inválidos.' });
  }

  // Bots que preenchem o campo invisível recebem sucesso, mas não chegam ao Make.
  if (cleanText(body.website, 200)) {
    return send(res, 200, { ok: true });
  }

  const lead = validate(body);
  if (!lead) {
    return send(res, 422, { error: 'Confira os campos preenchidos.' });
  }

  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    console.error('MAKE_LEADS_WEBHOOK_URL não está configurada corretamente.');
    return send(res, 500, { error: 'Serviço temporariamente indisponível.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        origem: 'Site Sylo',
        enviado_em: new Date().toISOString()
      }),
      signal: controller.signal
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook do Make respondeu com status ${webhookResponse.status}.`);
      return send(res, 502, { error: 'Não foi possível registrar o contato.' });
    }

    return send(res, 200, { ok: true });
  } catch (error) {
    console.error('Falha ao acessar o webhook do Make:', error.name);
    return send(res, 502, { error: 'Não foi possível registrar o contato.' });
  } finally {
    clearTimeout(timeout);
  }
};
