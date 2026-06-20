// Game types matching backend structure for future integration

export interface Position {
  x: number;
  y: number;
}

export interface Zone {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: number[][]; // 0=floor, 1=wall, 2=portal
  portals: Portal[];
  decorations: Decoration[];
}

export interface Portal {
  x: number;
  y: number;
  targetZoneId: number;
  targetX: number;
  targetY: number;
  label: string;
}

export interface Decoration {
  x: number;
  y: number;
  type: "desk" | "plant" | "whiteboard" | "bookshelf" | "terminal" | "couch";
}

export interface Npc {
  id: number;
  name: string;
  position: Position;
  zoneId: number;
  dialogue: string[];
  questId: number | null;
  color: string;
}

export interface Waypoint {
  id: number;
  position: Position;
  zoneId: number;
  waypointLabel: string;
  observed: boolean;
}

export type QuestStatus = "notStarted" | "inProgress" | "completed";

export interface Quest {
  id: number;
  title: string;
  description: string;
  giverNpcId: number;
  zoneId: number;
  status: QuestStatus;
  requiredWaypoints: number[];
  observedWaypoints: number[];
}

export interface Artifact {
  id: number;
  title: string;
  description: string;
  earnedAt: number;
}

export interface PlayerState {
  position: Position;
  currentZoneId: number;
  activeQuests: Quest[];
  completedQuestIds: number[];
  artifacts: Artifact[];
}

export interface GameState {
  player: PlayerState;
  zones: Zone[];
  npcs: Npc[];
  waypoints: Waypoint[];
  quests: Quest[];
  currentDialogue: {
    npc: Npc;
    lineIndex: number;
  } | null;
  showQuestLog: boolean;
  showArtifacts: boolean;
  showTitle: boolean;
  gameStarted: boolean;
  notification: string | null;
  notificationTime: number;
}

export const TILE_SIZE = 48;
export const PLAYER_SIZE = 32;
export const MOVE_SPEED = 4;
export const INTERACT_DISTANCE = 64;
