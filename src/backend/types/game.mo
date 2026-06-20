import Common "common";

module {
  public type ZoneId = Nat;
  public type NpcId = Nat;
  public type QuestId = Nat;
  public type ArtifactId = Nat;
  public type WaypointId = Nat;

  public type Position = {
    x : Nat;
    y : Nat;
  };

  public type Zone = {
    id : ZoneId;
    name : Text;
    width : Nat;
    height : Nat;
  };

  public type Npc = {
    id : NpcId;
    name : Text;
    zoneId : ZoneId;
    position : Position;
    dialogue : [Text];
  };

  public type QuestStatus = {
    #notStarted;
    #inProgress;
    #completed;
  };

  public type Quest = {
    id : QuestId;
    title : Text;
    description : Text;
    giverNpcId : NpcId;
    zoneId : ZoneId;
    status : QuestStatus;
    observedWaypoints : [WaypointId];
    requiredWaypoints : [WaypointId];
  };

  public type Waypoint = {
    id : WaypointId;
    zoneId : ZoneId;
    position : Position;
    waypointLabel : Text;
    observed : Bool;
  };

  public type Artifact = {
    id : ArtifactId;
    title : Text;
    description : Text;
    earnedAt : Common.Timestamp;
  };

  public type PlayerState = {
    principal : Common.PlayerId;
    currentZoneId : ZoneId;
    position : Position;
    activeQuests : [Quest];
    completedQuestIds : [QuestId];
    artifacts : [Artifact];
  };
};
