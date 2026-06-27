# Enablement Quest Portfolio Evidence Matrix

This matrix keeps the portfolio story honest. It maps each recruiter-facing claim to evidence that exists in the current repo or playable experience, plus the boundary Terry Brutus should keep when discussing it.

## Claim-To-Evidence Map

| Portfolio claim | Current evidence | Where to point reviewers | Safe wording |
| --- | --- | --- | --- |
| Terry diagnoses before designing. | The game loop requires stakeholder framing, evidence review, root-cause diagnosis, intervention selection, and impact review. | `README.md`, `PORTFOLIO_CASE_STUDY.md`, Mission Guide, decision panel. | "I designed a diagnose-before-design simulation." |
| Terry can distinguish training problems from broader performance problems. | Both cases include traps where more training feels plausible but does not solve the evidence pattern. | Case 01 and Case 02 decision panels; `caseSynthesis` in `GameCanvas.tsx`. | "The cases ask learners to test whether training is actually the right intervention." |
| Terry can design sales enablement experiences. | Case 02 focuses on stalled demo conversion, discovery depth, CRM evidence, manager coaching, and pipeline impact. | Sales Strategy Studio case; `RESUME_PORTFOLIO_PACKET.md` sales enablement bullets. | "I built a sales enablement case around revenue behavior and manager reinforcement." |
| Terry can connect learning decisions to business impact. | Earned canvases connect root causes and interventions to ramp speed, support tickets, confidence, adoption, and demo conversion. | Backpack/canvas overlay; `earnedArtifactsByCase` in `levels.ts`. | "The artifacts translate player decisions into business-impact logic." |
| Terry uses plain language for complex enablement concepts. | Player-facing labels use "people," "stakeholders," "mission," "evidence," "guide," and "backpack" instead of developer/game jargon. | Title screen, HUD, Mission Guide, dialogue panels. | "I used plain language so non-gamers and recruiters can follow the experience." |
| Terry considers accessibility and responsive interaction. | The build includes keyboard controls, mobile joystick controls, readable panels, button-based interaction, and a settings control for movement speed. | Title screen controls, HUD, Settings panel, `README.md`. | "I incorporated accessible interaction patterns and responsive controls, while visual polish is still evolving." |
| Terry can use AI responsibly. | AI is framed as support for summarization and drafting, not as the decision-maker. | `PORTFOLIO_CASE_STUDY.md`, `RESUME_PORTFOLIO_PACKET.md`, dialogue/evidence copy. | "AI supports drafting and analysis; human judgment remains accountable." |
| Terry can build an interactive proof-of-work artifact. | The repo contains a playable React/TypeScript frontend, Caffeine/ICP project structure, Motoko backend files, and a browser-based game loop. | GitHub repo, `project.json`, `src/frontend`, `src/backend`. | "I built a browser-based interactive prototype with AI-assisted development." |
| Terry can translate gameplay into recruiter-facing evidence. | After both cases, the final reviewer debrief summarizes performance consulting, sales enablement range, learning architecture, and portfolio talking points. | Final reviewer debrief after the Sales Enablement Impact Canvas; `GameCanvas.tsx`. | "The experience ends by connecting the completed run to the portfolio claims." |

## Reviewer Path

Use this path when sharing the project with a recruiter or hiring manager who only has a few minutes:

1. Start on the title screen and read the reviewer lens.
2. Open "How to review" to see the intended five-minute path.
3. Start Case 01 and talk to Maya in Operations Suite.
4. Inspect the evidence and answer the "Check Your Read" prompts.
5. Choose the diagnosis and intervention.
6. Open the earned canvas and read how the choice connects to business impact.
7. Repeat the loop in Sales Strategy Studio for the sales enablement case.
8. Read the final reviewer debrief after the Sales Enablement Impact Canvas.

## Evidence Boundaries

Do not overclaim the current build.

- The impact metrics are scenario-based targets, not live production results.
- The visual layer is improving but should not be positioned as final art polish.
- The project demonstrates AI-assisted development and learning architecture; it does not demonstrate that Terry trained a machine-learning model.
- The strongest claim is judgment: diagnosing workplace performance problems and choosing the right enablement intervention.

## Best Interview Framing

> Enablement Quest is a playable portfolio case study. I built it to show how I think through enablement work: start with the business problem, gather evidence, diagnose the root cause, choose the right intervention, and connect the solution to measurable outcomes. The game format makes that thinking visible instead of hiding it behind a finished slide deck or generic AI-generated document.
