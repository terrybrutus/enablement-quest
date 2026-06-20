import type { backendInterface } from "../backend";
import { QuestStatus } from "../backend";

export const mockBackend: backendInterface = {
  __artifacts: async () => [],
  __npcs: async () => [],
  __playerStates: async () => [],
  __quests: async () => [],
  __waypoints: async () => [],
  __zones: async () => [],
  completeQuest: async () => ({
    id: BigInt(1),
    title: "Onboarding Flow Mastery",
    description: "A comprehensive guide to optimizing new-hire onboarding.",
    earnedAt: BigInt(Date.now()),
  }),
  getArtifactsForPlayer: async () => [
    {
      id: BigInt(1),
      title: "Onboarding Flow Mastery",
      description: "A comprehensive guide to optimizing new-hire onboarding.",
      earnedAt: BigInt(Date.now()),
    },
  ],
  getNpc: async () => ({
    id: BigInt(1),
    name: "Maya Chen",
    dialogue: [
      "Welcome to The Commons! I'm Maya, the Learning Architect here.",
      "I've been mapping how new hires navigate our onboarding process.",
      "There are three critical pain points I've identified — would you help me observe them?",
      "Walk to each glowing marker and interact with them to document the issues.",
      "Once you've observed all three, come back and I'll reward you with something special!",
    ],
    position: { x: BigInt(12 * 48 + 24), y: BigInt(8 * 48 + 24) },
    zoneId: BigInt(2),
  }),
  getNpcsInZone: async (zoneId) => {
    if (zoneId === BigInt(2)) {
      return [
        {
          id: BigInt(1),
          name: "Maya Chen",
          dialogue: [
            "Welcome to The Commons! I'm Maya, the Learning Architect here.",
            "I've been mapping how new hires navigate our onboarding process.",
            "There are three critical pain points I've identified — would you help me observe them?",
            "Walk to each glowing marker and interact with them to document the issues.",
            "Once you've observed all three, come back and I'll reward you with something special!",
          ],
          position: { x: BigInt(12 * 48 + 24), y: BigInt(8 * 48 + 24) },
          zoneId: BigInt(2),
        },
      ];
    }
    return [];
  },
  getPlayerState: async () => ({
    principal: { toText: () => "mock" } as any,
    activeQuests: [],
    artifacts: [],
    completedQuestIds: [],
    position: { x: BigInt(10 * 48 + 24), y: BigInt(7 * 48 + 24) },
    currentZoneId: BigInt(1),
  }),
  getQuest: async () => ({
    id: BigInt(1),
    status: QuestStatus.notStarted,
    title: "Map the Onboarding Flow",
    observedWaypoints: [],
    description:
      "Maya Chen has identified three pain points in the onboarding process. Visit each marked location in The Commons to observe and document the issues.",
    giverNpcId: BigInt(1),
    zoneId: BigInt(2),
    requiredWaypoints: [BigInt(1), BigInt(2), BigInt(3)],
  }),
  getQuestsForPlayer: async () => [
    {
      id: BigInt(1),
    status: QuestStatus.notStarted,
      title: "Map the Onboarding Flow",
      observedWaypoints: [],
      description:
        "Maya Chen has identified three pain points in the onboarding process. Visit each marked location in The Commons to observe and document the issues.",
      giverNpcId: BigInt(1),
      zoneId: BigInt(2),
      requiredWaypoints: [BigInt(1), BigInt(2), BigInt(3)],
    },
  ],
  getWaypointsInZone: async (zoneId) => {
    if (zoneId === BigInt(2)) {
      return [
        {
          id: BigInt(1),
          observed: false,
          waypointLabel: "Confusing Documentation",
          position: { x: BigInt(5 * 48 + 24), y: BigInt(6 * 48 + 24) },
          zoneId: BigInt(2),
        },
        {
          id: BigInt(2),
          observed: false,
          waypointLabel: "Tool Access Delays",
          position: { x: BigInt(18 * 48 + 24), y: BigInt(5 * 48 + 24) },
          zoneId: BigInt(2),
        },
        {
          id: BigInt(3),
          observed: false,
          waypointLabel: "Unclear Role Expectations",
          position: { x: BigInt(14 * 48 + 24), y: BigInt(12 * 48 + 24) },
          zoneId: BigInt(2),
        },
      ];
    }
    return [];
  },
  getZone: async (id) => {
    if (id === BigInt(1)) {
      return {
        id: BigInt(1),
        height: BigInt(15),
        name: "The Lab",
        width: BigInt(20),
      };
    }
    if (id === BigInt(2)) {
      return {
        id: BigInt(2),
        height: BigInt(16),
        name: "The Commons",
        width: BigInt(24),
      };
    }
    return null;
  },
  getZones: async () => [
    {
      id: BigInt(1),
      height: BigInt(15),
      name: "The Lab",
      width: BigInt(20),
    },
    {
      id: BigInt(2),
      height: BigInt(16),
      name: "The Commons",
      width: BigInt(24),
    },
  ],
  initPlayerState: async () => ({
    principal: { toText: () => "mock" } as any,
    activeQuests: [],
    artifacts: [],
    completedQuestIds: [],
    position: { x: BigInt(10 * 48 + 24), y: BigInt(7 * 48 + 24) },
    currentZoneId: BigInt(1),
  }),
  observeWaypoint: async () => ({
    id: BigInt(1),
    status: QuestStatus.inProgress,
    title: "Map the Onboarding Flow",
    observedWaypoints: [BigInt(1)],
    description:
      "Maya Chen has identified three pain points in the onboarding process. Visit each marked location in The Commons to observe and document the issues.",
    giverNpcId: BigInt(1),
    zoneId: BigInt(2),
    requiredWaypoints: [BigInt(1), BigInt(2), BigInt(3)],
  }),
  startQuest: async () => ({
    id: BigInt(1),
    status: QuestStatus.inProgress,
    title: "Map the Onboarding Flow",
    observedWaypoints: [],
    description:
      "Maya Chen has identified three pain points in the onboarding process. Visit each marked location in The Commons to observe and document the issues.",
    giverNpcId: BigInt(1),
    zoneId: BigInt(2),
    requiredWaypoints: [BigInt(1), BigInt(2), BigInt(3)],
  }),
  updatePlayerPosition: async () => ({
    principal: { toText: () => "mock" } as any,
    activeQuests: [],
    artifacts: [],
    completedQuestIds: [],
    position: { x: BigInt(10 * 48 + 24), y: BigInt(7 * 48 + 24) },
    currentZoneId: BigInt(1),
  }),
};
