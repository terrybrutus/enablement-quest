import type { backendInterface } from "../backend";
import { QuestStatus } from "../backend";

const onboardingQuestDescription =
  "Maya has identified a new-hire ramp problem. Review the evidence in Operations Suite, diagnose the root cause, and choose an enablement intervention.";

const diagnosticArtifact = {
  id: BigInt(1),
  title: "Enablement Diagnostic Canvas",
  description:
    "A diagnostic artifact connecting onboarding evidence, root cause, intervention, and business impact.",
  earnedAt: BigInt(Date.now()),
};

const onboardingQuest = {
  id: BigInt(1),
  status: QuestStatus.notStarted,
  title: "Diagnose the Onboarding Ramp Problem",
  observedWaypoints: [],
  description: onboardingQuestDescription,
  giverNpcId: BigInt(1),
  zoneId: BigInt(2),
  requiredWaypoints: [BigInt(1), BigInt(2), BigInt(3)],
};

const playerState = {
  principal: { toText: () => "mock" } as any,
  activeQuests: [],
  artifacts: [],
  completedQuestIds: [],
  position: { x: BigInt(10 * 48 + 24), y: BigInt(7 * 48 + 24) },
  currentZoneId: BigInt(1),
};

export const mockBackend: backendInterface = {
  __artifacts: async () => [],
  __npcs: async () => [],
  __playerStates: async () => [],
  __quests: async () => [],
  __waypoints: async () => [],
  __zones: async () => [],
  completeQuest: async () => diagnosticArtifact,
  getArtifactsForPlayer: async () => [diagnosticArtifact],
  getNpc: async () => ({
    id: BigInt(1),
    name: "Maya",
    dialogue: [
      "Leadership thinks new hires need more training, but the evidence points to something messier.",
      "Inspect the interview note, process map, and performance metric before choosing a solution.",
      "The goal is to diagnose the root cause, not just build the first requested course.",
    ],
    position: { x: BigInt(9 * 48 + 24), y: BigInt(5 * 48 + 24) },
    zoneId: BigInt(2),
  }),
  getNpcsInZone: async (zoneId) => {
    if (zoneId === BigInt(2)) {
      return [
        {
          id: BigInt(1),
          name: "Maya",
          dialogue: [
            "Leadership thinks new hires need more training, but the evidence points to something messier.",
            "Inspect the interview note, process map, and performance metric before choosing a solution.",
            "The goal is to diagnose the root cause, not just build the first requested course.",
          ],
          position: { x: BigInt(9 * 48 + 24), y: BigInt(5 * 48 + 24) },
          zoneId: BigInt(2),
        },
      ];
    }
    return [];
  },
  getPlayerState: async () => playerState,
  getQuest: async () => onboardingQuest,
  getQuestsForPlayer: async () => [onboardingQuest],
  getWaypointsInZone: async (zoneId) => {
    if (zoneId === BigInt(2)) {
      return [
        {
          id: BigInt(1),
          observed: false,
          waypointLabel: "Interview Note",
          position: { x: BigInt(4 * 48 + 24), y: BigInt(7 * 48 + 24) },
          zoneId: BigInt(2),
        },
        {
          id: BigInt(2),
          observed: false,
          waypointLabel: "Process Map",
          position: { x: BigInt(6 * 48 + 24), y: BigInt(9 * 48 + 24) },
          zoneId: BigInt(2),
        },
        {
          id: BigInt(3),
          observed: false,
          waypointLabel: "Performance Metric",
          position: { x: BigInt(14 * 48 + 24), y: BigInt(7 * 48 + 24) },
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
        height: BigInt(13),
        name: "Learning Systems Lab",
        width: BigInt(18),
      };
    }
    if (id === BigInt(2)) {
      return {
        id: BigInt(2),
        height: BigInt(13),
        name: "Operations Suite",
        width: BigInt(18),
      };
    }
    return null;
  },
  getZones: async () => [
    {
      id: BigInt(1),
      height: BigInt(13),
      name: "Learning Systems Lab",
      width: BigInt(18),
    },
    {
      id: BigInt(2),
      height: BigInt(13),
      name: "Operations Suite",
      width: BigInt(18),
    },
  ],
  initPlayerState: async () => playerState,
  observeWaypoint: async () => ({
    ...onboardingQuest,
    status: QuestStatus.inProgress,
    observedWaypoints: [BigInt(1)],
  }),
  startQuest: async () => ({
    ...onboardingQuest,
    status: QuestStatus.inProgress,
  }),
  updatePlayerPosition: async () => playerState,
};
