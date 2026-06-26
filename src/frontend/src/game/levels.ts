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

const buildingNameplates = {
  lab: "Learning Systems Lab",
  operations: "Operations Suite",
  sales: "Sales Strategy Studio",
} as const;

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
        targetPosition: { x: 20.5, y: 22.4 },
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
      },
      {
        id: "analytics-wall",
        description:
          "The dashboard is waiting for evidence. Good enablement work starts with facts, not course requests.",
        position: { x: 6.9, y: 1.35 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(48, 1488, 144, 96),
        collision: true,
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
          "The server rack stores case artifacts. Evidence matters more than assumptions.",
        position: { x: 4.1, y: 8.5 },
        size: { width: 1.5, height: 1.7 },
        sprite: officeSprite(0, 1152, 96, 96),
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
      tilePatch("center-plaza", 13.4, 8.2, 15.2, 6.7, tileSprites.plaza),
      tilePatch(
        "plaza-north-lawn",
        15.8,
        8.6,
        10.4,
        1.2,
        tileSprites.gardenGrass,
      ),
      tilePatch(
        "plaza-south-lawn",
        15.8,
        13.5,
        10.4,
        1,
        tileSprites.gardenGrass,
      ),
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
      tilePatch("plaza-hedge-north", 15.8, 8.2, 10.4, 0.6, tileSprites.hedge),
      tilePatch("plaza-hedge-south", 15.8, 14.1, 10.4, 0.6, tileSprites.hedge),
    ],
    portals: [
      {
        id: "hub-to-lab",
        label: "Learning Systems Lab",
        rect: { x: 20, y: 19.1, width: 2, height: 1.9 },
        targetSceneId: "lab",
        targetPosition: { x: 9, y: 10.6 },
      },
      {
        id: "hub-to-operations",
        label: "Operations Suite",
        rect: { x: 29.4, y: 5.7, width: 3.4, height: 2.3 },
        targetSceneId: "operations",
        targetPosition: { x: 9, y: 10.6 },
      },
      {
        id: "hub-to-sales",
        label: "Sales Strategy Studio",
        rect: { x: 6.4, y: 5.7, width: 3.4, height: 2.3 },
        targetSceneId: "sales",
        targetPosition: { x: 9, y: 10.6 },
      },
    ],
    blocks: [
      { x: 27.2, y: 1.2, width: 7.9, height: 4.5 },
      { x: 4, y: 1.2, width: 7.9, height: 4.5 },
      { x: 17.7, y: 15.3, width: 6.8, height: 3.9 },
      { x: 20, y: 9, width: 2, height: 2 },
    ],
    props: [
      {
        id: "sales-building",
        label: buildingNameplates.sales,
        position: { x: 3.8, y: 0.8 },
        size: { width: 8.2, height: 6.2 },
        sprite: officeExteriorSprite(640, 384, 288, 320),
        collision: true,
      },
      {
        id: "sales-door",
        position: { x: 7.08, y: 5.35 },
        size: { width: 1.45, height: 1.85 },
        sprite: officeExteriorSprite(608, 1024, 64, 96),
      },
      {
        id: "operations-building",
        label: buildingNameplates.operations,
        position: { x: 27, y: 0.8 },
        size: { width: 8.2, height: 6.2 },
        sprite: officeExteriorSprite(224, 384, 288, 320),
        collision: true,
      },
      {
        id: "operations-door",
        position: { x: 30.28, y: 5.35 },
        size: { width: 1.45, height: 1.85 },
        sprite: officeExteriorSprite(608, 1024, 64, 96),
      },
      {
        id: "lab-building",
        label: buildingNameplates.lab,
        position: { x: 17.6, y: 15.1 },
        size: { width: 6.8, height: 5.2 },
        sprite: gardenSprite(0, 3904, 704, 544),
        collision: true,
      },
      {
        id: "lab-door",
        position: { x: 19.9, y: 19.05 },
        size: { width: 2, height: 1.55 },
        sprite: gardenSprite(256, 4288, 160, 128),
      },
      {
        id: "hub-fountain",
        description:
          "Central plaza. Doorways lead to case rooms; glowing evidence appears inside active case areas.",
        position: { x: 19.45, y: 9.05 },
        size: { width: 2.9, height: 2.9 },
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
        id: "plaza-flower-left",
        position: { x: 16.2, y: 9.5 },
        size: { width: 1, height: 1 },
        sprite: gardenSprite(160, 1024),
      },
      {
        id: "plaza-flower-right",
        position: { x: 24.8, y: 9.5 },
        size: { width: 1, height: 1 },
        sprite: gardenSprite(224, 1024),
      },
      {
        id: "plaza-signpost",
        description:
          "Mission Plaza: talk to the case owner first, inspect evidence in order, then make the diagnostic call.",
        position: { x: 21.8, y: 12.1 },
        size: { width: 1.2, height: 1.4 },
        sprite: gardenSprite(512, 496, 64, 64),
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
    width: 18,
    height: 13,
    theme: "interior",
    floorSprite: tileSprites.warmFloor,
    tilePatches: [
      tilePatch("ops-interview-zone", 3.4, 5.8, 3.2, 2, tileSprites.labFloor),
      tilePatch("ops-process-zone", 7.4, 8.1, 3.8, 2.2, tileSprites.labFloor),
      tilePatch("ops-metric-zone", 12.3, 5.8, 3.2, 2, tileSprites.labFloor),
      tilePatch("ops-maya-zone", 7.4, 3.6, 3.4, 1.8, tileSprites.labFloor),
    ],
    portals: [
      {
        id: "operations-to-hub",
        label: "Organization Floor",
        rect: { x: 8, y: 11.15, width: 2, height: 1.6 },
        targetSceneId: "hub",
        targetPosition: { x: 31.5, y: 8.7 },
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
        position: { x: 3.2, y: 4.6 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(336, 1392, 144, 96),
        collision: true,
      },
      {
        id: "metric-board",
        description:
          "Ramp data shows the problem spikes after orientation, which suggests reinforcement and workflow gaps.",
        position: { x: 12.2, y: 3.8 },
        size: { width: 2.2, height: 2 },
        sprite: officeSprite(384, 1296, 96, 96),
        collision: true,
      },
      {
        id: "process-desk",
        description:
          "The process review desk shows access delays and too many handoffs before new hires can work confidently.",
        position: { x: 7.5, y: 8.1 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(336, 1488, 144, 96),
        collision: true,
      },
      {
        id: "office-plant",
        position: { x: 14.9, y: 8.8 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
      {
        id: "ops-file-cabinet",
        description:
          "A case file cabinet. The strongest recommendation should cite evidence, not preference.",
        position: { x: 2.2, y: 8.7 },
        size: { width: 1.1, height: 1.4 },
        sprite: officeSprite(432, 240),
        collision: true,
      },
      {
        id: "ops-review-chair",
        position: { x: 12.2, y: 8.5 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(48, 384),
        collision: true,
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
      tilePatch("sales-call-zone", 3.4, 5.8, 3.2, 2, tileSprites.warmFloor),
      tilePatch("sales-crm-zone", 7.4, 8.1, 3.8, 2.2, tileSprites.warmFloor),
      tilePatch("sales-coach-zone", 12.3, 5.8, 3.2, 2, tileSprites.warmFloor),
      tilePatch("sales-leo-zone", 7.4, 3.6, 3.4, 1.8, tileSprites.warmFloor),
    ],
    portals: [
      {
        id: "sales-to-hub",
        label: "Organization Floor",
        rect: { x: 8, y: 11.15, width: 2, height: 1.6 },
        targetSceneId: "hub",
        targetPosition: { x: 8, y: 8.7 },
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
        position: { x: 3.2, y: 4.6 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(672, 1392, 144, 96),
        collision: true,
      },
      {
        id: "pipeline-board",
        description:
          "The board shows plenty of demos but weak next-step conversion. The issue is not activity volume.",
        position: { x: 12.2, y: 3.8 },
        size: { width: 2.2, height: 2 },
        sprite: officeSprite(672, 1296, 96, 96),
        collision: true,
      },
      {
        id: "call-coaching-station",
        description:
          "The coaching station points to inconsistent discovery prompts and limited manager reinforcement after training.",
        position: { x: 7.5, y: 8.1 },
        size: { width: 3, height: 2 },
        sprite: officeSprite(576, 1488, 144, 96),
        collision: true,
      },
      {
        id: "sales-plant",
        position: { x: 14.9, y: 8.8 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 192),
        collision: true,
      },
      {
        id: "sales-whiteboard",
        description:
          "A value-message board. Sales enablement should change selling behavior, not just publish messaging.",
        position: { x: 2.2, y: 8.5 },
        size: { width: 2, height: 1.3 },
        sprite: officeSprite(336, 528, 96, 96),
        collision: true,
      },
      {
        id: "sales-coaching-chair",
        position: { x: 12.2, y: 8.5 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(0, 384),
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
    position: { x: 9, y: 5.2 },
    patrol: [
      { x: 9, y: 5.2 },
      { x: 10.6, y: 5.4 },
      { x: 10.4, y: 7 },
      { x: 8.2, y: 7 },
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
    position: { x: 9, y: 5.2 },
    patrol: [
      { x: 9, y: 5.2 },
      { x: 7.6, y: 6.4 },
      { x: 9.1, y: 7.2 },
      { x: 10.8, y: 6.3 },
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
    position: { x: 4.55, y: 6.65 },
    summary:
      "New hires say they receive multiple versions of the same onboarding instructions.",
    insight:
      "Evidence points to unclear expectations and inconsistent manager reinforcement.",
    signal:
      "This is a workflow and reinforcement signal, not proof that people forgot the orientation content.",
    trap: "Treat the leadership training request as proof that a longer course is the answer.",
    metric: "Survey confidence: 58%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "process-map",
    caseId: "onboarding",
    title: "Process Map",
    sceneId: "operations",
    position: { x: 8.85, y: 9.1 },
    summary:
      "The process map has three handoffs before tool access is confirmed.",
    insight:
      "The ramp problem is partly workflow friction, not just missing knowledge.",
    signal:
      "Multiple handoffs create delay. A course cannot fix ownership unless the workflow changes too.",
    trap: "Convert every missing handoff step into another onboarding lesson.",
    metric: "Average access delay: 8 days",
    sprite: officeSprite(384, 384),
  },
  {
    id: "performance-metric",
    caseId: "onboarding",
    title: "Performance Metric",
    sceneId: "operations",
    position: { x: 13.55, y: 6.65 },
    summary:
      "Support tickets spike during weeks two and three, after formal orientation ends.",
    insight:
      "The system needs reinforcement and job support at the point of work.",
    signal:
      "The spike happens after formal training, so the support system is failing when work actually begins.",
    trap: "Judge the course by completion rate instead of support tickets and time-to-productivity.",
    metric: "Tickets per cohort: +31%",
    sprite: officeSprite(432, 384),
  },
  {
    id: "demo-call-review",
    caseId: "sales",
    title: "Demo Call Review",
    sceneId: "sales",
    position: { x: 4.55, y: 6.65 },
    summary:
      "Reps describe product features clearly, but only 34% ask a second-layer discovery question before the demo.",
    insight:
      "The behavior gap is discovery depth and value framing, not basic product knowledge.",
    signal:
      "Reps can present the product; the weak behavior is connecting the demo to buyer pain.",
    trap: "Treat a feature-heavy demo as proof that product knowledge is the main gap.",
    metric: "Discovery depth: 34%",
    sprite: officeSprite(336, 288),
  },
  {
    id: "crm-stage-audit",
    caseId: "sales",
    title: "CRM Stage Audit",
    sceneId: "sales",
    position: { x: 8.85, y: 9.1 },
    summary:
      "Demo completion is high, but next-step conversion drops when business pain is missing from the opportunity notes.",
    insight:
      "The sales process needs a stronger qualification habit and clearer manager inspection points.",
    signal:
      "Pipeline quality is dropping after the demo, so the enablement answer needs revenue-behavior measurement.",
    trap: "Assume more demo activity will fix conversion without changing discovery behavior.",
    metric: "Demo-to-next-step: 41%",
    sprite: officeSprite(384, 384),
  },
  {
    id: "manager-coaching-note",
    caseId: "sales",
    title: "Manager Coaching Note",
    sceneId: "sales",
    position: { x: 13.55, y: 6.65 },
    summary:
      "Managers coach demos inconsistently because there is no shared rubric for value messaging.",
    insight:
      "Reinforcement is weak. A one-time workshop would fade without a coaching system.",
    signal:
      "Managers need a shared rubric so coaching happens consistently after the enablement event.",
    trap: "Send a one-time reminder and hope managers reinforce the behavior later.",
    metric: "Coaching rubric use: 18%",
    sprite: officeSprite(432, 384),
  },
];

export const diagnosisOptions: DiagnosisOption[] = [
  {
    id: "more-elearning",
    caseId: "onboarding",
    label: "New hires need a clearer orientation course with tool screenshots.",
    explanation:
      "This is plausible, but it treats the symptoms as a knowledge gap and ignores handoffs, manager reinforcement, and access delays.",
    correct: false,
    evidenceHint:
      "The evidence shows conflicting instructions and access delays, not missing orientation content.",
  },
  {
    id: "workflow-reinforcement",
    caseId: "onboarding",
    label:
      "The workflow is unclear and managers lack reinforcement checkpoints.",
    explanation:
      "Correct. The evidence shows inconsistent instructions, delayed access, and a gap after orientation.",
    correct: true,
    evidenceHint:
      "Interview notes, process handoffs, and week-two tickets all point to workflow plus reinforcement.",
  },
  {
    id: "software-broken",
    caseId: "onboarding",
    label: "The access system is the main blocker.",
    explanation:
      "Tool access is part of the problem, but the evidence does not support software failure as the root cause.",
    correct: false,
    evidenceHint:
      "Access delay matters, but nothing says the tool itself fails after access is granted.",
  },
  {
    id: "sales-product-training",
    caseId: "sales",
    label: "Reps need a stricter product-demo certification.",
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
    label: "Marketing should rewrite the demo deck before enablement acts.",
    explanation:
      "Message clarity may help, but the evidence points to discovery behavior and manager coaching, not just deck content.",
    correct: false,
    evidenceHint:
      "The pipeline signal points to behavior before and after the demo, not a standalone content refresh.",
  },
];

export const interventionOptions: InterventionOption[] = [
  {
    id: "training-module",
    caseId: "onboarding",
    label: "Build a cleaner onboarding course and add a knowledge check.",
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
    label: "Ask leaders to announce the correct process once.",
    explanation:
      "Communication helps awareness, but one message will not sustain a changed onboarding behavior.",
    correct: false,
    tradeoff:
      "Low effort, low behavior change. It does not create a new operating habit.",
  },
  {
    id: "sales-demo-certification",
    caseId: "sales",
    label: "Require a stricter demo certification for every rep.",
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
    label: "Send weekly discovery tips and sample questions.",
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

export const initialPosition = { x: 9, y: 10.6 };
