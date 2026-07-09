import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side LLM proxy for Copilot Prep Engine.
 *
 * All of the app's "intelligence" is routed through the Vercel AI Gateway
 * (OpenAI-compatible endpoint). The gateway API key lives only here, as a
 * Vercel Environment Variable — never in the browser bundle.
 *
 * Configure in the Vercel project (Settings -> Environment Variables):
 *   AI_GATEWAY_API_KEY   (required) - create one in the Vercel AI Gateway tab
 *   AI_GATEWAY_MODEL     (optional) - e.g. "openai/gpt-4o-mini" (default),
 *                                     "anthropic/claude-3.5-haiku",
 *                                     "google/gemini-2.0-flash"
 *
 * Diagnostics:
 *   GET /api/llm          -> { ok, keyConfigured, model }
 *   GET /api/llm?ping=1   -> also performs a tiny live gateway call and
 *                            reports the real status + a sample of the output.
 *
 * If the key is missing or the gateway errors, the endpoint responds with a
 * non-2xx status and the client transparently falls back to its local
 * offline simulation, so the product keeps working.
 */

export const config = { maxDuration: 30 };

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

// Prefer a high-quality model, but fall back automatically if a given slug
// isn't available on the gateway (400/404) so the app never breaks. Set
// AI_GATEWAY_MODEL to pin a specific model at the front of the list.
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.AI_GATEWAY_MODEL,
      'anthropic/claude-sonnet-4',
      'anthropic/claude-3.7-sonnet',
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
    ].filter(Boolean) as string[]
  )
);

// Cache the first model that actually answers (warm across invocations on the
// same lambda instance) so we don't re-probe failing slugs on every request.
let resolvedModel: string | null = null;
const activeModel = () => resolvedModel || MODEL_CANDIDATES[0];

const BASE_PERSONA =
  "Tu es Victor l'Éclaireur, un copilote d'entretien d'élite pour candidats en recherche d'emploi en France. " +
  "Tu es proactif, chirurgical, bienveillant et concret. Tu réponds toujours en français. " +
  "Tu restes réaliste et cadré sur le marché du travail français (pas de promesses hors-sol).";

// Precise JSON shape instructions per task so the gateway returns data the
// client can consume directly (same contract as the local simulation).
const JSON_TASKS: Record<string, string> = {
  linkedin_search:
    'Renvoie un objet JSON { "results": [ ... ] } où results est un tableau de 4 à 6 profils LinkedIn ' +
    'plausibles pour le nom recherché (inclure des homonymes de secteurs variés pour maximiser les chances ' +
    "que l'utilisateur retrouve le sien). Chaque profil : { \"username\": string (slug linkedin réaliste), " +
    '"title": string (intitulé de poste + entreprise), "avatar": string (UN SEUL emoji représentatif du métier), ' +
    '"location": string ("Ville, Pays") }.',
  company_search:
    "Renvoie DIRECTEMENT (au niveau racine, sans clé d'emballage) un objet JSON décrivant l'entreprise recherchée avec EXACTEMENT ces clés : " +
    'city (string), country (string), isSubsidiary (boolean), baseSalaryAvg (number : salaire brut annuel € moyen réaliste pour le poste/secteur), ' +
    'baseSalaryType ("cadre" | "non-cadre"), variablePay (string), ' +
    'perks (objet { greenMobility, ticketsResto, ce, rtt, participation, workPhone : booleans, mutuelleName : string }), ' +
    'tools (array de strings), recruitmentProcessSteps (array parmi "Screening","Étude de cas","Entretien technique","Entretien managérial","Fondateur","Proposition finale"), ' +
    'remotePolicy (string), overallEnvironmentScore (number 0-5), workLifeBalanceScore (number 0-5), turnoverScore (number 0-5), ' +
    'valueProposition (string), recentMilestones (array de strings), realRealityReport (string : ce qui attend vraiment au quotidien), ' +
    "activeJobs (array d'intitulés de postes ouverts plausibles chez cette entreprise).",
  dossier:
    "Renvoie DIRECTEMENT (au niveau racine de l'objet JSON, SANS aucune clé d'emballage comme \"dossier\" ou \"result\") un objet avec EXACTEMENT ces clés, toutes remplies avec du contenu concret et personnalisé : " +
    'companyReport (objet { financialHealth, marketState, recentNews : strings non vides }), ' +
    'matchScore (number 0-100 : compatibilité entre le CV/profil du candidat et l\'offre, basée sur les mots-clés ET la profondeur d\'expérience/expertise), ' +
    'missionRecap (string non vide : le vrai quotidien du poste au-delà de l\'annonce), ' +
    'gaps (array non vide de { skill, defense, recommendedTraining }), ' +
    'blindSpotsJob (array de strings), ' +
    'blindSpotsCompany (array non vide de { issue, expertQuestion } : failles de structure permettant de poser des questions stratégiques), ' +
    'sixtySecPitch (string non vide : pitch de 60 secondes personnalisé au candidat), ' +
    'negotiationGuide (objet { suggestedRange : string contenant un nombre en € brut annuel, coreArguments : array de strings }), ' +
    'interviewerQuestions (array de { roleType : "rh"|"manager"|"cto"|"peer", question, answerStrategy }), ' +
    'useCaseScenario (array de 1 à 3 { id : "exe-1"/"exe-2"/"exe-3", title, description, expectedDeliverable, proTips }).',
  coach_eval:
    'Tu joues le rôle de l\'interlocuteur en entretien puis tu analyses la réponse du candidat. Renvoie DIRECTEMENT un objet JSON avec EXACTEMENT : ' +
    'rating ("good" | "average" | "poor"), critique (string : analyse de la réponse selon le framework STAR), ' +
    'optimizedResponse (string : reformulation d\'élite de la réponse du candidat), ' +
    'nextInterviewerQuestion (string : la question suivante que tu poses en tant qu\'interlocuteur).',
  exercise_eval:
    'Renvoie DIRECTEMENT un objet JSON évaluant la proposition du candidat à un cas pratique, avec EXACTEMENT : ' +
    'score (number 0-100), critique (string), improvements (array de strings), proVersion (string : la version d\'excellence de la réponse).',
};

// Free-text tasks: persona + a short role hint.
const TEXT_TASKS: Record<string, string> = {
  chat: 'Réponds de façon utile, concise et actionnable à la question du candidat.',
  debrief:
    "Tu débriefes à chaud l'entretien que le candidat vient de passer. Aide-le à décoder les signaux faibles " +
    'du recruteur, pose une question de relance pertinente et donne un conseil concret.',
  exercise_hint:
    "Donne un indice tactique (angle d'attaque) pour réussir le cas pratique SANS donner la réponse complète.",
};

// Expected top-level keys per object task — used to detect & unwrap a model
// that nested the payload under a wrapper key (e.g. { "dossier": {...} }).
const EXPECTED_KEYS: Record<string, string[]> = {
  dossier: ['companyReport', 'matchScore', 'missionRecap', 'sixtySecPitch', 'negotiationGuide'],
  company_search: ['city', 'baseSalaryAvg', 'tools', 'realRealityReport'],
  coach_eval: ['rating', 'critique', 'nextInterviewerQuestion'],
  exercise_eval: ['score', 'critique', 'improvements'],
};

// Bigger structures need a bigger budget or json_object mode truncates them.
const MAX_TOKENS: Record<string, number> = {
  dossier: 4000,
  company_search: 2500,
};

function buildContextBlock(context: any): string {
  if (!context || typeof context !== 'object') return '';
  const lines: string[] = [];
  if (context.firstName || context.lastName) lines.push(`Candidat : ${context.firstName || ''} ${context.lastName || ''}`.trim());
  if (context.profileTitle) lines.push(`Titre : ${context.profileTitle}`);
  if (context.cvText) lines.push(`CV / profil : ${String(context.cvText).slice(0, 1500)}`);
  if (Array.isArray(context.pastExperiences) && context.pastExperiences.length) {
    lines.push('Expériences : ' + context.pastExperiences.map((e: any) => `${e.roleTitle} @ ${e.companyName} (${e.period})`).join(' ; '));
  }
  if (context.expectedSalaryBrut) lines.push(`Prétentions : ${context.expectedSalaryBrut} € brut/an`);
  if (context.targetCompany) lines.push(`Entreprise cible : ${context.targetCompany}`);
  if (context.targetRole) lines.push(`Poste visé : ${context.targetRole}`);
  return lines.length ? `\n\n=== CONTEXTE CANDIDAT ===\n${lines.join('\n')}` : '';
}

// Robustly pull a JSON value out of a model reply that may be wrapped in
// ```json fences or surrounded by prose (since we no longer force json mode).
export function extractJson(raw: string): any {
  if (typeof raw !== 'string') throw new Error('empty');
  let s = raw.trim();
  // Strip Markdown code fences.
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch {
    // Fall back to the outermost {...} or [...] span.
    const firstObj = s.indexOf('{');
    const firstArr = s.indexOf('[');
    let start = -1;
    if (firstObj === -1) start = firstArr;
    else if (firstArr === -1) start = firstObj;
    else start = Math.min(firstObj, firstArr);
    if (start === -1) throw new Error('no JSON found');
    const openCh = s[start];
    const closeCh = openCh === '{' ? '}' : ']';
    const end = s.lastIndexOf(closeCh);
    if (end <= start) throw new Error('no JSON span');
    return JSON.parse(s.slice(start, end + 1));
  }
}

export function unwrapArray(parsed: any): any {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    for (const key of ['results', 'items', 'data', 'profiles', 'list']) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
  }
  return parsed;
}

// If the model wrapped the payload under a top-level key, dig it back out.
export function unwrapObject(parsed: any, task: string): any {
  const expected = EXPECTED_KEYS[task];
  if (!expected || !parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return parsed;
  if (expected.some((k) => k in parsed)) return parsed;
  for (const key of Object.keys(parsed)) {
    const v = parsed[key];
    if (v && typeof v === 'object' && !Array.isArray(v) && expected.some((k) => k in v)) return v;
  }
  return parsed;
}

async function callGateway(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {}
): Promise<{ ok: boolean; status: number; content: string; finishReason: string; error?: string; model: string }> {
  // Try the cached working model first, then the remaining candidates.
  const order = resolvedModel
    ? [resolvedModel, ...MODEL_CANDIDATES.filter((m) => m !== resolvedModel)]
    : [...MODEL_CANDIDATES];

  let last = { ok: false, status: 0, content: '', finishReason: '', error: 'no model available', model: '' };

  for (const model of order) {
    const resp = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      // NOTE: we deliberately do NOT send `response_format`. The Vercel AI
      // Gateway rejects it (400 invalid_request_error) for several models.
      // JSON is enforced via the system prompt and extracted robustly instead.
      body: JSON.stringify({
        model,
        temperature: opts.temperature ?? (opts.json ? 0.4 : 0.7),
        max_tokens: opts.maxTokens ?? 1600,
        messages,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      resolvedModel = model;
      return {
        ok: true,
        status: 200,
        content: data?.choices?.[0]?.message?.content ?? '',
        finishReason: data?.choices?.[0]?.finish_reason ?? '',
        model,
      };
    }

    const detail = await resp.text().catch(() => '');
    last = { ok: false, status: resp.status, content: '', finishReason: '', error: detail.slice(0, 600), model };
    // Only an unknown/unsupported model warrants trying the next candidate.
    // Stop on auth (401/403), billing (402), rate limit (429) or 5xx.
    if (resp.status !== 400 && resp.status !== 404) break;
    console.error(`[llm] model ${model} -> ${resp.status}, trying next candidate`);
  }
  return last;
}

interface TaskBody {
  prompt?: string;
  systemInstruction?: string;
  isJSON?: boolean;
  task?: string;
  context?: any;
}

// Canned request used by GET /api/llm?selftest=1 to exercise the full dossier
// pipeline (gateway -> json_object -> unwrap) end-to-end and report structure.
const SELFTEST_DOSSIER_BODY: TaskBody = {
  task: 'dossier',
  isJSON: true,
  systemInstruction: "Bâtis un rapport de combat d'entretien.",
  prompt:
    '=== ENTREPRISE CIBLE ===\nNom: Stripe\nPoste: Enterprise Account Executive - SaaS Fintech\n' +
    'Description: closing de deals SaaS complexes à cycles longs, interlocuteurs C-level, Salesforce, MEDDPICC.',
  context: {
    firstName: 'Valentin',
    lastName: 'Navaron',
    profileTitle: 'Enterprise Account Executive',
    cvText: 'Account Executive SaaS avec expérience de closing complexe et négociation C-level.',
    expectedSalaryBrut: 65000,
    targetCompany: 'Stripe',
    targetRole: 'Enterprise Account Executive - SaaS Fintech',
  },
};

function isThinDossier(p: any): boolean {
  if (!p || typeof p !== 'object') return true;
  const hasCompany = !!(p.companyReport && (p.companyReport.marketState || p.companyReport.financialHealth));
  const hasPitch = typeof p.sixtySecPitch === 'string' && p.sixtySecPitch.trim().length > 0;
  const hasMission = typeof p.missionRecap === 'string' && p.missionRecap.trim().length > 0;
  const hasGaps = Array.isArray(p.gaps) && p.gaps.length > 0;
  return !(hasCompany && hasPitch && hasMission && hasGaps);
}

// Runs one task through the gateway and returns an HTTP status + JSON payload.
// Shared by the POST endpoint and the self-test so they can never diverge.
async function executeTask(
  apiKey: string,
  body: TaskBody,
  opts: { debug?: boolean } = {}
): Promise<{ status: number; payload: any }> {
  const prompt = (body.prompt || '').toString();
  const task = (body.task || '').toString();
  const wantsJson = !!body.isJSON || task in JSON_TASKS;

  const systemParts = [BASE_PERSONA];
  if (body.systemInstruction) systemParts.push(body.systemInstruction);
  if (task in JSON_TASKS) systemParts.push(JSON_TASKS[task]);
  if (task in TEXT_TASKS) systemParts.push(TEXT_TASKS[task]);
  if (wantsJson) {
    systemParts.push(
      'IMPORTANT : réponds UNIQUEMENT avec du JSON valide correspondant exactement au schéma demandé. ' +
        "Toutes les clés doivent être au niveau racine (aucune clé d'emballage), et CHAQUE clé doit contenir du contenu concret (jamais de chaîne vide). " +
        'Pas de texte autour, pas de balises Markdown, pas de commentaires.'
    );
  }

  const userContent = prompt + buildContextBlock(body.context);
  const debug: any = opts.debug ? {} : undefined;

  // One gateway round-trip + parse/normalize. Uniform (non-union) shape so the
  // caller never depends on control-flow narrowing.
  async function attempt(extraSystem?: string): Promise<{
    ok: boolean;
    status: number;
    text: string;
    parsed: any;
    raw: string;
    finish: string;
    error: string;
    detail: string;
  }> {
    const sys = extraSystem ? `${systemParts.join('\n\n')}\n\n${extraSystem}` : systemParts.join('\n\n');
    const r = await callGateway(
      apiKey,
      [
        { role: 'system', content: sys },
        { role: 'user', content: userContent },
      ],
      { json: wantsJson, maxTokens: MAX_TOKENS[task] }
    );
    if (debug) debug.model = r.model;
    if (!r.ok) {
      console.error(`[llm] task=${task} gateway ${r.status}: ${r.error}`);
      return { ok: false, status: 502, text: '', parsed: null, raw: '', finish: '', error: `Gateway error ${r.status}`, detail: (r.error || '').slice(0, 300) };
    }
    const raw = r.content;
    console.log(`[llm] task=${task} model=${r.model} finish=${r.finishReason} len=${raw.length}`);
    if (r.finishReason === 'length') {
      console.error(`[llm] task=${task} truncated (max_tokens=${MAX_TOKENS[task] ?? 1600}).`);
      return { ok: false, status: 502, text: '', parsed: null, raw, finish: 'length', error: 'Gateway response truncated', detail: `finish_reason=length len=${raw.length}` };
    }
    if (!wantsJson) return { ok: true, status: 200, text: raw, parsed: null, raw, finish: r.finishReason, error: '', detail: '' };
    try {
      let parsed = extractJson(raw);
      parsed = task === 'linkedin_search' ? unwrapArray(parsed) : unwrapObject(parsed, task);
      return { ok: true, status: 200, text: JSON.stringify(parsed), parsed, raw, finish: r.finishReason, error: '', detail: '' };
    } catch {
      console.error(`[llm] task=${task} JSON parse failed`);
      return { ok: false, status: 502, text: '', parsed: null, raw, finish: '', error: 'Gateway returned non-JSON', detail: raw.slice(0, 200) };
    }
  }

  try {
    let res = await attempt();
    if (debug && res.ok) { debug.rawSample = res.raw.slice(0, 1500); debug.finish = res.finish; }
    if (debug && !res.ok) { debug.error = res.error; debug.rawSample = (res.raw || '').slice(0, 1500); }

    // If the dossier came back structurally empty, retry once, harder.
    if (res.ok && task === 'dossier' && isThinDossier(res.parsed)) {
      console.error(`[llm] task=dossier thin result, retrying. keys=${Object.keys(res.parsed || {}).join(',')}`);
      if (debug) { debug.retried = true; debug.firstKeys = Object.keys(res.parsed || {}); }
      const retry = await attempt(
        'Ta réponse précédente était incomplète. Remplis IMPÉRATIVEMENT chaque clé avec du contenu détaillé et concret : ' +
          'companyReport.financialHealth, companyReport.marketState, companyReport.recentNews, matchScore (nombre), missionRecap (paragraphe), ' +
          'au moins 2 gaps, au moins 2 blindSpotsCompany, sixtySecPitch (paragraphe), negotiationGuide.suggestedRange + coreArguments, useCaseScenario (au moins 1).'
      );
      if (retry.ok && !isThinDossier(retry.parsed)) {
        res = retry;
        if (debug) { debug.retrySucceeded = true; debug.rawSample = retry.raw.slice(0, 1500); }
      } else if (debug) {
        debug.retrySucceeded = false;
      }
    }

    if (!res.ok) {
      return { status: res.status, payload: { error: res.error, detail: res.detail, ...(debug ? { debug } : {}) } };
    }
    return { status: 200, payload: { text: res.text, sources: [], ...(debug ? { debug } : {}) } };
  } catch (err: any) {
    console.error(`[llm] task=${task} request failed:`, err);
    return { status: 502, payload: { error: 'Gateway request failed', detail: String(err?.message || err).slice(0, 300), ...(debug ? { debug } : {}) } };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  // Health / diagnostics.
  if (req.method === 'GET') {
    const base = {
      ok: true,
      endpoint: 'llm',
      keyConfigured: !!apiKey,
      model: activeModel(),
      modelCandidates: MODEL_CANDIDATES,
      resolvedModel,
    };

    // Full dossier pipeline self-test: proves structured output renders filled.
    if (req.query.selftest) {
      if (!apiKey) {
        res.status(200).json({ ...base, selftest: { tested: false, reason: 'no key' } });
        return;
      }
      const { status, payload } = await executeTask(apiKey, SELFTEST_DOSSIER_BODY, { debug: true });
      let diag: any = { tested: true, httpStatus: status, debug: payload?.debug };
      if (payload?.text) {
        try {
          const p = JSON.parse(payload.text);
          diag = {
            ...diag,
            parsedOk: true,
            topLevelKeys: Object.keys(p),
            hasCompanyReport: !!(p.companyReport && (p.companyReport.marketState || p.companyReport.financialHealth)),
            matchScore: p.matchScore,
            missionRecapLen: (p.missionRecap || '').length,
            pitchLen: (p.sixtySecPitch || '').length,
            gapsCount: Array.isArray(p.gaps) ? p.gaps.length : 0,
            blindSpotsCompanyCount: Array.isArray(p.blindSpotsCompany) ? p.blindSpotsCompany.length : 0,
            useCaseCount: Array.isArray(p.useCaseScenario) ? p.useCaseScenario.length : 0,
            negotiationRange: p.negotiationGuide?.suggestedRange,
          };
        } catch {
          diag = { ...diag, parsedOk: false, sample: String(payload.text).slice(0, 200) };
        }
      } else {
        diag = { ...diag, error: payload?.error, detail: payload?.detail };
      }
      res.status(200).json({ ...base, selftest: diag });
      return;
    }

    if (!req.query.ping) {
      res.status(200).json(base);
      return;
    }
    if (!apiKey) {
      res.status(200).json({ ...base, gateway: { tested: false, reason: 'no key' } });
      return;
    }
    try {
      const r = await callGateway(
        apiKey,
        [
          { role: 'system', content: 'Réponds exactement le mot: pong' },
          { role: 'user', content: 'ping' },
        ],
        { maxTokens: 20 }
      );
      res.status(200).json({
        ...base,
        resolvedModel,
        gateway: { tested: true, ok: r.ok, status: r.status, model: r.model, sample: (r.content || r.error || '').slice(0, 200), finishReason: r.finishReason },
      });
    } catch (err: any) {
      res.status(200).json({ ...base, gateway: { tested: true, ok: false, error: String(err?.message || err).slice(0, 200) } });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!apiKey) {
    // Not configured -> tell the client to use its local simulation.
    res.status(501).json({ error: 'AI_GATEWAY_API_KEY not configured' });
    return;
  }

  const { status, payload } = await executeTask(apiKey, (req.body || {}) as TaskBody);
  res.status(status).json(payload);
}
