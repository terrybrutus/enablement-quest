export type SceneId = "lab" | "hub" | "operations";

export type Direction = "down" | "left" | "right" | "up";

export type OverlayKind =
  | "none"
  | "briefing"
  | "dialogue"
  | "quest"
  | "backpack"
  | "settings"
  | "evidence"
  | "decision"
  | "canvas";

export type QuestStage =
  | "briefing"
  | "investigate"
  | "diagnose"
  | "design"
  | "complete";

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetSprite {
  image: AssetKey;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export type AssetKey =
  | "adamIdle"
  | "adamRun"
  | "ameliaIdle"
  | "bobIdle"
  | "roomBuilder"
  | "office"
  | "exteriorWalls"
  | "exteriorFloors"
  | "exteriorTiles1"
  | "exteriorTiles2"
  | "exteriorTiles3"
  | "exteriorTiles4"
  | "exteriorTiles5"
  | "exteriorTiles8"
  | "exteriorTiles17"
  | "exteriorTiles20"
  | "exteriorCars"
  | "officeFull"
  | "officeRoomBuilderFull"
  | "officeShadowFull"
  | "officeShadowlessFull"
  | "fountain"
  | "streetLamp";

export interface Portal {
  id: string;
  label: string;
  rect: Rect;
  targetSceneId: SceneId;
  targetPosition: Position;
}

export interface Prop {
  id: string;
  label?: string;
  description?: string;
  position: Position;
  size: { width: number; height: number };
  sprite?: SheetSprite;
  collision?: boolean;
}

export interface Evidence {
  id: string;
  title: string;
  sceneId: SceneId;
  position: Position;
  summary: string;
  insight: string;
  metric?: string;
  sprite: SheetSprite;
}

export interface GameCharacter {
  id: string;
  name: string;
  role: string;
  sceneId: SceneId;
  position: Position;
  sprite: SheetSprite;
  dialogue: Record<QuestStage, string[]>;
}

export interface Scene {
  id: SceneId;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  theme: "interior" | "exterior";
  portals: Portal[];
  props: Prop[];
  blocks: Rect[];
}

export interface DiagnosisOption {
  id: string;
  label: string;
  explanation: string;
  correct: boolean;
}

export interface InterventionOption {
  id: string;
  label: string;
  explanation: string;
  correct: boolean;
}

export interface EarnedArtifact {
  id: string;
  title: string;
  subtitle: string;
  sections: Array<{
    label: string;
    value: string;
  }>;
}

export interface Toast {
  id: number;
  message: string;
}

export interface PlayerState {
  position: Position;
  direction: Direction;
  isMoving: boolean;
  sceneId: SceneId;
  hasStarted: boolean;
}

export interface DialogueState {
  characterId: string;
  lineIndex: number;
}

export interface GameState {
  player: PlayerState;
  questStage: QuestStage;
  collectedEvidenceIds: string[];
  diagnosisId: string | null;
  interventionId: string | null;
  activeEvidenceId: string | null;
  earnedArtifact: EarnedArtifact | null;
  overlay: OverlayKind;
  dialogue: DialogueState | null;
  toast: Toast | null;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export const TILE_SIZE = 48;
export const PLAYER_WIDTH = 34;
export const PLAYER_HEIGHT = 52;
export const MOVE_SPEED = 4.2;
export const INTERACT_DISTANCE = 70;
