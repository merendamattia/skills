# Build Production Web App

Skill installabile per creare, estendere e verificare applicazioni web full stack pronte per la produzione. Contiene la skill globale originale, il relativo starter e guide integrate per architettura, frontend, backend, sicurezza, Docker, worker e Conventional Commits.

## Installazione

Installa la skill da questa repository con [Vercel Skills](https://github.com/vercel-labs/skills):

```sh
npx skills add merendamattia/skills -g
```

La repository contiene una sola skill, `build-production-webapp`, quindi non serve `--skill`. Per installarla nel progetto corrente, rimuovi `-g`.

## Aggiornamento

Pubblica le modifiche su GitHub, poi esegui:

```sh
npx skills update -g build-production-webapp
```

`skills` registra sorgente, percorso e hash dei file installati e usa questi dati per trovare gli aggiornamenti. Git conserva la cronologia della skill; non serve creare una release npm o incrementare a mano un numero di versione. Il comando di aggiornamento interroga il branch remoto configurato dalla sorgente, perciò installa le modifiche dopo il push.

## Contenuto

- `skills/build-production-webapp/SKILL.md`: flusso comune e router.
- `references/`: guide progressive, inclusi i Conventional Commits e le competenze web richieste.
- `assets/starter/`: starter Bun, Next.js, Hono, Prisma, PostgreSQL, Better Auth, BullMQ, Redis e Docker Compose.

Le integrazioni e i percorsi delle skill sorgenti sono mantenuti in [`references/skills.md`](skills/build-production-webapp/references/skills.md). Le versioni dello starter restano bloccate nel suo `bun.lock`; i riferimenti aggiornabili dello starter sono elencati nel suo `skills-lock.json`.
