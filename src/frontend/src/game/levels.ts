import type {
  DiagnosisOption,
  EarnedArtifact,
  Evidence,
  GameCharacter,
  InterventionOption,
  Scene,
  SheetSprite,
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

export const assetUrls = {
  adamIdle: "/assets/limezu/adam-idle.png",
  adamRun: "/assets/limezu/adam-run.png",
  ameliaIdle: "/assets/limezu/amelia-idle.png",
  bobIdle: "/assets/limezu/bob-idle.png",
  roomBuilder: "/assets/limezu/room-builder-48.png",
  office: "/assets/limezu/office-48.png",
  exteriorFloors: "/assets/limezu/exterior-floors.png",
  fountain: "/assets/limezu/fountains.png",
  streetLamp: "/assets/limezu/street-lamp.png",
} as const;

export const tileSprites = {
  labFloor: { image: "roomBuilder", sx: 528, sy: 528, sw: 48, sh: 48 },
  warmFloor: { image: "roomBuilder", sx: 576, sy: 528, sw: 48, sh: 48 },
  wall: { image: "roomBuilder", sx: 240, sy: 0, sw: 48, sh: 48 },
  grass: { image: "exteriorFloors", sx: 192, sy: 0, sw: 48, sh: 48 },
  path: { image: "exteriorFloors", sx: 0, sy: 0, sw: 48, sh: 48 },
  plaza: { image: "exteriorFloors", sx: 288, sy: 96, sw: 48, sh: 48 },
} as const;

export const scenes: Scene[] = [
  {
    id: "lab",
    name: "Learning Systems Lab",
    subtitle: "Base camp for the diagnostic mission",
    width: 42,
    height: 18,
    theme: "interior",
    portals: [
      {
        id: "lab-to-hub",
        label: "Organization Floor",
        rect: { x: 20, y: 16.2, width: 2, height: 1.8 },
        targetSceneId: "hub",
        targetPosition: { x: 20.5, y: 21.4 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 42, height: 1 },
      { x: 0, y: 0, width: 1, height: 18 },
      { x: 41, y: 0, width: 1, height: 18 },
      { x: 0, y: 17, width: 20, height: 1 },
      { x: 22, y: 17, width: 20, height: 1 },
      { x: 3, y: 3, width: 3, height: 2 },
      { x: 12, y: 2, width: 4, height: 2 },
    ],
    props: [
      {
        id: "mission-desk",
        description:
          "This is your case desk. The current case asks whether slow onboarding is really a training problem.",
        position: { x: 3.2, y: 3.2 },
        size: { width: 2.2, height: 1.25 },
        sprite: officeSprite(336, 1344, 96, 96),
        collision: true,
      },
      {
        id: "analytics-wall",
        description:
          "The dashboard is waiting for evidence. Good enablement work starts with facts, not course requests.",
        position: { x: 12.5, y: 2 },
        size: { width: 2.5, height: 1.5 },
        sprite: officeSprite(384, 432, 144, 96),
        collision: true,
      },
      {
        id: "plant-lab",
        position: { x: 16.5, y: 8.5 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 288),
        collision: true,
      },
      {
        id: "lab-console",
        description:
          "The AI workbench can help draft and summarize, but the diagnosis still has to be human-reviewed.",
        position: { x: 6.5, y: 8.5 },
        size: { width: 2.2, height: 1.4 },
        sprite: officeSprite(528, 192, 144, 96),
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
    portals: [
      {
        id: "hub-to-lab",
        label: "Learning Systems Lab",
        rect: { x: 20, y: 19.2, width: 2, height: 1.8 },
        targetSceneId: "lab",
        targetPosition: { x: 21, y: 15.7 },
      },
      {
        id: "hub-to-operations",
        label: "Operations Suite",
        rect: { x: 30, y: 5.2, width: 2, height: 1.8 },
        targetSceneId: "operations",
        targetPosition: { x: 21, y: 15 },
      },
    ],
    blocks: [
      { x: 29, y: 3, width: 4, height: 4 },
      { x: 19, y: 17, width: 4, height: 4 },
      { x: 20, y: 9, width: 2, height: 2 },
    ],
    props: [
      {
        id: "operations-building",
        label: "Operations Suite",
        position: { x: 29, y: 3 },
        size: { width: 4, height: 4 },
        sprite: officeSprite(528, 0, 192, 192),
        collision: true,
      },
      {
        id: "lab-building",
        label: "Learning Systems Lab",
        position: { x: 19, y: 17 },
        size: { width: 4, height: 4 },
        sprite: officeSprite(0, 0, 192, 192),
        collision: true,
      },
      {
        id: "hub-fountain",
        description:
          "Central plaza. Doorways lead to case rooms; glowing evidence appears inside active case areas.",
        position: { x: 20.1, y: 9.1 },
        size: { width: 1.8, height: 1.8 },
        sprite: { image: "fountain", sx: 0, sy: 0, sw: 96, sh: 96 },
        collision: true,
      },
      {
        id: "lamp-a",
        position: { x: 16.5, y: 10.2 },
        size: { width: 0.8, height: 1.5 },
        sprite: { image: "streetLamp", sx: 0, sy: 0, sw: 48, sh: 96 },
      },
      {
        id: "lamp-b",
        position: { x: 25, y: 10.2 },
        size: { width: 0.8, height: 1.5 },
        sprite: { image: "streetLamp", sx: 0, sy: 0, sw: 48, sh: 96 },
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Suite",
    subtitle: "Case: new hires are taking too long to ramp",
    width: 42,
    height: 18,
    theme: "interior",
    portals: [
      {
        id: "operations-to-hub",
        label: "Organization Floor",
        rect: { x: 20, y: 16.2, width: 2, height: 1.8 },
        targetSceneId: "hub",
        targetPosition: { x: 31.5, y: 7.2 },
      },
    ],
    blocks: [
      { x: 0, y: 0, width: 42, height: 1 },
      { x: 0, y: 0, width: 1, height: 18 },
      { x: 41, y: 0, width: 1, height: 18 },
      { x: 0, y: 17, width: 20, height: 1 },
      { x: 22, y: 17, width: 20, height: 1 },
      { x: 3, y: 3, width: 4, height: 2 },
      { x: 14, y: 3, width: 4, height: 2 },
      { x: 9, y: 8, width: 4, height: 2 },
    ],
    props: [
      {
        id: "manager-table",
        description:
          "Stakeholder notes point to unclear handoffs and inconsistent manager follow-through.",
        position: { x: 3.2, y: 3.1 },
        size: { width: 3.2, height: 1.4 },
        sprite: officeSprite(336, 1344, 144, 96),
        collision: true,
      },
      {
        id: "metric-board",
        description:
          "Ramp data shows the problem spikes after orientation, which suggests reinforcement and workflow gaps.",
        position: { x: 14.2, y: 3.1 },
        size: { width: 3.2, height: 1.4 },
        sprite: officeSprite(384, 432, 144, 96),
        collision: true,
      },
      {
        id: "process-desk",
        description:
          "The process review desk shows access delays and too many handoffs before new hires can work confidently.",
        position: { x: 9.4, y: 8.1 },
        size: { width: 3, height: 1.4 },
        sprite: officeSprite(528, 192, 144, 96),
        collision: true,
      },
      {
        id: "office-plant",
        position: { x: 18.5, y: 10.5 },
        size: { width: 1, height: 1 },
        sprite: officeSprite(288, 288),
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
    position: { x: 10.5, y: 6.3 },
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
];

export const evidenceItems: Evidence[] = [
  {
    id: "interview-note",
    title: "Interview Note",
    sceneId: "operations",
    position: { x: 4.4, y: 6.4 },
    summary:
      "New hires say they receive multiple versions of the same onboarding instructions.",
    insight:
      "Evidence points to unclear expectations and inconsistent manager reinforcement.",
    metric: "Survey confidence: 58%",
    sprite: officeSprite(576, 384, 48, 48),
  },
  {
    id: "process-map",
    title: "Process Map",
    sceneId: "operations",
    position: { x: 10.5, y: 11 },
    summary:
      "The process map has three handoffs before tool access is confirmed.",
    insight:
      "The ramp problem is partly workflow friction, not just missing knowledge.",
    metric: "Average access delay: 8 days",
    sprite: officeSprite(384, 384, 96, 48),
  },
  {
    id: "performance-metric",
    title: "Performance Metric",
    sceneId: "operations",
    position: { x: 16.3, y: 6.5 },
    summary:
      "Support tickets spike during weeks two and three, after formal orientation ends.",
    insight:
      "The system needs reinforcement and job support at the point of work.",
    metric: "Tickets per cohort: +31%",
    sprite: officeSprite(480, 384, 96, 48),
  },
];

export const diagnosisOptions: DiagnosisOption[] = [
  {
    id: "more-elearning",
    label: "New hires need more eLearning.",
    explanation:
      "This treats every symptom as a knowledge gap and ignores handoffs, manager reinforcement, and tool access delays.",
    correct: false,
  },
  {
    id: "workflow-reinforcement",
    label: "The main issue is an unclear workflow with weak reinforcement.",
    explanation:
      "Correct. The evidence shows inconsistent instructions, delayed access, and a gap after orientation.",
    correct: true,
  },
  {
    id: "software-broken",
    label: "The software is broken.",
    explanation:
      "Tool access is part of the problem, but the evidence does not support software failure as the root cause.",
    correct: false,
  },
];

export const interventionOptions: InterventionOption[] = [
  {
    id: "training-module",
    label: "Build a longer training module.",
    explanation:
      "A longer module adds content, but it does not fix ownership, timing, or manager follow-through.",
    correct: false,
  },
  {
    id: "diagnostic-canvas",
    label: "Create a manager checklist, job aid, and diagnostic dashboard.",
    explanation:
      "Correct. This supports the workflow, reinforces expectations, and creates measurable visibility.",
    correct: true,
  },
  {
    id: "announcement",
    label: "Send a one-time announcement.",
    explanation:
      "Communication helps awareness, but one message will not sustain a changed onboarding behavior.",
    correct: false,
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

export const initialPosition = { x: 20.5, y: 15.2 };
