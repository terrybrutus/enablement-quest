import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type QuestId = bigint;
export interface Zone {
    id: ZoneId;
    height: bigint;
    name: string;
    width: bigint;
}
export type Timestamp = bigint;
export interface Artifact {
    id: ArtifactId;
    title: string;
    description: string;
    earnedAt: Timestamp;
}
export type NpcId = bigint;
export type ZoneId = bigint;
export interface Waypoint {
    id: WaypointId;
    observed: boolean;
    waypointLabel: string;
    position: Position;
    zoneId: ZoneId;
}
export type PlayerId = Principal;
export interface Position {
    x: bigint;
    y: bigint;
}
export interface PlayerState {
    principal: PlayerId;
    activeQuests: Array<Quest>;
    artifacts: Array<Artifact>;
    completedQuestIds: Array<QuestId>;
    position: Position;
    currentZoneId: ZoneId;
}
export interface Quest {
    id: QuestId;
    status: QuestStatus;
    title: string;
    observedWaypoints: Array<WaypointId>;
    description: string;
    giverNpcId: NpcId;
    requiredWaypoints: Array<WaypointId>;
    zoneId: ZoneId;
}
export interface Npc {
    id: NpcId;
    name: string;
    dialogue: Array<string>;
    position: Position;
    zoneId: ZoneId;
}
export type WaypointId = bigint;
export type ArtifactId = bigint;
export enum QuestStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress"
}
export interface backendInterface {
    completeQuest(questId: QuestId): Promise<Artifact | null>;
    getArtifactsForPlayer(): Promise<Array<Artifact>>;
    getNpc(id: NpcId): Promise<Npc | null>;
    getNpcsInZone(zoneId: ZoneId): Promise<Array<Npc>>;
    getPlayerState(): Promise<PlayerState | null>;
    getQuest(id: QuestId): Promise<Quest | null>;
    getQuestsForPlayer(): Promise<Array<Quest>>;
    getWaypointsInZone(zoneId: ZoneId): Promise<Array<Waypoint>>;
    getZone(id: ZoneId): Promise<Zone | null>;
    getZones(): Promise<Array<Zone>>;
    initPlayerState(): Promise<PlayerState>;
    observeWaypoint(waypointId: WaypointId): Promise<Quest>;
    startQuest(questId: QuestId): Promise<Quest>;
    updatePlayerPosition(zoneId: ZoneId, position: Position): Promise<PlayerState>;
}
