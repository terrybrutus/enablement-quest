import type {
  DiagnosisOption,
  EarnedArtifact,
  Evidence,
  GameCharacter,
  InterventionOption,
  Scene,
  SheetSprite,
  TilePatch,
} from "./types";

const officeSprite = (
  sx: number,
  sy: number,
  sw = 48,
  sh = 48,
): SheetSprite => ({
  image: "office",
  sx,
  sy,
  sw,
  sh,
});

const officeExteriorSprite = (
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): SheetSprite => ({
  image: "officeExterior",
  sx,
  sy,
  sw,
  sh,
});

const gardenSprite = (
  sx: number,
  sy: number,
  sw = 32,
  sh = 32,
): SheetSprite => ({
  image: "garden",
  sx,
  sy,
  sw,
  sh,
});

const tilePatch = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  sprite: SheetSprite,
): TilePatch => ({
  id,
  position: { x, y },
  size: { width, height },
  sprite,
});

export const assetUrls = {
  adamIdle: "/assets/limezu/adam-idle.png",
  adamRun: "/assets/limezu/adam-run.png",
  ameliaIdle: "/assets/limezu/amelia-idle.png",
  bobIdle: "/assets/limezu/bob-idle.png",
  roomBuilder: "/assets/limezu/room-builder-48.png",
  office: "/assets/limezu/office-48.png",
  officeExterior: "/assets/limezu/office-exterior-32.png",
  cityTerrains: "/assets/limezu/city-terrains-32.png",
  garden: "/assets/limezu/garden-32.png",
  exteriorWalls: "/assets/limezu/exterior-walls.png",
  exteriorFloors: "/assets/limezu/exterior-floors.png",
  fountain: "/assets/limezu/fountains.png",
  streetLamp: "/assets/limezu/street-lamp.png",
} as const;

export const tileSprites = {
  labFloor: { image: "roomBuilder", sx: 528, sy: 528, sw: 48, sh: 48 },
  warmFloor: { image: "roomBuilder", sx: 576, sy: 528, sw: 48, sh: 48 },
  salesFloor: { image: "roomBuilder", sx: 624, sy: 528, sw: 48, sh: 48 },
  wall: { image: "roomBuilder", sx: 240, sy: 0, sw: 48, sh: 48 },
  grass: { image: "exteriorFloors", sx: 192, sy: 0, sw: 48, sh: 48 },
  path: { image: "exteriorFloors", sx: 0, sy: 0, sw: 48, sh: 48 },
  plaza: { image: "exteriorFloors", sx: 288, sy: 96, sw: 48, sh: 48 },
  doorway: { image: "exteriorFloors", sx: 96, sy: 96, sw: 48, sh: 48 },
  gardenGrass: { image: "garden", sx: 32, sy: 0, sw: 32, sh: 32 },
  hedge: { image: "garden", sx: 0, sy: 0, sw: 32, sh: 32 },
} as const;

export const scenes: Scene[] = [
  {
    id: "lab",
    name: "Learning Systems Lab",
    subtitle: "Base camp for the diagnostic mission",
    width: 26,
    height: 18,
    theme: "interior",
    floorSprite: tileSprites.labFloor,
    portals: [
      {
        id: "lab-to-hub",
        label: "Organization Floor",
        rect: { x: 12, y: 16.2, width: 2, height: 1.8 },
        targetSceneId: "hub",
        targetPosition: { x: 20.5, y: 21.4 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 26, height: 1 },
      { x: 0, y: 0, width: 1, height: 18 },
      { x: 25, y: 0, width: 1, height: 18 },
      { x: 0, y: 17, width: 12, height: 1 },
      { x: 14, y: 17, width: 12, height: 1 },
    ],
    props: [
      {
        id: "mission-desk",
        description:
          "This is your case desk. The current case asks whether slow onboarding is really a training problem.",
        position: { x: 3.2, y: 10.2 },
        size: { width: 6.4, height: 1.35 },
        sprite: officeSprite(0, 24, 768, 156),
        collision: true,
      },
      {
        id: "analytics-wall",
        description:
          "The dashboard is waiting for evidence. Good enablement work starts with facts, not course requests.",
        position: { x: 15.4, y: 4.4 },
        size: { width: 5.6, height: 2.1 },
        sprite: officeSprite(0, 192, 768, 276),
        collision: true,
      },
      {
        id: "plant-lab",
        position: { x: 21, y: 12.8 },
        size: { width: 1, height: 1.35 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
      {
        id: "lab-console",
        description:
          "The AI workbench can help draft and summarize, but the diagnosis still has to be human-reviewed.",
        position: { x: 6.2, y: 4.4 },
        size: { width: 5.7, height: 2.4 },
        sprite: officeSprite(0, 480, 768, 240),
        collision: true,
      },
      {
        id: "lab-server-stack",
        description:
          "The server rack stores case artifacts. Evidence matters more than assumptions.",
        position: { x: 14.4, y: 12.4 },
        size: { width: 3.2, height: 2.1 },
        sprite: officeSprite(684, 1596, 84, 132),
        collision: true,
      },
    ],
  },
  {
    id: "hub",
    name: "Organization Floor",
    subtitle: "A compact campus for performance discovery",
    width: 42,
    height: 24,
    theme: "exterior",
    floorSprite: tileSprites.grass,
    tilePatches: [
      tilePatch("north-sidewalk", 4, 6.8, 34, 2, tileSprites.path),
      tilePatch("south-sidewalk", 11, 18.8, 20, 2, tileSprites.path),
      tilePatch("west-path", 7.2, 6.8, 2, 10, tileSprites.path),
      tilePatch("east-path", 31, 6.8, 2, 10, tileSprites.path),
      tilePatch("center-plaza", 16.6, 8.4, 8.8, 5.6, tileSprites.plaza),
      tilePatch("lab-walk", 20, 13, 2, 6.5, tileSprites.path),
      tilePatch("sales-walk", 7, 5.9, 2.4, 2.8, tileSprites.doorway),
      tilePatch("ops-walk", 30, 5.9, 2.4, 2.8, tileSprites.doorway),
      tilePatch("lab-threshold", 19.8, 18.8, 2.4, 1.8, tileSprites.doorway),
      tilePatch(
        "garden-bed-left",
        11.2,
        10.6,
        4.8,
        3.2,
        tileSprites.gardenGrass,
      ),
      tilePatch(
        "garden-bed-right",
        26,
        10.6,
        4.8,
        3.2,
        tileSprites.gardenGrass,
      ),
      tilePatch("hedge-left", 11.2, 10.1, 4.8, 0.6, tileSprites.hedge),
      tilePatch("hedge-right", 26, 10.1, 4.8, 0.6, tileSprites.hedge),
    ],
    portals: [
      {
        id: "hub-to-lab",
        label: "Learning Systems Lab",
        rect: { x: 20, y: 19.5, width: 2, height: 1.5 },
        targetSceneId: "lab",
        targetPosition: { x: 13, y: 15.7 },
      },
      {
        id: "hub-to-operations",
        label: "Operations Suite",
        rect: { x: 29.4, y: 5.8, width: 3.4, height: 2.1 },
        targetSceneId: "operations",
        targetPosition: { x: 13, y: 15 },
      },
      {
        id: "hub-to-sales",
        label: "Sales Strategy Studio",
        rect: { x: 6.4, y: 5.8, width: 3.4, height: 2.1 },
        targetSceneId: "sales",
        targetPosition: { x: 13, y: 15 },
      },
    ],
    blocks: [
      { x: 28.5, y: 2.2, width: 7, height: 4.8 },
      { x: 4.7, y: 2.4, width: 7.6, height: 4.6 },
      { x: 17, y: 16.6, width: 8.3, height: 4.4 },
      { x: 20, y: 9, width: 2, height: 2 },
    ],
    props: [
      {
        id: "sales-building",
        label: "Sales Strategy Studio",
        position: { x: 3.5, y: 1.1 },
        size: { width: 9.1, height: 6.6 },
        sprite: officeExteriorSprite(640, 384, 288, 512),
        collision: true,
      },
      {
        id: "operations-building",
        label: "Operations Suite",
        position: { x: 26.8, y: 0.9 },
        size: { width: 9.7, height: 6.8 },
        sprite: officeExteriorSprite(320, 1792, 608, 576),
        collision: true,
      },
      {
        id: "lab-building",
        label: "Learning Systems Lab",
        position: { x: 16.2, y: 14.1 },
        size: { width: 9.5, height: 6.7 },
        sprite: officeExteriorSprite(0, 2432, 512, 576),
        collision: true,
      },
      {
        id: "hub-fountain",
        description:
          "Central plaza. Doorways lead to case rooms; glowing evidence appears inside active case areas.",
        position: { x: 19.7, y: 9.3 },
        size: { width: 2.4, height: 2.4 },
        sprite: { image: "fountain", sx: 0, sy: 0, sw: 96, sh: 96 },
        collision: true,
      },
      {
        id: "garden-bush-a",
        position: { x: 12.6, y: 11.6 },
        size: { width: 1, height: 1 },
        sprite: gardenSprite(64, 32),
        collision: true,
      },
      {
        id: "garden-bush-b",
        position: { x: 28.2, y: 11.6 },
        size: { width: 1, height: 1 },
        sprite: gardenSprite(96, 32),
        collision: true,
      },
      {
        id: "plaza-bench-a",
        description:
          "A quiet bench near the plaza. The campus is built around evidence, decision, and impact.",
        position: { x: 16.8, y: 12.8 },
        size: { width: 2, height: 0.8 },
        sprite: gardenSprite(512, 528, 128, 64),
        collision: true,
      },
      {
        id: "plaza-bench-b",
        position: { x: 23.2, y: 12.8 },
        size: { width: 2, height: 0.8 },
        sprite: gardenSprite(512, 528, 128, 64),
        collision: true,
      },
      {
        id: "lamp-a",
        position: { x: 17.1, y: 10.1 },
        size: { width: 0.8, height: 1.5 },
        sprite: { image: "streetLamp", sx: 0, sy: 0, sw: 48, sh: 96 },
      },
      {
        id: "lamp-b",
        position: { x: 24.1, y: 10.1 },
        size: { width: 0.8, height: 1.5 },
        sprite: { image: "streetLamp", sx: 0, sy: 0, sw: 48, sh: 96 },
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Suite",
    subtitle: "Case: new hires are taking too long to ramp",
    width: 26,
    height: 18,
    theme: "interior",
    floorSprite: tileSprites.warmFloor,
    portals: [
      {
        id: "operations-to-hub",
        label: "Organization Floor",
        rect: { x: 12, y: 16.2, width: 2, height: 1.8 },
        targetSceneId: "hub",
        targetPosition: { x: 31.5, y: 7.2 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 26, height: 1 },
      { x: 0, y: 0, width: 1, height: 18 },
      { x: 25, y: 0, width: 1, height: 18 },
      { x: 0, y: 17, width: 12, height: 1 },
      { x: 14, y: 17, width: 12, height: 1 },
    ],
    props: [
      {
        id: "manager-table",
        description:
          "Stakeholder notes point to unclear handoffs and inconsistent manager follow-through.",
        position: { x: 3.1, y: 4.2 },
        size: { width: 5.8, height: 2 },
        sprite: officeSprite(0, 1632, 288, 204),
        collision: true,
      },
      {
        id: "metric-board",
        description:
          "Ramp data shows the problem spikes after orientation, which suggests reinforcement and workflow gaps.",
        position: { x: 15.9, y: 4 },
        size: { width: 5.4, height: 1.8 },
        sprite: officeSprite(0, 192, 768, 276),
        collision: true,
      },
      {
        id: "process-desk",
        description:
          "The process review desk shows access delays and too many handoffs before new hires can work confidently.",
        position: { x: 9.2, y: 9.2 },
        size: { width: 6.8, height: 2.4 },
        sprite: officeSprite(0, 1644, 672, 336),
        collision: true,
      },
      {
        id: "office-plant",
        position: { x: 21, y: 9.8 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
    ],
  },
  {
    id: "sales",
    name: "Sales Strategy Studio",
    subtitle: "Case: demo quality is not turning into pipeline",
    width: 26,
    height: 18,
    theme: "interior",
    floorSprite: tileSprites.salesFloor,
    portals: [
      {
        id: "sales-to-hub",
        label: "Organization Floor",
        rect: { x: 12, y: 16.2, width: 2, height: 1.8 },
        targetSceneId: "hub",
        targetPosition: { x: 8, y: 7.2 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 26, height: 1 },
      { x: 0, y: 0, width: 1, height: 18 },
      { x: 25, y: 0, width: 1, height: 18 },
      { x: 0, y: 17, width: 12, height: 1 },
      { x: 14, y: 17, width: 12, height: 1 },
    ],
    props: [
      {
        id: "deal-review-table",
        description:
          "Deal reviews show reps can demo features, but discovery notes rarely connect the demo to business pain.",
        position: { x: 3.2, y: 4.3 },
        size: { width: 6.4, height: 1.35 },
        sprite: officeSprite(0, 24, 768, 156),
        collision: true,
      },
      {
        id: "pipeline-board",
        description:
          "The board shows plenty of demos but weak next-step conversion. The issue is not activity volume.",
        position: { x: 15.8, y: 3.9 },
        size: { width: 5.5, height: 2 },
        sprite: officeSprite(0, 192, 768, 276),
        collision: true,
      },
      {
        id: "call-coaching-station",
        description:
          "The coaching station points to inconsistent discovery prompts and limited manager reinforcement after training.",
        position: { x: 9, y: 9.1 },
        size: { width: 7.2, height: 2.5 },
        sprite: officeSprite(48, 1944, 720, 324),
        collision: true,
      },
      {
        id: "sales-plant",
        position: { x: 21, y: 9.8 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
    ],
  },
];

export const characters: GameCharacter[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Operations Manager",
    sceneId: "operations",
    position: { x: 13, y: 7 },
    patrol: [
      { x: 13, y: 7 },
      { x: 15, y: 7.5 },
      { x: 15, y: 9 },
      { x: 12.5, y: 9 },
    ],
    sprite: { image: "ameliaIdle", sx: 0, sy: 0, sw: 16, sh: 32 },
    dialogue: {
      briefing: [
        "I need help. Leadership thinks new hires need more training.",
        "But the pattern feels messier than that. Ramp is slow, support tickets are up, and managers keep improvising.",
        "Start by inspecting the evidence in this room before we decide what to build.",
      ],
      investigate: [
        "Do not jump to a course yet. Gather the interview note, process map, and performance metric first.",
        "The real question is whether this is a knowledge gap, workflow gap, tool friction, or reinforcement problem.",
      ],
      diagnose: [
        "You have the evidence. Now make the call: is this actually a training problem?",
        "Use judgment. The obvious answer is not always the useful answer.",
      ],
      design: [
        "Good diagnosis. Now choose the intervention that fits the cause.",
        "A strong enablement solution changes behavior and gives leaders a metric to watch.",
      ],
      complete: [
        "That is the difference between building training and solving a performance problem.",
        "You earned the Enablement Diagnostic Canvas. It explains the evidence, root cause, intervention, and business impact.",
      ],
    },
  },
  {
    id: "sam",
    name: "Sam",
    role: "New Hire",
    sceneId: "hub",
    position: { x: 8.5, y: 10.5 },
    patrol: [
      { x: 8.5, y: 10.5 },
      { x: 11, y: 10.5 },
      { x: 11, y: 12 },
      { x: 8.5, y: 12 },
    ],
    sprite: { image: "bobIdle", sx: 0, sy: 0, sw: 16, sh: 32 },
    dialogue: {
      briefing: [
        "I joined three weeks ago. Everyone is helpful, but I keep asking the same basic questions.",
      ],
      investigate: [
        "The issue is not motivation. I just cannot tell which checklist is current.",
      ],
      diagnose: ["If the path were clearer, I would need fewer check-ins."],
      design: ["A manager checklist and one source of truth would help a lot."],
      complete: ["The new canvas makes the next step obvious."],
    },
  },
  {
    id: "leo",
    name: "Leo",
    role: "Sales Enablement Lead",
    sceneId: "sales",
    position: { x: 13, y: 7 },
    patrol: [
      { x: 13, y: 7 },
      { x: 10.5, y: 8 },
      { x: 13, y: 9.5 },
      { x: 15.5, y: 8 },
    ],
    sprite: { image: "bobIdle", sx: 0, sy: 0, sw: 16, sh: 32 },
    dialogue: {
      briefing: [
        "Sales leadership says reps need better demo training.",
        "Maybe. But demos are happening. The problem is that too few demos become real next steps.",
        "Inspect the evidence before deciding whether this is a training gap, coaching gap, message gap, or process gap.",
      ],
      investigate: [
        "Look for the pattern, not the loudest complaint.",
        "If reps can explain features but cannot connect value to buyer pain, the intervention should not be a generic product course.",
      ],
      diagnose: [
        "You have enough evidence. What is actually blocking demo-to-opportunity conversion?",
        "A sales enablement answer should connect behavior, manager reinforcement, and measurable pipeline impact.",
      ],
      design: [
        "Good. Now pick an intervention that changes sales behavior at the point of work.",
        "The best option should help reps prepare, help managers coach, and give leaders a metric to inspect.",
      ],
      complete: [
        "That is the sales enablement story: not more content, better revenue behavior.",
        "You earned the Sales Enablement Impact Canvas.",
      ],
    },
  },
];

export const evidenceItems: Evidence[] = [
  {
    id: "interview-note",
    caseId: "onboarding",
    title: "Interview Note",
    sceneId: "operations",
    position: { x: 6.5, y: 8 },
    summary:
      "New hires say they receive multiple versions of the same onboarding instructions.",
    insight:
      "Evidence points to unclear expectations and inconsistent manager reinforcement.",
    metric: "Survey confidence: 58%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "process-map",
    caseId: "onboarding",
    title: "Process Map",
    sceneId: "operations",
    position: { x: 12.5, y: 12 },
    summary:
      "The process map has three handoffs before tool access is confirmed.",
    insight:
      "The ramp problem is partly workflow friction, not just missing knowledge.",
    metric: "Average access delay: 8 days",
    sprite: officeSprite(384, 384),
  },
  {
    id: "performance-metric",
    caseId: "onboarding",
    title: "Performance Metric",
    sceneId: "operations",
    position: { x: 19.5, y: 8 },
    summary:
      "Support tickets spike during weeks two and three, after formal orientation ends.",
    insight:
      "The system needs reinforcement and job support at the point of work.",
    metric: "Tickets per cohort: +31%",
    sprite: officeSprite(432, 384),
  },
  {
    id: "demo-call-review",
    caseId: "sales",
    title: "Demo Call Review",
    sceneId: "sales",
    position: { x: 6.5, y: 8 },
    summary:
      "Reps describe product features clearly, but only 34% ask a second-layer discovery question before the demo.",
    insight:
      "The behavior gap is discovery depth and value framing, not basic product knowledge.",
    metric: "Discovery depth: 34%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "crm-stage-audit",
    caseId: "sales",
    title: "CRM Stage Audit",
    sceneId: "sales",
    position: { x: 12.5, y: 12 },
    summary:
      "Demo completion is high, but next-step conversion drops when business pain is missing from the opportunity notes.",
    insight:
      "The sales process needs a stronger qualification habit and clearer manager inspection points.",
    metric: "Demo-to-next-step: 41%",
    sprite: officeSprite(384, 384),
  },
  {
    id: "manager-coaching-note",
    caseId: "sales",
    title: "Manager Coaching Note",
    sceneId: "sales",
    position: { x: 19.5, y: 8 },
    summary:
      "Managers coach demos inconsistently because there is no shared rubric for value messaging.",
    insight:
      "Reinforcement is weak. A one-time workshop would fade without a coaching system.",
    metric: "Coaching rubric use: 18%",
    sprite: officeSprite(432, 384),
  },
];

export const diagnosisOptions: DiagnosisOption[] = [
  {
    id: "more-elearning",
    caseId: "onboarding",
    label: "New hires need more eLearning.",
    explanation:
      "This treats every symptom as a knowledge gap and ignores handoffs, manager reinforcement, and tool access delays.",
    correct: false,
    evidenceHint:
      "The evidence shows conflicting instructions and access delays, not missing orientation content.",
  },
  {
    id: "workflow-reinforcement",
    caseId: "onboarding",
    label: "The main issue is an unclear workflow with weak reinforcement.",
    explanation:
      "Correct. The evidence shows inconsistent instructions, delayed access, and a gap after orientation.",
    correct: true,
    evidenceHint:
      "Interview notes, process handoffs, and week-two tickets all point to workflow plus reinforcement.",
  },
  {
    id: "software-broken",
    caseId: "onboarding",
    label: "The software is broken.",
    explanation:
      "Tool access is part of the problem, but the evidence does not support software failure as the root cause.",
    correct: false,
    evidenceHint:
      "Access delay matters, but nothing says the tool itself fails after access is granted.",
  },
  {
    id: "sales-product-training",
    caseId: "sales",
    label: "Reps need deeper product training before every demo.",
    explanation:
      "The call review says reps explain features clearly. More product content misses the buyer-conversation gap.",
    correct: false,
    evidenceHint:
      "Feature explanation is not the weak signal; discovery depth and next-step conversion are.",
  },
  {
    id: "sales-discovery-coaching",
    caseId: "sales",
    label:
      "The root cause is weak discovery habits with inconsistent manager coaching.",
    explanation:
      "Correct. The evidence connects shallow discovery, missing pain notes, and low rubric use.",
    correct: true,
    evidenceHint:
      "The call review, CRM audit, and coaching note triangulate the same behavior gap.",
  },
  {
    id: "sales-more-activity",
    caseId: "sales",
    label: "The team needs more demo activity.",
    explanation:
      "Activity is not the bottleneck. Demos are happening; conversion after the demo is the issue.",
    correct: false,
    evidenceHint:
      "The pipeline signal points to quality of next step, not quantity of demos.",
  },
];

export const interventionOptions: InterventionOption[] = [
  {
    id: "training-module",
    caseId: "onboarding",
    label: "Build a longer training module.",
    explanation:
      "A longer module adds content, but it does not fix ownership, timing, or manager follow-through.",
    correct: false,
    tradeoff:
      "Fast to ship, but it leaves managers and access handoffs untouched.",
  },
  {
    id: "diagnostic-canvas",
    caseId: "onboarding",
    label: "Create a manager checklist, job aid, and diagnostic dashboard.",
    explanation:
      "Correct. This supports the workflow, reinforces expectations, and creates measurable visibility.",
    correct: true,
    tradeoff:
      "Requires manager adoption, but it addresses workflow, reinforcement, and measurement together.",
  },
  {
    id: "announcement",
    caseId: "onboarding",
    label: "Send a one-time announcement.",
    explanation:
      "Communication helps awareness, but one message will not sustain a changed onboarding behavior.",
    correct: false,
    tradeoff:
      "Low effort, low behavior change. It does not create a new operating habit.",
  },
  {
    id: "sales-demo-certification",
    caseId: "sales",
    label: "Require a demo certification for every rep.",
    explanation:
      "Certification may improve consistency, but the evidence points to discovery and manager reinforcement before the demo.",
    correct: false,
    tradeoff:
      "It measures presentation skill more than buyer diagnosis or pipeline behavior.",
  },
  {
    id: "sales-coaching-system",
    caseId: "sales",
    label:
      "Create a discovery guide, manager coaching rubric, and pipeline inspection dashboard.",
    explanation:
      "Correct. This changes pre-demo behavior, gives managers a coaching tool, and tracks conversion.",
    correct: true,
    tradeoff:
      "It takes coordination with sales leaders, but it connects enablement work to revenue behavior.",
  },
  {
    id: "sales-slack-reminder",
    caseId: "sales",
    label: "Send weekly Slack tips about better discovery.",
    explanation:
      "Tips can reinforce a habit, but alone they do not give reps practice, manager coaching, or measurement.",
    correct: false,
    tradeoff: "Useful as a support tactic, weak as the core intervention.",
  },
];

export const earnedCanvas: EarnedArtifact = {
  id: "enablement-diagnostic-canvas",
  title: "Enablement Diagnostic Canvas",
  subtitle: "Case: New hire ramp is slower than expected",
  sections: [
    {
      label: "Business Problem",
      value: "New hires are taking 90 days to reach expected productivity.",
    },
    {
      label: "Root Cause",
      value:
        "Unclear onboarding workflow, delayed tool access, and inconsistent manager reinforcement.",
    },
    {
      label: "Intervention",
      value:
        "Manager checklist, new-hire job aid, access handoff map, and lightweight diagnostic dashboard.",
    },
    {
      label: "Accessibility / Inclusion",
      value:
        "Use plain language, keyboard-accessible artifacts, readable contrast, and one source of truth.",
    },
    {
      label: "Responsible AI Support",
      value:
        "Use AI to summarize interviews and draft job aids, with human review before publishing.",
    },
    {
      label: "Expected Impact",
      value:
        "Time to productivity improves from 90 to 65 days; support tickets decrease 22%; confidence increases.",
    },
  ],
};

export const salesCanvas: EarnedArtifact = {
  id: "sales-enablement-impact-canvas",
  title: "Sales Enablement Impact Canvas",
  subtitle: "Case: Demo quality is not converting into next steps",
  sections: [
    {
      label: "Business Problem",
      value:
        "Demos are happening, but too few convert into qualified next steps.",
    },
    {
      label: "Root Cause",
      value:
        "Reps explain features, but discovery is shallow and managers lack a consistent coaching rubric.",
    },
    {
      label: "Intervention",
      value:
        "Discovery guide, manager coaching rubric, call-review practice, and pipeline inspection dashboard.",
    },
    {
      label: "Accessibility / Inclusion",
      value:
        "Use plain-language prompts, accessible templates, role-play options, and clear examples for varied experience levels.",
    },
    {
      label: "Responsible AI Support",
      value:
        "Use AI to summarize call patterns and draft coaching prompts, with manager review before use.",
    },
    {
      label: "Expected Impact",
      value:
        "Demo-to-next-step conversion improves from 41% to 56%; rubric use increases; discovery quality becomes visible.",
    },
  ],
};

export const earnedArtifactsByCase = {
  onboarding: earnedCanvas,
  sales: salesCanvas,
} as const;

export const initialPosition = { x: 13, y: 15.2 };
