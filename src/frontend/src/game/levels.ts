import type { Decoration, Npc, Quest, Waypoint, Zone } from "./types";

export const zones: Zone[] = [
  {
    id: 1,
    name: "The Lab",
    width: 20,
    height: 15,
    tiles: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    portals: [
      {
        x: 18,
        y: 13,
        targetZoneId: 2,
        targetX: 1,
        targetY: 7,
        label: "To The Commons",
      },
    ],
    decorations: [
      { x: 3, y: 3, type: "desk" },
      { x: 4, y: 3, type: "desk" },
      { x: 3, y: 4, type: "terminal" },
      { x: 8, y: 2, type: "whiteboard" },
      { x: 12, y: 5, type: "bookshelf" },
      { x: 15, y: 8, type: "plant" },
      { x: 6, y: 10, type: "couch" },
      { x: 7, y: 10, type: "couch" },
    ],
  },
  {
    id: 2,
    name: "The Commons",
    width: 24,
    height: 16,
    tiles: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    portals: [
      {
        x: 0,
        y: 7,
        targetZoneId: 1,
        targetX: 17,
        targetY: 13,
        label: "To The Lab",
      },
    ],
    decorations: [
      { x: 5, y: 4, type: "desk" },
      { x: 6, y: 4, type: "desk" },
      { x: 10, y: 3, type: "whiteboard" },
      { x: 15, y: 5, type: "plant" },
      { x: 18, y: 10, type: "bookshelf" },
      { x: 8, y: 12, type: "couch" },
      { x: 9, y: 12, type: "couch" },
      { x: 20, y: 3, type: "terminal" },
    ],
  },
];

export const npcs: Npc[] = [
  {
    id: 1,
    name: "Maya Chen",
    position: { x: 12, y: 8 },
    zoneId: 2,
    dialogue: [
      "Welcome to The Commons! I'm Maya, the Learning Architect here.",
      "I've been mapping how new hires navigate our onboarding process.",
      "There are three critical pain points I've identified — would you help me observe them?",
      "Walk to each glowing marker and interact with them to document the issues.",
      "Once you've observed all three, come back and I'll reward you with something special!",
    ],
    questId: 1,
    color: "#f59e0b",
  },
];

export const waypoints: Waypoint[] = [
  {
    id: 1,
    position: { x: 5, y: 6 },
    zoneId: 2,
    waypointLabel: "Confusing Documentation",
    observed: false,
  },
  {
    id: 2,
    position: { x: 18, y: 5 },
    zoneId: 2,
    waypointLabel: "Tool Access Delays",
    observed: false,
  },
  {
    id: 3,
    position: { x: 14, y: 12 },
    zoneId: 2,
    waypointLabel: "Unclear Role Expectations",
    observed: false,
  },
];

export const quests: Quest[] = [
  {
    id: 1,
    title: "Map the Onboarding Flow",
    description:
      "Maya Chen has identified three pain points in the onboarding process. Visit each marked location in The Commons to observe and document the issues.",
    giverNpcId: 1,
    zoneId: 2,
    status: "notStarted",
    requiredWaypoints: [1, 2, 3],
    observedWaypoints: [],
  },
];

export const initialPlayerPosition = { x: 10, y: 7 };
