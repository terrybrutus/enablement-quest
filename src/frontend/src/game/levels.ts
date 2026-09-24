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
  // Legacy assets
  adamIdle: "/assets/limezu/adam-idle.png",
  adamRun: "/assets/limezu/adam-run.png",
  ameliaIdle: "/assets/limezu/amelia-idle.png",
  bobIdle: "/assets/limezu/bob-idle.png",
  roomBuilder: "/assets/limezu/room-builder-48.png",
  office: "/assets/limezu/office-48.png",
  cityTerrains: "/assets/limezu/city-terrains-32.png",
  garden: "/assets/limezu/garden-32.png",
  exteriorWalls: "/assets/limezu/exterior-walls.png",
  exteriorFloors: "/assets/limezu/exterior-floors.png",
  fountain: "/assets/limezu/fountains.png",
  streetLamp: "/assets/limezu/street-lamp.png",

  // New interior tiles with color differentiation
  interiorsTiles: "/assets/tiles/Interiors_free_48x48.png",
  roomBuilderTiles: "/assets/tiles/Room_Builder_free_48x48.png",

  // Office props
  officeProps1: "/assets/props/Modern_Office_Singles_48x48_1.png",
  officeProps2: "/assets/props/Modern_Office_Singles_48x48_2.png",
  officeProps3: "/assets/props/Modern_Office_Singles_48x48_3.png",
  officeProps4: "/assets/props/Modern_Office_Singles_48x48_4.png",
  officeProps5: "/assets/props/Modern_Office_Singles_48x48_5.png",
  officeProps6: "/assets/props/Modern_Office_Singles_48x48_6.png",
  officeProps7: "/assets/props/Modern_Office_Singles_48x48_7.png",
  officeProps10: "/assets/props/Modern_Office_Singles_48x48_10.png",
  officeProps15: "/assets/props/Modern_Office_Singles_48x48_15.png",
  officeProps20: "/assets/props/Modern_Office_Singles_48x48_20.png",

  // Enhanced character sprites
  adamRunEnhanced: "/assets/characters/Adam_run_16x16.png",
  adamIdleEnhanced: "/assets/characters/Adam_idle_anim_16x16.png",
  ameliaRunEnhanced: "/assets/characters/Amelia_run_16x16.png",
  ameliaIdleEnhanced: "/assets/characters/Amelia_idle_anim_16x16.png",
  bobRunEnhanced: "/assets/characters/Bob_run_16x16.png",
  bobIdleEnhanced: "/assets/characters/Bob_idle_anim_16x16.png",

  // Exterior tileset
  exteriorFloorsTileset: "/assets/tiles/A2_Floors_MV_TILESET.png",
} as const;

export const tileSprites = {
  // Original tiles (kept for fallback)
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
    subtitle: "Base camp for the diagnostic case",
    width: 18,
    height: 13,
    theme: "interior",
    floorSprite: tileSprites.labFloor,
    portals: [
      {
        id: "lab-to-hub",
        label: "Organization Floor",
        rect: { x: 8, y: 11.15, width: 2, height: 1.6 },
        targetSceneId: "hub",
        targetPosition: { x: 15, y: 16.35 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 18, height: 1 },
      { x: 0, y: 0, width: 1, height: 13 },
      { x: 17, y: 0, width: 1, height: 13 },
      { x: 0, y: 12, width: 8, height: 1 },
      { x: 10, y: 12, width: 8, height: 1 },
    ],
    props: [
      {
        id: "mission-desk",
        description:
          "This is your case desk. The current case asks whether slow onboarding is really a training problem.",
        position: { x: 3.2, y: 4.6 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(336, 1392, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "analytics-wall",
        description:
          "The dashboard is waiting for evidence. Good enablement work starts with facts, not course requests.",
        position: { x: 6.9, y: 1.35 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(48, 1488, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "plant-lab",
        position: { x: 14.8, y: 8.8 },
        size: { width: 1, height: 1.35 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
      {
        id: "lab-console",
        description:
          "The AI workbench can help draft and summarize, but the diagnosis still has to be human-reviewed.",
        position: { x: 10.7, y: 4.1 },
        size: { width: 2.2, height: 2 },
        sprite: officeSprite(384, 1296, 96, 96),
        collision: true,
      },
      {
        id: "lab-server-stack",
        description:
          "The server rack stores case evidence. Evidence matters more than assumptions.",
        position: { x: 4.1, y: 8.5 },
        size: { width: 1.5, height: 1.7 },
        sprite: officeSprite(0, 1152, 96, 96),
        collision: true,
        glow: true,
      },
      {
        id: "lab-shelf1",
        position: { x: 2, y: 5 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(384, 192),
        collision: true,
      },
      {
        id: "lab-shelf2",
        position: { x: 2, y: 8 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(384, 240),
        collision: true,
      },
      {
        id: "lab-chair",
        position: { x: 14.1, y: 4.85 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(336, 240),
      },
      {
        id: "lab-decoration",
        position: { x: 13.9, y: 7.15 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(432, 240),
      },
    ],
  },
  {
    id: "hub",
    name: "Organization Floor",
    subtitle: "A compact campus for performance discovery",
    width: 30,
    height: 18,
    theme: "exterior",
    floorSprite: tileSprites.gardenGrass,
    tilePatches: [
      tilePatch("north-sidewalk", 2.5, 7.55, 25, 2, tileSprites.path),
      tilePatch("west-path", 6.6, 7.55, 2.2, 3.95, tileSprites.path),
      tilePatch("east-path", 21.2, 7.55, 2.2, 3.95, tileSprites.path),
      tilePatch("center-plaza", 10.4, 7.35, 9.2, 4.35, tileSprites.path),
      tilePatch("lab-walk", 14, 11, 2, 4.7, tileSprites.path),
      tilePatch("sales-threshold", 6.5, 7.65, 2.6, 1.2, tileSprites.doorway),
      tilePatch("ops-threshold", 20.9, 7.65, 2.6, 1.2, tileSprites.doorway),
      tilePatch("lab-threshold", 13.7, 15.15, 2.6, 1, tileSprites.doorway),
    ],
    portals: [
      {
        id: "hub-to-lab",
        label: "Learning Systems Lab",
        rect: { x: 14.45, y: 14.72, width: 1.1, height: 0.72 },
        targetSceneId: "lab",
        targetPosition: { x: 9, y: 9.6 },
      },
      {
        id: "hub-to-operations",
        label: "Operations Suite",
        rect: { x: 21.55, y: 7.02, width: 1.05, height: 0.72 },
        targetSceneId: "operations",
        targetPosition: { x: 9, y: 10.25 },
      },
      {
        id: "hub-to-sales",
        label: "Sales Strategy Studio",
        rect: { x: 6.85, y: 7.02, width: 1.05, height: 0.72 },
        targetSceneId: "sales",
        targetPosition: { x: 9, y: 10.25 },
      },
    ],
    blocks: [
      { x: 18.9, y: 3.1, width: 8.5, height: 4.45 },
      { x: 3, y: 3.1, width: 7.1, height: 4.45 },
      { x: 11, y: 11.2, width: 8.2, height: 4 },
    ],
    props: [],
  },
  {
    id: "operations",
    name: "Operations Suite",
    subtitle: "Case: new hires are taking too long to ramp",
    width: 18,
    height: 13,
    theme: "interior",
    floorSprite: tileSprites.warmFloor,
    tilePatches: [
      tilePatch("ops-interview-zone", 2.6, 4.5, 4, 2.4, tileSprites.labFloor),
      tilePatch("ops-process-zone", 7.2, 7.7, 3.8, 2.3, tileSprites.labFloor),
      tilePatch("ops-metric-zone", 12.2, 4.5, 3.6, 2.4, tileSprites.labFloor),
      tilePatch("ops-maya-zone", 7.1, 2.9, 3.8, 2, tileSprites.labFloor),
    ],
    portals: [
      {
        id: "operations-to-hub",
        label: "Organization Floor",
        rect: { x: 8.4, y: 11.5, width: 1.2, height: 0.65 },
        targetSceneId: "hub",
        targetPosition: { x: 22.1, y: 9.25 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 18, height: 1 },
      { x: 0, y: 0, width: 1, height: 13 },
      { x: 17, y: 0, width: 1, height: 13 },
      { x: 0, y: 12, width: 8, height: 1 },
      { x: 10, y: 12, width: 8, height: 1 },
    ],
    props: [
      {
        id: "manager-table",
        description:
          "Stakeholder notes point to unclear handoffs and inconsistent manager follow-through.",
        position: { x: 2.8, y: 4.05 },
        size: { width: 3.4, height: 2.2 },
        sprite: officeSprite(336, 1392, 144, 96),
        collision: true,
      },
      {
        id: "ops-chair-cluster",
        position: { x: 3.45, y: 3.25 },
        size: { width: 2.4, height: 1.2 },
        sprite: officeSprite(0, 384, 144, 48),
      },
      {
        id: "ops-whiteboard",
        position: { x: 1.45, y: 1.55 },
        size: { width: 2.8, height: 1.45 },
        sprite: officeSprite(240, 336, 144, 48),
        collision: true,
        glow: true,
      },
      {
        id: "metric-board",
        description:
          "Ramp data shows the problem spikes after orientation, which suggests reinforcement and workflow gaps.",
        position: { x: 12.05, y: 3.15 },
        size: { width: 2.9, height: 2.35 },
        sprite: officeSprite(384, 1296, 96, 96),
        collision: true,
        glow: true,
      },
      {
        id: "ops-ticket-monitor",
        position: { x: 14.15, y: 2.25 },
        size: { width: 1.6, height: 1.35 },
        sprite: officeSprite(432, 576, 96, 96),
      },
      {
        id: "process-desk",
        description:
          "The process review desk shows access delays and too many handoffs before new hires can work confidently.",
        position: { x: 7.25, y: 7.65 },
        size: { width: 3.5, height: 2.25 },
        sprite: officeSprite(336, 1488, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "ops-handoff-cabinets",
        position: { x: 7.05, y: 6.35 },
        size: { width: 2.2, height: 1 },
        sprite: officeSprite(240, 480, 144, 48),
      },
      {
        id: "ops-support-printers",
        position: { x: 12.1, y: 8.1 },
        size: { width: 3.2, height: 1.2 },
        sprite: officeSprite(384, 2004, 192, 60),
        collision: true,
      },
      {
        id: "ops-reference-shelf",
        description:
          "Reference binders and job aids. This is the kind of support that belongs at the point of work.",
        position: { x: 1.65, y: 8.15 },
        size: { width: 2.55, height: 2.1 },
        sprite: officeSprite(288, 576, 144, 96),
        collision: true,
      },
      {
        id: "ops-floor-plant",
        position: { x: 15.45, y: 9.1 },
        size: { width: 1.05, height: 1.35 },
        sprite: officeSprite(288, 192),
      },
    ],
  },
  {
    id: "sales",
    name: "Sales Strategy Studio",
    subtitle: "Case: demo quality is not turning into pipeline",
    width: 18,
    height: 13,
    theme: "interior",
    floorSprite: tileSprites.salesFloor,
    tilePatches: [
      tilePatch("sales-briefing-rug", 3.1, 3.8, 4.2, 3, tileSprites.warmFloor),
      tilePatch("sales-crm-runway", 6.8, 8.1, 5.4, 1.8, tileSprites.warmFloor),
      tilePatch(
        "sales-coaching-corner",
        12.2,
        4.2,
        3.8,
        3.4,
        tileSprites.warmFloor,
      ),
      tilePatch("sales-demo-lane", 4.4, 6.4, 9.6, 1, tileSprites.warmFloor),
    ],
    portals: [
      {
        id: "sales-to-hub",
        label: "Organization Floor",
        rect: { x: 8.4, y: 11.5, width: 1.2, height: 0.65 },
        targetSceneId: "hub",
        targetPosition: { x: 7.6, y: 9.25 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 18, height: 1 },
      { x: 0, y: 0, width: 1, height: 13 },
      { x: 17, y: 0, width: 1, height: 13 },
      { x: 0, y: 12, width: 8, height: 1 },
      { x: 10, y: 12, width: 8, height: 1 },
    ],
    props: [
      {
        id: "deal-review-table",
        description:
          "Deal reviews show reps can demo features, but discovery notes rarely connect the demo to business pain.",
        position: { x: 3.25, y: 4.05 },
        size: { width: 3.4, height: 2.2 },
        sprite: officeSprite(672, 1392, 144, 96),
        collision: true,
      },
      {
        id: "sales-discovery-chairs",
        position: { x: 3.65, y: 3.1 },
        size: { width: 2.4, height: 1.2 },
        sprite: officeSprite(0, 336, 144, 48),
      },
      {
        id: "sales-demo-screens",
        position: { x: 1.25, y: 5.85 },
        size: { width: 2.55, height: 2.25 },
        sprite: officeSprite(288, 336, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "pipeline-board",
        description:
          "The board shows plenty of demos but weak next-step conversion. The issue is not activity volume.",
        position: { x: 12.25, y: 3.95 },
        size: { width: 3, height: 2.4 },
        sprite: officeSprite(672, 1296, 96, 96),
        collision: true,
        glow: true,
      },
      {
        id: "sales-value-monitor",
        position: { x: 13.95, y: 2.6 },
        size: { width: 1.7, height: 1.35 },
        sprite: officeSprite(432, 480, 96, 96),
      },
      {
        id: "call-coaching-station",
        description:
          "The coaching station points to inconsistent discovery prompts and limited manager reinforcement after training.",
        position: { x: 7.35, y: 7.65 },
        size: { width: 3.5, height: 2.25 },
        sprite: officeSprite(576, 1488, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "sales-rubric-cards",
        position: { x: 8.05, y: 6.6 },
        size: { width: 1.7, height: 1 },
        sprite: officeSprite(528, 480, 96, 48),
      },
      {
        id: "sales-coaching-tools",
        position: { x: 12.15, y: 8.05 },
        size: { width: 3.2, height: 1.2 },
        sprite: officeSprite(384, 2004, 192, 60),
        collision: true,
      },
      {
        id: "sales-call-library",
        description:
          "Recorded calls and manager notes. Sales enablement needs practice, coaching, and inspection, not only more slides.",
        position: { x: 1.8, y: 8.05 },
        size: { width: 2.5, height: 2.05 },
        sprite: officeSprite(576, 576, 144, 96),
        collision: true,
      },
      {
        id: "sales-floor-plant",
        position: { x: 15.5, y: 8.95 },
        size: { width: 1.05, height: 1.35 },
        sprite: officeSprite(288, 192),
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
    position: { x: 9, y: 4.65 },
    patrol: [
      { x: 9, y: 4.65 },
      { x: 10.35, y: 4.95 },
      { x: 10.1, y: 5.65 },
      { x: 8.25, y: 5.55 },
    ],
    sprite: { image: "ameliaIdle", sx: 0, sy: 0, sw: 16, sh: 32 },
    dialogue: {
      briefing: [
        "I need help. Leadership asked for more onboarding training because new hires are taking too long to ramp.",
        "That might be part of it, but slow ramp can also come from unclear workflow, late tool access, or managers reinforcing different expectations.",
        "Your job is to investigate before designing. Review the evidence, then decide whether training is actually the right fix.",
      ],
      investigate: [
        "Good. Read the interview note, process map, and performance metric in order.",
        "After each one, ask: what evidence helps explain the real work problem, and what tempting assumption should I avoid?",
      ],
      diagnose: [
        "Now make the call. If you built training tomorrow, what would still be broken?",
        "Use the full evidence pattern. The useful answer should explain all three evidence items, not just the loudest complaint.",
      ],
      design: [
        "Good diagnosis. Now choose the solution that fits the cause.",
        "A strong enablement solution changes the daily work, supports managers, and gives leaders a metric to watch.",
      ],
      complete: [
        "That is the difference between building a course and solving a performance problem.",
        "You earned the case summary. It shows the request, evidence, root cause, solution, and expected business impact.",
      ],
    },
  },
  {
    id: "sam",
    name: "Sam",
    role: "New Hire",
    sceneId: "hub",
    position: { x: 9.6, y: 11.15 },
    patrol: [
      { x: 9.6, y: 11.15 },
      { x: 11.1, y: 11.15 },
      { x: 11.1, y: 12.25 },
      { x: 9.6, y: 12.25 },
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
      complete: ["The new case summary makes the next step obvious."],
    },
  },
  {
    id: "leo",
    name: "Leo",
    role: "Sales Enablement Lead",
    sceneId: "sales",
    position: { x: 6.05, y: 5.45 },
    patrol: [
      { x: 6.05, y: 5.45 },
      { x: 7.45, y: 5.8 },
      { x: 9.7, y: 7.25 },
      { x: 11.5, y: 6.15 },
    ],
    sprite: { image: "bobIdle", sx: 0, sy: 0, sw: 16, sh: 32 },
    dialogue: {
      briefing: [
        "Sales leadership says reps need better demo training.",
        "Maybe. But demos are happening. The problem is that too few demos become real next steps.",
        "Review the evidence before deciding whether this is a training gap, coaching gap, message gap, or process gap.",
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
        "You earned the sales enablement case summary.",
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
    position: { x: 4.35, y: 6.2 },
    summary:
      "New hires say they receive multiple versions of the same onboarding instructions from different people.",
    insight:
      "The issue is not simply forgetting content. People are getting different expectations after the formal onboarding session.",
    signal:
      "Conflicting instructions point to workflow and manager reinforcement, not just a missing lesson.",
    trap: "Treat the leader's training request as proof that a longer course is the answer.",
    signalFeedback:
      "Good. Conflicting instructions mean the learner is not receiving one consistent operating path.",
    trapFeedback:
      "That would produce more content, but it would not stop different people from giving different directions.",
    ignoreFeedback:
      "This is not background; it tells you the issue continues after formal onboarding.",
    metric: "Survey confidence: 58%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "process-map",
    caseId: "onboarding",
    title: "Process Map",
    sceneId: "operations",
    position: { x: 6.6, y: 9.1 },
    summary:
      "The process map has three handoffs before tool access is confirmed.",
    insight:
      "A learner cannot perform the job confidently if the workflow delays access and ownership is unclear.",
    signal:
      "Multiple handoffs create delay. Training cannot fix ownership unless the workflow changes too.",
    trap: "Convert every missing handoff step into another onboarding lesson.",
    signalFeedback:
      "Good. The handoffs show a workflow ownership problem, not only a knowledge problem.",
    trapFeedback:
      "More lessons about every handoff would add complexity without clarifying who owns the work.",
    ignoreFeedback:
      "This cannot be ignored because delayed access blocks performance even when people understand the job.",
    metric: "Average access delay: 8 days",
    sprite: officeSprite(384, 384),
  },
  {
    id: "performance-metric",
    caseId: "onboarding",
    title: "Performance Metric",
    sceneId: "operations",
    position: { x: 13.55, y: 6.2 },
    summary:
      "Support tickets spike during weeks two and three, after formal orientation ends.",
    insight:
      "The support system is weakest when new hires start doing real work, after the course is already complete.",
    signal:
      "The spike happens after formal training, so the support system is failing when work actually begins.",
    trap: "Judge the course by completion rate instead of support tickets and time-to-productivity.",
    signalFeedback:
      "Good. The spike after orientation proves support is failing when real work begins.",
    trapFeedback:
      "Completion rates can look healthy while work performance still breaks after the course.",
    ignoreFeedback:
      "This metric is a business signal. It tells you where the enablement support must show up.",
    metric: "Tickets per cohort: +31%",
    sprite: officeSprite(432, 384),
  },
  {
    id: "demo-call-review",
    caseId: "sales",
    title: "Demo Call Review",
    sceneId: "sales",
    position: { x: 6.05, y: 6.35 },
    summary:
      "Reps describe product features clearly, but only 34% ask a second-layer discovery question before the demo.",
    insight:
      "The behavior gap is discovery depth and value framing, not basic product knowledge.",
    signal:
      "Reps can present the product; the weak behavior is connecting the demo to buyer pain.",
    trap: "Treat a feature-heavy demo as proof that product knowledge is the main gap.",
    signalFeedback:
      "Good. Reps can explain features, but they are not connecting the demo to buyer pain.",
    trapFeedback:
      "Product knowledge may sound like the easy fix, but the evidence says feature explanation is already clear.",
    ignoreFeedback:
      "This is not background; it identifies the specific sales behavior blocking conversion.",
    metric: "Discovery depth: 34%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "crm-stage-audit",
    caseId: "sales",
    title: "CRM Stage Audit",
    sceneId: "sales",
    position: { x: 6.25, y: 9.8 },
    summary:
      "Demo completion is high, but next-step conversion drops when business pain is missing from the opportunity notes.",
    insight:
      "The sales process needs a stronger qualification habit and clearer manager inspection points.",
    signal:
      "Pipeline quality is dropping after the demo, so the enablement answer needs revenue-behavior measurement.",
    trap: "Assume more demo activity will fix conversion without changing discovery behavior.",
    signalFeedback:
      "Good. Conversion drops when business pain is missing, so the fix needs a pipeline inspection habit.",
    trapFeedback:
      "More activity does not solve a quality problem if discovery behavior stays shallow.",
    ignoreFeedback:
      "This is a business outcome signal. It connects behavior to pipeline impact.",
    metric: "Demo-to-next-step: 41%",
    sprite: officeSprite(384, 384),
  },
  {
    id: "manager-coaching-note",
    caseId: "sales",
    title: "Manager Coaching Note",
    sceneId: "sales",
    position: { x: 13.45, y: 7.15 },
    summary:
      "Managers coach demos inconsistently because there is no shared rubric for value messaging.",
    insight:
      "Reinforcement is weak. A one-time workshop would fade without a coaching system.",
    signal:
      "Managers need a shared rubric so coaching happens consistently after the enablement event.",
    trap: "Send a one-time reminder and hope managers reinforce the behavior later.",
    signalFeedback:
      "Good. Without a shared rubric, managers cannot reinforce the new behavior consistently.",
    trapFeedback:
      "A reminder may create awareness, but it does not create manager coaching or accountability.",
    ignoreFeedback:
      "This evidence explains why a one-time enablement event would fade.",
    metric: "Coaching rubric use: 18%",
    sprite: officeSprite(432, 384),
  },
];

export const diagnosisOptions: DiagnosisOption[] = [
  {
    id: "more-elearning",
    caseId: "onboarding",
    label:
      "Improve orientation with clearer role examples and a stronger knowledge check.",
    explanation:
      "This is tempting because the leader asked for training and the course can probably be improved. It still treats the problem as a content gap while the evidence points to handoffs, access, and manager follow-up.",
    correct: false,
    consequence:
      "You would ship something visible, but new hires could still receive mixed instructions, wait on access, and need support after orientation ends.",
    evidenceHint:
      "The evidence shows conflicting instructions, delayed access, and week-two support tickets. None of those are solved by a knowledge check alone.",
    learningTakeaway:
      "Do not label a problem as training until the evidence shows people lack knowledge or skill.",
  },
  {
    id: "workflow-reinforcement",
    caseId: "onboarding",
    label: "Standardize the handoffs and give managers follow-up checkpoints.",
    explanation:
      "Correct. This explains the full pattern: inconsistent instructions, delayed access, and weak support after orientation.",
    correct: true,
    consequence:
      "The solution space opens beyond training: clarify ownership, reinforce manager behavior, and track ramp signals.",
    evidenceHint:
      "Interview notes, process handoffs, and week-two tickets all point to workflow plus reinforcement.",
    learningTakeaway:
      "A strong diagnosis explains the whole work system: process, manager behavior, tools, and follow-up.",
  },
  {
    id: "software-broken",
    caseId: "onboarding",
    label:
      "Escalate tool access as the main issue because new hires are blocked too long.",
    explanation:
      "This is a smart partial read because access delay is real. It fails as the main diagnosis because the evidence also shows mixed expectations and weak follow-up after access is granted.",
    correct: false,
    consequence:
      "You would improve one bottleneck, but managers could still give inconsistent expectations and new hires could still need help in weeks two and three.",
    evidenceHint:
      "Access delay matters, but it does not explain the conflicting instructions or the support-ticket spike by itself.",
    learningTakeaway:
      "A contributing factor is not always the root cause. Look for the pattern that explains the full case.",
  },
  {
    id: "sales-product-training",
    caseId: "sales",
    label:
      "Tighten demo certification so reps present the product more consistently.",
    explanation:
      "This sounds reasonable because the problem appears during demos. But the call review says reps already explain features clearly; the gap is discovery depth and value connection.",
    correct: false,
    consequence:
      "Reps might sound more polished, but shallow discovery and weak next-step conversion would likely remain.",
    evidenceHint:
      "Feature explanation is not the weak signal; discovery depth and next-step conversion are.",
    learningTakeaway:
      "Sales enablement should target the behavior that changes pipeline outcomes, not just product knowledge.",
  },
  {
    id: "sales-discovery-coaching",
    caseId: "sales",
    label:
      "Coach discovery habits and give managers a shared inspection rubric.",
    explanation:
      "Correct. This explains all three evidence items: shallow discovery, missing business pain in CRM notes, and inconsistent manager coaching.",
    correct: true,
    consequence:
      "The solution can target the revenue behavior itself: rep practice, manager coaching, and pipeline inspection.",
    evidenceHint:
      "The call review, CRM audit, and coaching note triangulate the same behavior gap.",
    learningTakeaway:
      "When multiple evidence items point to the same sales behavior, design for practice, coaching, and inspection.",
  },
  {
    id: "sales-more-activity",
    caseId: "sales",
    label: "Refresh the demo deck so reps tell a sharper value story.",
    explanation:
      "This is plausible because messaging can improve demos. It still misses the evidence that reps are not uncovering buyer pain before the story begins.",
    correct: false,
    consequence:
      "A better deck could support reps, but it would not create deeper discovery, manager coaching, or a pipeline inspection habit.",
    evidenceHint:
      "The pipeline signal points to behavior before and after the demo, not only the deck used during it.",
    learningTakeaway:
      "Content may support the solution, but it rarely replaces behavior change and manager reinforcement.",
  },
];

export const interventionOptions: InterventionOption[] = [
  {
    id: "training-module",
    caseId: "onboarding",
    label:
      "Publish a cleaner onboarding course and require completion by week one.",
    explanation:
      "This is easy to approve because it is familiar and trackable. It does not fix ownership, access timing, or manager follow-through.",
    correct: false,
    consequence:
      "Completion could rise while ramp time and week-two support tickets stay stubborn.",
    tradeoff:
      "Fast to ship, but it leaves managers and access handoffs untouched.",
    learningTakeaway:
      "A course is useful only when the root cause is knowledge or skill. This case needs work-system support.",
  },
  {
    id: "diagnostic-canvas",
    caseId: "onboarding",
    label: "Create a handoff checklist, manager job aid, and ramp dashboard.",
    explanation:
      "Correct. This supports the workflow, reinforces expectations, and creates visible measures leaders can inspect after launch.",
    correct: true,
    consequence:
      "Managers get a repeatable operating habit, new hires get clearer support, and leaders can inspect ramp health.",
    tradeoff:
      "Requires manager adoption, but it addresses workflow, reinforcement, and measurement together.",
    learningTakeaway:
      "The best enablement solution changes the workflow and gives leaders a signal they can inspect.",
  },
  {
    id: "announcement",
    caseId: "onboarding",
    label:
      "Send a leader-backed process update and ask teams to follow it immediately.",
    explanation:
      "Communication is useful, and leaders often reach for it first. But one announcement does not create a repeatable handoff or manager follow-up habit.",
    correct: false,
    consequence:
      "People may know the official process for a week, but old handoff habits can return quickly.",
    tradeoff:
      "Low effort, low behavior change. It does not create a new operating habit.",
    learningTakeaway:
      "Awareness is not adoption. Sustainable enablement needs reinforcement in the flow of work.",
  },
  {
    id: "sales-demo-certification",
    caseId: "sales",
    label:
      "Require reps to pass a stricter demo certification before advancing deals.",
    explanation:
      "Certification feels rigorous, but it mostly tests presentation. The evidence points to discovery and manager reinforcement before and after the demo.",
    correct: false,
    consequence:
      "Reps may pass a presentation test while still failing to uncover buyer pain before the demo.",
    tradeoff:
      "It measures presentation skill more than buyer diagnosis or pipeline behavior.",
    learningTakeaway:
      "Certification can validate a skill, but it should not distract from the behavior blocking revenue.",
  },
  {
    id: "sales-coaching-system",
    caseId: "sales",
    label:
      "Build a discovery guide, coaching rubric, and pipeline inspection dashboard.",
    explanation:
      "Correct. This changes pre-demo behavior, gives managers a coaching tool, and tracks conversion after the behavior should appear.",
    correct: true,
    consequence:
      "Reps practice the behavior that affects pipeline, managers coach from a shared rubric, and leaders see conversion signals.",
    tradeoff:
      "It takes coordination with sales leaders, but it connects enablement work to revenue behavior.",
    learningTakeaway:
      "Sales enablement is strongest when rep practice, manager coaching, and pipeline measurement reinforce each other.",
  },
  {
    id: "sales-slack-reminder",
    caseId: "sales",
    label:
      "Send weekly discovery tips and sample questions after every pipeline call.",
    explanation:
      "Tips can reinforce a habit, and they are cheap to send. Alone, they do not give reps practice, manager coaching, or measurement.",
    correct: false,
    consequence:
      "The team receives helpful reminders, but there is no reliable practice loop or manager accountability.",
    tradeoff: "Useful as a support tactic, weak as the core intervention.",
    learningTakeaway:
      "Tips can support behavior change, but they do not create practice, coaching, or accountability by themselves.",
  },
];

export const earnedCanvas: EarnedArtifact = {
  id: "enablement-diagnostic-canvas",
  title: "Enablement Diagnostic Case Summary",
  subtitle: "Case: New hire ramp is slower than expected",
  learnerDebrief: {
    headline: "What you practiced",
    points: [
      {
        label: "Diagnose",
        value:
          "You tested the training request against evidence from people, process, tools, and follow-up.",
      },
      {
        label: "Design",
        value:
          "You chose support that changes the work: checklist, job aid, handoff map, and dashboard.",
      },
      {
        label: "Measure",
        value:
          "You connected the fix to ramp time, support tickets, and confidence.",
      },
    ],
  },
  portfolioTakeaway:
    "This case summary shows the performance-consulting move: Terry did not accept the training request at face value. He traced the evidence to workflow, access, reinforcement, and measurement before choosing a solution.",
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
  title: "Sales Enablement Impact Case Summary",
  subtitle: "Case: Demo quality is not converting into next steps",
  learnerDebrief: {
    headline: "What you practiced",
    points: [
      {
        label: "Diagnose",
        value:
          "You separated product knowledge from the sales behavior blocking next steps.",
      },
      {
        label: "Design",
        value:
          "You chose a coaching system that supports reps before, during, and after demos.",
      },
      {
        label: "Measure",
        value:
          "You tied enablement work to conversion, rubric use, and discovery quality.",
      },
    ],
  },
  portfolioTakeaway:
    "This case summary shows the sales enablement move: Terry connects discovery behavior, manager coaching, and pipeline inspection to revenue outcomes instead of treating demo training as the default fix.",
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

export const initialPosition = { x: 9, y: 9.6 };
