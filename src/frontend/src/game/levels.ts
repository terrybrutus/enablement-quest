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
        targetPosition: { x: 15, y: 15.95 },
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
          "This is your case desk. Elena's Atlas Pro request is waiting: investigate before recommending more training.",
        position: { x: 3.2, y: 4.6 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(336, 1392, 144, 96),
        collision: true,
        glow: true,
      },
      {
        id: "analytics-wall",
        description:
          "The dashboard is waiting for the Atlas Pro evidence pattern. Good enablement work starts with facts, not course requests.",
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
          "The AI workbench can summarize evidence, but the diagnosis still has to be human-reviewed.",
        position: { x: 10.7, y: 4.1 },
        size: { width: 2.2, height: 2 },
        sprite: officeSprite(384, 1296, 96, 96),
        collision: true,
      },
      {
        id: "lab-server-stack",
        description:
          "The server rack stores case evidence. Claims are useful; evidence decides what to build.",
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
        targetPosition: { x: 9, y: 7.6 },
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
        label: "Sales Enablement Studio",
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
    name: "Sales Enablement Studio",
    subtitle: "Case: Atlas Pro win rate is below target",
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
    role: "Sales Operations Manager",
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
        "I can show you the Atlas Pro numbers, but the numbers alone will not tell you what to build.",
        "The win rate is below target. The messy part is figuring out whether the cause is knowledge, selling behavior, manager coaching, process, price, or some combination.",
        "Bring Leo's sales evidence here, then use the operations data to test the story.",
      ],
      investigate: [
        "The dashboard proves the business problem. The CRM notes show where the sales motion gets fuzzy.",
        "Do not let one metric do all the thinking. Use it with the call and coaching evidence.",
      ],
      diagnose: [
        "If your diagnosis cannot explain the deck, calls, CRM notes, and coaching archive, it is probably partial.",
        "Leaders need a cause they can act on, not just a number they can worry about.",
      ],
      design: [
        "A strong fix should show up in the data later.",
        "If the intervention changes discovery and coaching, we should be able to inspect better notes, better next steps, and eventually better win-rate movement.",
      ],
      complete: [
        "That is the difference between reporting a metric and using evidence to change the work.",
        "You earned a case summary that leaders can actually discuss.",
      ],
    },
  },
  {
    id: "sam",
    name: "Sam",
    role: "Senior Account Executive",
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
        "Atlas Pro is harder to sell than Atlas Core. The demo looks good, but the buyer conversation changes fast.",
        "Managers keep saying we need more training. Maybe. But I think we need to understand which part of the sales motion is actually breaking.",
      ],
      investigate: [
        "Customers ask smart questions. The harder part is finding the business reason they should care before we show the advanced features.",
      ],
      diagnose: [
        "If you only look at training attendance, you will miss what happens in live deals.",
      ],
      design: [
        "Give us practice, better discovery prompts, and coaching that managers can actually use after calls.",
      ],
      complete: ["That recommendation sounds like the real sales floor."],
    },
  },
  {
    id: "leo",
    name: "Leo",
    role: "Director of Sales Strategy",
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
        "Elena, our CRO, wants an initial recommendation on Atlas Pro by Friday.",
        "The first request was simple: schedule more product training. That might be too shallow.",
        "Start with the sales artifacts, then check the data with Maya. You need a recommendation leaders can defend.",
      ],
      investigate: [
        "Look for the pattern across the deck, discovery guide, calls, CRM data, and manager coaching.",
        "If one evidence item sounds obvious, do not stop there. A real diagnosis has to explain all the evidence.",
      ],
      diagnose: [
        "Now make the call. Is this a knowledge problem, a skill problem, a process problem, a coaching problem, or a mix?",
        "A strong answer separates what Enablement should own from what Sales leadership and Operations need to reinforce.",
      ],
      design: [
        "Good. Now choose the intervention system, not just the most familiar asset.",
        "The right fix should change rep behavior, manager coaching, and the metrics leaders inspect.",
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
    partial:
      "Add a short refresher lesson that tells new hires which checklist to use.",
    signalFeedback:
      "Good. Conflicting instructions mean the learner is not receiving one consistent operating path.",
    trapFeedback:
      "That would produce more content, but it would not stop different people from giving different directions.",
    partialFeedback:
      "That may help a little, but it does not solve the inconsistent follow-up from managers.",
    ignoreFeedback:
      "This is not background; it tells you the issue continues after formal onboarding.",
    supportKind: "Workflow / manager reinforcement",
    supportFeedback:
      "This evidence shows the work system is giving people inconsistent directions after training.",
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
    partial:
      "Create a visual process map so new hires can see each access step.",
    signalFeedback:
      "Good. The handoffs show a workflow ownership problem, not only a knowledge problem.",
    trapFeedback:
      "More lessons about every handoff would add complexity without clarifying who owns the work.",
    partialFeedback:
      "A process map helps, but it still needs clear ownership for the handoffs.",
    ignoreFeedback:
      "This cannot be ignored because delayed access blocks performance even when people understand the job.",
    supportKind: "Workflow / process",
    supportFeedback:
      "This evidence shows the handoff process blocks performance even if people understand the training.",
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
    partial: "Add a week-two knowledge check to see what new hires remember.",
    signalFeedback:
      "Good. The spike after orientation proves support is failing when real work begins.",
    trapFeedback:
      "Completion rates can look healthy while work performance still breaks after the course.",
    partialFeedback:
      "A check may reveal confusion, but the metric points to support during real work.",
    ignoreFeedback:
      "This metric is a business signal. It tells you where the enablement support must show up.",
    supportKind: "Business metric",
    supportFeedback:
      "This evidence proves the problem shows up in work outcomes after orientation.",
    metric: "Tickets per cohort: +31%",
    sprite: officeSprite(432, 384),
  },
  {
    id: "sales-deck-review",
    caseId: "sales",
    title: "Sales Deck Review",
    sceneId: "sales",
    position: { x: 3.55, y: 5.75 },
    summary:
      "The Atlas Pro deck explains analytics, automation, and executive reports, but most slides start with features instead of buyer pain.",
    insight:
      "The deck supports product explanation, but it does not help reps lead with the business reason a director or executive would fund the upgrade.",
    signal:
      "The sales material is feature-heavy, so reps need support connecting Atlas Pro to buyer priorities.",
    trap: "Treat the deck as the main fix because it is the artifact reps use during demos.",
    partial:
      "Rewrite the opening slides so the deck starts with business outcomes.",
    signalFeedback:
      "Good. This evidence points to weak business-value messaging, not simply missing product facts.",
    trapFeedback:
      "A better deck may help, but one artifact cannot explain the full win-rate problem by itself.",
    partialFeedback:
      "That is a useful support move, but the case still needs evidence about rep behavior and coaching.",
    ignoreFeedback:
      "This matters because the materials shape how reps frame the conversation.",
    supportKind: "Content / message quality",
    supportFeedback:
      "This evidence shows the sales material pushes features before buyer business value.",
    metric: "Feature-heavy deck",
    sprite: officeSprite(336, 288),
  },
  {
    id: "discovery-guide",
    caseId: "sales",
    title: "Discovery Guide",
    sceneId: "sales",
    position: { x: 2.35, y: 9.35 },
    summary:
      "The discovery guide asks about current tools, reporting needs, and technical fit, but it rarely asks about business impact or decision criteria.",
    insight:
      "Reps have questions to ask, but the questions do not reliably uncover the financial or executive reason to buy Atlas Pro.",
    signal:
      "Discovery support exists, but it does not push reps far enough into business pain and decision quality.",
    trap: "Treat the existence of a guide as proof that discovery is already covered.",
    partial:
      "Add two business-impact questions to the existing discovery guide.",
    signalFeedback:
      "Good. A resource can exist and still fail to support the behavior the deal requires.",
    trapFeedback:
      "Existing material is evidence, not proof that the behavior is happening well.",
    partialFeedback:
      "That may improve the guide, but the evidence does not yet prove reps will use it well.",
    ignoreFeedback:
      "This evidence helps explain why demos happen before the buying problem is clear.",
    supportKind: "Sales behavior support",
    supportFeedback:
      "This evidence shows the guide does not support the discovery behavior needed before a demo.",
    metric: "Business-impact prompts: limited",
    sprite: officeSprite(384, 384),
  },
  {
    id: "demo-call-review",
    caseId: "sales",
    title: "Call Review",
    sceneId: "sales",
    position: { x: 7.7, y: 8.95 },
    summary:
      "Reps answer product questions clearly, but only 34% ask a second-layer discovery question before moving into the demo.",
    insight:
      "The behavior gap is not basic product recall. The gap is diagnosing the buyer's problem deeply enough before presenting Atlas Pro.",
    signal:
      "Reps can explain features; the weak behavior is connecting the demo to buyer pain.",
    trap: "Treat a polished product demo as proof that reps are selling Atlas Pro effectively.",
    partial:
      "Give reps more examples of strong feature explanations for Atlas Pro.",
    signalFeedback:
      "Good. The call data shows a skill and behavior gap before the demo, not a simple product-knowledge gap.",
    trapFeedback:
      "A smooth demo can still miss the reason a buyer would fund a larger purchase.",
    partialFeedback:
      "More examples may polish the demo, but the evidence points to discovery depth first.",
    ignoreFeedback:
      "This is not background; it shows the behavior that may be blocking conversion.",
    supportKind: "Observed sales behavior",
    supportFeedback:
      "This evidence shows what reps actually do in calls, not what the training says they should do.",
    metric: "Second-layer discovery: 34%",
    sprite: officeSprite(432, 384),
  },
  {
    id: "win-rate-dashboard",
    caseId: "sales",
    title: "Operations Dashboard",
    sceneId: "operations",
    position: { x: 13.55, y: 6.2 },
    summary:
      "Atlas Pro expected a 30% win rate. In the last four weeks, 74 opportunities reached proposal, 13 closed won, 42 closed lost, and 19 remain open.",
    insight:
      "The business problem is real, but the aggregate win rate only proves underperformance. It does not explain the cause.",
    signal:
      "The performance signal is below target, but you need supporting evidence before prescribing training.",
    trap: "Use the low win rate as the primary reason to schedule a refresher training.",
    partial:
      "Compare trained and untrained reps before deciding whether training coverage matters.",
    signalFeedback:
      "Good. The dashboard proves the problem exists, but it does not diagnose why it exists.",
    trapFeedback:
      "A metric can trigger investigation; it should not automatically dictate the intervention.",
    partialFeedback:
      "That is a useful analysis step, but win rate still needs behavior and CRM evidence.",
    ignoreFeedback:
      "This is the business signal that makes the case worth solving.",
    supportKind: "Business metric",
    supportFeedback:
      "This evidence proves there is a measurable business problem, but not the cause by itself.",
    metric: "Closed-won: 23.6%",
    sprite: officeSprite(384, 384),
  },
  {
    id: "crm-loss-review",
    caseId: "sales",
    title: "CRM Loss Review",
    sceneId: "operations",
    position: { x: 8.85, y: 8.95 },
    summary:
      "Loss reasons are inconsistent: price, no decision, and competitor appear often, but notes with clear business pain convert better.",
    insight:
      "The data suggests qualification and manager inspection are uneven. Cleaner CRM habits can expose whether reps are creating real buying urgency.",
    signal:
      "Pipeline quality drops when business pain is missing from opportunity notes.",
    trap: "Treat price pressure as the primary explanation because it appears often in loss notes.",
    partial: "Ask managers to standardize how reps enter loss reasons in CRM.",
    signalFeedback:
      "Good. Price may matter, but the pattern also points to weak qualification and inspection.",
    trapFeedback:
      "Price is a tempting explanation, but it does not explain why pain-linked opportunities convert better.",
    partialFeedback:
      "Cleaner CRM entries help, but the evidence also points to discovery and manager inspection.",
    ignoreFeedback:
      "This is a key system signal because it connects behavior to deal outcomes.",
    supportKind: "Pipeline data quality",
    supportFeedback:
      "This evidence shows the deal records are too inconsistent to explain losses without better inspection.",
    metric: "Proposal loss reasons: mixed",
    sprite: officeSprite(336, 288),
  },
  {
    id: "manager-coaching-note",
    caseId: "sales",
    title: "Manager Coaching Archive",
    sceneId: "sales",
    position: { x: 13.45, y: 7.15 },
    summary:
      "Managers received a briefing, but coaching notes focus on forecast movement more than discovery quality, value messaging, or executive alignment.",
    insight:
      "Reinforcement is weak. Even strong training would fade if managers do not inspect and coach the target behavior.",
    signal:
      "Managers need a shared rubric so coaching happens consistently after enablement.",
    trap: "Run one manager workshop and rely on managers to apply it in future deal reviews.",
    partial:
      "Send managers a coaching checklist for their next pipeline meeting.",
    signalFeedback:
      "Good. Without a shared rubric, managers cannot reinforce the new behavior consistently.",
    trapFeedback:
      "A workshop may build awareness, but it does not create manager coaching or accountability.",
    partialFeedback:
      "A checklist helps, but the case still needs a shared rubric and inspection rhythm.",
    ignoreFeedback:
      "This evidence explains why a one-time enablement event would fade.",
    supportKind: "Manager reinforcement",
    supportFeedback:
      "This evidence shows managers are not consistently coaching the behavior after enablement.",
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
      "Atlas Pro is underperforming because reps need more product knowledge.",
    explanation:
      "This is tempting because leaders asked for training and Atlas Pro is more complex. But the call review shows reps can explain features; the bigger gap is business discovery and value connection.",
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
      "Atlas Pro is losing because discovery, business value, and manager coaching are not working together.",
    explanation:
      "Correct. This explains the full evidence pattern: feature-heavy materials, shallow discovery, weak pain notes, uneven CRM inspection, and inconsistent manager coaching.",
    correct: true,
    consequence:
      "The solution can target the revenue behavior itself: rep practice, manager coaching, and pipeline inspection.",
    evidenceHint:
      "The deck, guide, calls, dashboard, CRM notes, and coaching archive triangulate the same behavior gap.",
    learningTakeaway:
      "When multiple evidence items point to the same sales behavior, design for practice, coaching, and inspection.",
  },
  {
    id: "sales-more-activity",
    caseId: "sales",
    label:
      "Atlas Pro is losing because the demo deck needs a sharper value story.",
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
  {
    id: "sales-price-pressure",
    caseId: "sales",
    label:
      "Atlas Pro is losing mainly because the product is priced too high for the market.",
    explanation:
      "Price appears in the CRM, so this is a plausible business concern. It is still too narrow because pain-linked opportunities convert better and managers are not coaching the behavior consistently.",
    correct: false,
    consequence:
      "You would hand off the problem too early and miss the sales behaviors Enablement can influence.",
    evidenceHint:
      "The CRM data includes price, but the call review, discovery guide, and coaching archive point to controllable sales behavior.",
    learningTakeaway:
      "Enablement should name cross-functional factors without ignoring the behavior it can improve.",
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
      "Require every rep to retake Atlas Pro product training and pass demo certification.",
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
      "Build a discovery practice loop, value guide, coaching rubric, and pipeline inspection dashboard.",
    explanation:
      "Correct. This changes pre-demo discovery, improves how reps connect Atlas Pro to business value, gives managers a coaching tool, and tracks conversion after the behavior should appear.",
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
  {
    id: "sales-deck-only",
    caseId: "sales",
    label:
      "Redesign the Atlas Pro deck and ask reps to use the new version immediately.",
    explanation:
      "The deck should improve, but a deck-only fix does not create discovery practice, manager coaching, CRM inspection, or measurement.",
    correct: false,
    consequence:
      "Reps may have cleaner slides while the underlying qualification and coaching habits stay weak.",
    tradeoff:
      "Useful supporting artifact, but too narrow as the main intervention.",
    learningTakeaway:
      "A good artifact helps the system; it does not replace the system.",
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
  title: "Atlas Pro Enablement Case Summary",
  subtitle: "Case: Why sales are not closing",
  learnerDebrief: {
    headline: "What you practiced",
    points: [
      {
        label: "Diagnose",
        value:
          "You separated the training request from the actual performance pattern behind the win-rate gap.",
      },
      {
        label: "Design",
        value:
          "You chose a system of practice, business-value support, coaching, and inspection instead of a single content fix.",
      },
      {
        label: "Measure",
        value:
          "You tied enablement work to discovery quality, proposal conversion, manager coaching, and win-rate movement.",
      },
    ],
  },
  sections: [
    {
      label: "Business Problem",
      value:
        "Atlas Pro opportunities are reaching proposal, but completed deals are closing at about 23.6% instead of the expected 30%.",
    },
    {
      label: "Root Cause",
      value:
        "Reps can explain the product, but discovery is too shallow, the story is too feature-heavy, CRM inspection is uneven, and managers lack a shared coaching rubric.",
    },
    {
      label: "Intervention",
      value:
        "Discovery practice loop, value-framing guide, manager coaching rubric, call-review practice, and pipeline inspection dashboard.",
    },
    {
      label: "Accessibility / Inclusion",
      value:
        "Use plain-language prompts, accessible templates, role-play options, and clear examples for varied experience levels.",
    },
    {
      label: "Responsible AI Support",
      value:
        "Use AI to summarize call patterns, cluster CRM notes, and draft coaching prompts, with sales leader review before use.",
    },
    {
      label: "Expected Impact",
      value:
        "Proposal-stage win rate moves toward the 30% target; discovery quality improves; coaching rubric use increases; business-value notes become visible.",
    },
  ],
};

export const earnedArtifactsByCase = {
  onboarding: earnedCanvas,
  sales: salesCanvas,
} as const;

export const initialPosition = { x: 9, y: 7.6 };
