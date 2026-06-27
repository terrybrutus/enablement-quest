# Enablement Quest: The Learning Systems Lab

Enablement Quest is an RPG-style learning experience created by Terry Brutus to demonstrate performance consulting, learning architecture, sales enablement judgment, and business-impact measurement.

The core question is simple:

> Is this really a training problem?

Players explore a modern organization, talk to workplace characters, inspect evidence, diagnose root causes, choose enablement interventions, and earn business-impact canvases.

## Why This Exists

This project is intended as a portfolio artifact, not just a game prototype. It is designed to show that enablement work is more than building training content. The experience asks players to connect messy workplace evidence to practical solutions that improve speed, quality, adoption, productivity, or revenue behavior.

## Current Experience

The current build includes two guided case studies:

- **The Broken Onboarding Portal**: New hires are taking too long to ramp, and leadership assumes the answer is more training.
- **The Stalled Demo Pipeline**: Sales demos are happening, but too few convert into qualified next steps.

Each case follows the same performance-consulting loop:

1. A stakeholder presents a workplace problem.
2. The player gathers evidence.
3. The player diagnoses the root cause.
4. The player selects an enablement intervention.
5. The game shows the expected business impact.
6. The player earns a canvas summarizing the decision.
7. After both cases, the final reviewer debrief explains what the full run proves for performance consulting, sales enablement, learning architecture, and portfolio storytelling.

## What It Demonstrates

- Diagnosing before designing
- Distinguishing training problems from workflow, reinforcement, communication, or coaching problems
- Connecting learning decisions to business metrics
- Applying sales enablement thinking to revenue behavior
- Using plain language and accessible interaction patterns
- Framing AI as support for research and drafting, with human judgment still accountable
- Translating the completed experience into a recruiter-facing proof point through the final reviewer debrief

## Portfolio Materials

The full portfolio write-up is in [PORTFOLIO_CASE_STUDY.md](./PORTFOLIO_CASE_STUDY.md).

Resume, interview, and LinkedIn-ready language is in [RESUME_PORTFOLIO_PACKET.md](./RESUME_PORTFOLIO_PACKET.md).

Claim-to-evidence mapping for recruiters is in [PORTFOLIO_EVIDENCE_MATRIX.md](./PORTFOLIO_EVIDENCE_MATRIX.md).

That document includes:

- One-line positioning
- Learning objective
- Case breakdowns
- Recruiter-facing value
- Resume bullet options
- LinkedIn post draft
- Current limitations and next quality bar

## Development

This is a Caffeine AI / ICP-oriented project with a React TypeScript frontend and Motoko backend structure.

Useful commands:

```bash
corepack pnpm --filter @caffeine/template-frontend check
corepack pnpm --filter @caffeine/template-frontend typecheck
corepack pnpm --filter @caffeine/template-frontend build
```

For local frontend review:

```bash
corepack pnpm --filter @caffeine/template-frontend exec vite preview --host 127.0.0.1 --port 43748
```

## Status

The current version proves the core two-case learning loop, reviewer-facing title screen, and portfolio story. It is not yet the final polish target. The next major improvements are richer case challenge, stronger scene composition, audio/transition polish, screenshots or short clips, and a fuller public portfolio page around the playable experience.
