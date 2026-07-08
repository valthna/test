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
 * If the key is missing or the gateway errors, the endpoint responds with a
 * non-2xx status and the client transparently falls back to its local
 * offline simulation, so the product keeps working.
 */

export const config = { maxDuration: 30 };

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini';

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
    "Renvoie un objet JSON décrivant l'entreprise recherchée avec EXACTEMENT ces clés : " +
    'city (string), country (string), isSubsidiary (boolean), baseSalaryAvg (number : salaire brut annuel € moyen réaliste pour le poste/secteur), ' +
    'baseSalaryType ("cadre" | "non-cadre"), variablePay (string), ' +
    'perks (objet { greenMobility, ticketsResto, ce, rtt, participation, workPhone : booleans, mutuelleName : string }), ' +
    'tools (array de strings), recruitmentProcessSteps (array parmi "Screening","Étude de cas","Entretien technique","Entretien managérial","Fondateur","Proposition finale"), ' +
    'remotePolicy (string), overallEnvironmentScore (number 0-5), workLifeBalanceScore (number 0-5), turnoverScore (number 0-5), ' +
    'valueProposition (string), recentMilestones (array de strings), realRealityReport (string : ce qui attend vraiment au quotidien), ' +
    "activeJobs (array d'intitulés de postes ouverts plausibles chez cette entreprise).",
  dossier:
    'Renvoie un objet JSON "dossier de combat" avec EXACTEMENT ces clés : ' +
    'companyReport (objet { financialHealth, marketState, recentNews : strings }), ' +
    'matchScore (number 0-100 : compatibilité entre le CV/profil du candidat et l\'offre, basée sur les mots-clés ET la profondeur d\'expérience/expertise), ' +
    'missionRecap (string : le vrai quotidien du poste au-delà de l\'annonce), ' +
    'gaps (array de { skill, defense, recommendedTraining }), ' +
    'blindSpotsJob (array de strings), ' +
    'blindSpotsCompany (array de { issue, expertQuestion } : failles de structure déduites permettant de poser des questions stratégiques), ' +
    'sixtySecPitch (string : pitch de 60 secondes personnalisé au candidat), ' +
    'negotiationGuide (objet { suggestedRange : string contenant un nombre en € brut annuel, coreArguments : array de strings }), ' +
    'interviewerQuestions (array de { roleType : "rh"|"manager"|"cto"|"peer", question, answerStrategy }), ' +
    'useCaseScenario (array de 1 à 3 { id : "exe-1"/"exe-2"/"exe-3", title, description, expectedDeliverable, proTips }).',
  coach_eval:
    'Tu joues le rôle de l\'interlocuteur en entretien puis tu analyses la réponse du candidat. Renvoie un objet JSON avec EXACTEMENT : ' +
    'rating ("good" | "average" | "poor"), critique (string : analyse de la réponse selon le framework STAR), ' +
    'optimizedResponse (string : reformulation d\'élite de la réponse du candidat), ' +
    'nextInterviewerQuestion (string : la question suivante que tu poses en tant qu\'interlocuteur).',
  exercise_eval:
    'Renvoie un objet JSON évaluant la proposition du candidat à un cas pratique, avec EXACTEMENT : ' +
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

function unwrapArray(parsed: any): any {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    for (const key of ['results', 'items', 'data', 'profiles', 'list']) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
  }
  return parsed;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    // Not configured -> tell the client to use its local simulation.
    res.status(501).json({ error: 'AI_GATEWAY_API_KEY not configured' });
    return;
  }

  const body = (req.body || {}) as {
    prompt?: string;
    systemInstruction?: string;
    isJSON?: boolean;
    task?: string;
    context?: any;
  };

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
        'Pas de texte autour, pas de balises Markdown, pas de commentaires.'
    );
  }

  const userContent = prompt + buildContextBlock(body.context);

  try {
    const gwResp = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: wantsJson ? 0.5 : 0.7,
        max_tokens: 1600,
        ...(wantsJson ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: systemParts.join('\n\n') },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!gwResp.ok) {
      const detail = await gwResp.text().catch(() => '');
      res.status(502).json({ error: `Gateway error ${gwResp.status}`, detail: detail.slice(0, 500) });
      return;
    }

    const data = await gwResp.json();
    let text: string = data?.choices?.[0]?.message?.content ?? '';

    // For array-shaped tasks the client expects a top-level JSON array, but the
    // gateway's json_object mode returns an object, so normalize.
    if (task === 'linkedin_search') {
      try {
        text = JSON.stringify(unwrapArray(JSON.parse(text)));
      } catch {
        /* leave as-is; client will fall back on parse error */
      }
    }

    res.status(200).json({ text, sources: [] });
  } catch (err: any) {
    res.status(502).json({ error: 'Gateway request failed', detail: String(err?.message || err).slice(0, 300) });
  }
}
