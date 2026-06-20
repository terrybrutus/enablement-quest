import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/game";
import Common "../types/common";
import GameLib "../lib/game";

mixin (
  playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
  zones : List.List<Types.Zone>,
  npcs : List.List<Types.Npc>,
  quests : List.List<Types.Quest>,
  waypoints : List.List<Types.Waypoint>,
  artifacts : List.List<Types.Artifact>,
) {
  public query func getZones() : async [Types.Zone] {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getZones(zones)
  };

  public query func getZone(id : Types.ZoneId) : async ?Types.Zone {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getZone(zones, id)
  };

  public query func getNpcsInZone(zoneId : Types.ZoneId) : async [Types.Npc] {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getNpcsInZone(npcs, zoneId)
  };

  public query func getNpc(id : Types.NpcId) : async ?Types.Npc {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getNpc(npcs, id)
  };

  public shared ({ caller }) func getQuestsForPlayer() : async [Types.Quest] {
    GameLib.getQuestsForPlayer(playerStates, caller)
  };

  public query func getQuest(id : Types.QuestId) : async ?Types.Quest {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getQuest(quests, id)
  };

  public shared ({ caller }) func startQuest(questId : Types.QuestId) : async Types.Quest {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.startQuest(playerStates, quests, caller, questId)
  };

  public shared ({ caller }) func observeWaypoint(waypointId : Types.WaypointId) : async Types.Quest {
    GameLib.observeWaypoint(playerStates, waypoints, caller, waypointId)
  };

  public shared ({ caller }) func completeQuest(questId : Types.QuestId) : async ?Types.Artifact {
    GameLib.completeQuest(playerStates, quests, artifacts, caller, questId)
  };

  public shared ({ caller }) func getArtifactsForPlayer() : async [Types.Artifact] {
    GameLib.getArtifactsForPlayer(playerStates, caller)
  };

  public shared ({ caller }) func getPlayerState() : async ?Types.PlayerState {
    GameLib.getPlayerState(playerStates, caller)
  };

  public shared ({ caller }) func initPlayerState() : async Types.PlayerState {
    GameLib.initPlayerState(playerStates, zones, quests, caller)
  };

  public shared ({ caller }) func updatePlayerPosition(zoneId : Types.ZoneId, position : Types.Position) : async Types.PlayerState {
    GameLib.updatePlayerPosition(playerStates, caller, zoneId, position)
  };

  public query func getWaypointsInZone(zoneId : Types.ZoneId) : async [Types.Waypoint] {
    GameLib.seedWorldIfNeeded(zones, npcs, quests, waypoints, artifacts);
    GameLib.getWaypointsInZone(waypoints, zoneId)
  };
};
