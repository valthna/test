# Copilot Prep Engine

Assistant de préparation d'entretiens (React + Vite + TypeScript + Tailwind) :
onboarding guidé par un agent IA, cockpit Kanban, vitrine d'entreprises,
coach IA multi-rôles, exercices et dossiers stratégiques.

## Développement

```bash
npm install
npm run dev      # serveur de dev Vite
npm run build    # typecheck + build de production (dist/)
npm run preview  # sert le build
```

## Intelligence — Vercel AI Gateway

Toute l'intelligence de l'app (recherche LinkedIn/entreprise, dossier de
combat, coach, exercices, débrief, chat) passe par le **Vercel AI Gateway**.

- Le client (`callGeminiAPI`) appelle la fonction serverless **`/api/llm`**.
- `/api/llm` relaie la requête au gateway (`https://ai-gateway.vercel.sh`)
  côté serveur. **La clé n'est jamais dans le bundle navigateur.**
- Si le gateway n'est pas configuré (pas de clé) ou renvoie une erreur, le
  client bascule automatiquement sur une **simulation locale** — l'app reste
  donc fonctionnelle en toutes circonstances.

### Configuration (Vercel → Settings → Environment Variables)

| Variable | Requis | Rôle |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | oui | Clé créée dans l'onglet AI Gateway du projet Vercel |
| `AI_GATEWAY_MODEL` | non | Modèle `créateur/modèle` (défaut `openai/gpt-4o-mini`) |

Après avoir ajouté/mis à jour les variables, redéploie pour qu'elles soient
prises en compte. En local, copie `.env.example` vers `.env` (utilisé par
`vercel dev`).
