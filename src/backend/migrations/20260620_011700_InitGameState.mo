import Map "mo:core/Map";
import List "mo:core/List";

module {
  type OldActor = {};

  type Zone = {
    id : Nat;
    name : Text;
    width : Nat;
    height : Nat;
  };

  type Position = {
    x : Nat;
    y : Nat;
  };

  type Npc = {
    id : Nat;
    name : Text;
    zoneId : Nat;
    position : Position;
    dialogue : [Text];
  };

  type QuestStatus = {
    #notStarted;
    #inProgress;
    #completed;
  };

  type Quest = {
    id : Nat;
    title : Text;
    description : Text;
    giverNpcId : Nat;
    zoneId : Nat;
    status : QuestStatus;
    observedWaypoints : [Nat];
    requiredWaypoints : [Nat];
  };

  type Waypoint = {
    id : Nat;
    zoneId : Nat;
    position : Position;
    waypointLabel : Text;
    observed : Bool;
  };

  type Artifact = {
    id : Nat;
    title : Text;
    description : Text;
    earnedAt : Nat;
  };

  type PlayerState = {
    principal : Principal;
    currentZoneId : Nat;
    position : Position;
    activeQuests : [Quest];
    completedQuestIds : [Nat];
    artifacts : [Artifact];
  };

  type NewActor = {
    playerStates : Map.Map<Principal, PlayerState>;
    zones : List.List<Zone>;
    npcs : List.List<Npc>;
    quests : List.List<Quest>;
    waypoints : List.List<Waypoint>;
    artifacts : List.List<Artifact>;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      playerStates = Map.empty<Principal, PlayerState>();
      zones = List.empty<Zone>();
      npcs = List.empty<Npc>();
      quests = List.empty<Quest>();
      waypoints = List.empty<Waypoint>();
      artifacts = List.empty<Artifact>();
    };
  };
};
