'use strict';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const buckets = new Map();
const GOALS = new Set(['Imóvel', 'Veículo', 'Moto', 'Serviço', 'Bem móvel']);
const MODES = new Set(['Crédito', 'Parcela']);
const CRM_LEADS_URL = 'https://api.sylocrm.com.br/webhooks/leads';
const CRM_SEGMENTS = {
  'Imóvel': 'Imobiliário',
  'Veículo': 'Veículos',
  'Moto': 'Motos',
  'Serviço': 'Serviços',
  'Bem móvel': 'Bens móveis'
};

function clean(value, max) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function header(req, name) {
  const value = req.headers && req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sameOrigin(req) {
  const origin = header(req, 'origin');
  const host = (header(req, 'x-forwarded-host') || header(req, 'host') || '').split(',')[0].trim();
  if (!origin || !host) return false;
  try { return new URL(origin).host.toLowerCase() === host.toLowerCase(); } catch { return false; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Método não permitido.' });
  if (!sameOrigin(req) || header(req, 'x-sylo-form') !== 'consorcio') return send(res, 403, { error: 'Origem não autorizada.' });
  const ip = (header(req, 'x-forwarded-for') || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now(), bucket = buckets.get(ip);
  if (!bucket || now - bucket.start >= WINDOW_MS) buckets.set(ip, { start: now, count: 1 });
  else if (++bucket.count > MAX_REQUESTS) return send(res, 429, { error: 'Muitas tentativas. Tente novamente mais tarde.' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return send(res, 400, { error: 'Dados inválidos.' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return send(res, 400, { error: 'Dados inválidos.' });
  if (clean(body.website, 200)) return send(res, 200, { ok: true });

  const lead = {
    nome: clean(body.nome, 120), celular: clean(body.celular, 20), email: clean(body.email, 180).toLowerCase(),
    cidade: clean(body.cidade, 100), objetivo: clean(body.objetivo, 30), modo_simulacao: clean(body.modo_simulacao, 20),
    valor_simulacao: Number(body.valor_simulacao), resumo: clean(body.resumo, 180), pagina: clean(body.pagina, 500), aceite_dados: body.aceite_dados === true
  };
  const phoneDigits = lead.celular.replace(/\D/g, '');
  if (lead.nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || phoneDigits.length < 10 || phoneDigits.length > 13 || lead.cidade.length < 2 || !GOALS.has(lead.objetivo) || !MODES.has(lead.modo_simulacao) || !Number.isFinite(lead.valor_simulacao) || lead.valor_simulacao <= 0 || !lead.aceite_dados) return send(res, 422, { error: 'Confira os campos preenchidos.' });

  const apiKey = process.env.SYLO_CRM_API_KEY;
  if (!apiKey) {
    console.error('SYLO_CRM_API_KEY não está configurada.');
    return send(res, 500, { error: 'Serviço temporariamente indisponível.' });
  }

  const creditValue = lead.modo_simulacao === 'Crédito'
    ? Math.round(lead.valor_simulacao)
    : Math.round(lead.valor_simulacao * 180 / 1.22);

  const crmLead = {
    name: lead.nome,
    phone: lead.celular,
    email: lead.email,
    value: creditValue,
    segment: CRM_SEGMENTS[lead.objetivo],
    source: 'Landing page Sylo Soluções Financeiras',
    notes: [
      lead.resumo,
      `Cidade: ${lead.cidade}`,
      `Simulação por: ${lead.modo_simulacao}`,
      `Página: ${lead.pagina}`
    ].join(' | ')
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(CRM_LEADS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(crmLead),
      signal: controller.signal
    });
    if (!response.ok) {
      console.error(`Sylo CRM respondeu com status ${response.status}.`);
      return send(res, 502, { error: 'Não foi possível registrar o contato.' });
    }
    return send(res, 200, { ok: true });
  } catch (error) {
    console.error('Falha ao acessar o Sylo CRM:', error.name);
    return send(res, 502, { error: 'Não foi possível registrar o contato.' });
  }
  finally { clearTimeout(timeout); }
};
