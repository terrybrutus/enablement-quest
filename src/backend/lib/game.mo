import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Types "../types/game";
import Common "../types/common";

module {
  // Seed the game world with starter content if empty
  public func seedWorldIfNeeded(
    zones : List.List<Types.Zone>,
    npcs : List.List<Types.Npc>,
    quests : List.List<Types.Quest>,
    waypoints : List.List<Types.Waypoint>,
    artifacts : List.List<Types.Artifact>,
  ) {
    if (zones.size() == 0) {
      zones.add({ id = 0; name = "The Lab"; width = 20; height = 15 });
      zones.add({ id = 1; name = "The Commons"; width = 24; height = 18 });
    };
    if (npcs.size() == 0) {
      npcs.add({
        id = 0;
        name = "Learning Architect";
        zoneId = 1;
        position = { x = 12; y = 9 };
        dialogue = [
          "Welcome to the Learning Systems Lab!",
          "I'm the Learning Architect. I design enablement experiences that help teams grow.",
          "I've noticed our onboarding process has some gaps. Can you help me map the pain points?",
          "Walk around The Commons and observe the 3 marked waypoints. Then come back to me!",
        ];
      });
    };
    if (quests.size() == 0) {
      quests.add({
        id = 0;
        title = "Map the Onboarding Flow";
        description = "Observe 3 waypoints in The Commons to identify onboarding pain points.";
        giverNpcId = 0;
        zoneId = 1;
        status = #notStarted;
        observedWaypoints = [];
        requiredWaypoints = [0, 1, 2];
      });
    };
    if (waypoints.size() == 0) {
      waypoints.add({ id = 0; zoneId = 1; position = { x = 6; y = 5 }; waypointLabel = "Confusing Handoff"; observed = false });
      waypoints.add({ id = 1; zoneId = 1; position = { x = 18; y = 7 }; waypointLabel = "Missing Context"; observed = false });
      waypoints.add({ id = 2; zoneId = 1; position = { x = 10; y = 14 }; waypointLabel = "Tool Overload"; observed = false });
    };
    if (artifacts.size() == 0) {
      artifacts.add({
        id = 0;
        title = "Onboarding Blueprint";
        description = "A structured framework for designing effective onboarding experiences that reduce time-to-productivity and improve retention.";
        earnedAt = 0;
      });
    };
  };

  public func getZones(zones : List.List<Types.Zone>) : [Types.Zone] {
    zones.toArray()
  };

  public func getZone(zones : List.List<Types.Zone>, id : Types.ZoneId) : ?Types.Zone {
    zones.find(func(z) { z.id == id })
  };

  public func getNpcsInZone(npcs : List.List<Types.Npc>, zoneId : Types.ZoneId) : [Types.Npc] {
    npcs.filter(func(n) { n.zoneId == zoneId }).toArray()
  };

  public func getNpc(npcs : List.List<Types.Npc>, id : Types.NpcId) : ?Types.Npc {
    npcs.find(func(n) { n.id == id })
  };

  public func getQuestsForPlayer(playerStates : Map.Map<Common.PlayerId, Types.PlayerState>, playerId : Common.PlayerId) : [Types.Quest] {
    switch (playerStates.get(playerId)) {
      case (?state) { state.activeQuests };
      case (null) { [] };
    };
  };

  public func getQuest(quests : List.List<Types.Quest>, id : Types.QuestId) : ?Types.Quest {
    quests.find(func(q) { q.id == id })
  };

  public func startQuest(
    playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
    quests : List.List<Types.Quest>,
    playerId : Common.PlayerId,
    questId : Types.QuestId,
  ) : Types.Quest {
    let quest = switch (quests.find(func(q) { q.id == questId })) {
      case (?q) { q };
      case (null) { Runtime.trap("Quest not found") };
    };
    let updatedQuest = { quest with status = #inProgress; observedWaypoints = [] };
    let state = switch (playerStates.get(playerId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Player state not found") };
    };
    let newActive = state.activeQuests.concat([updatedQuest]);
    playerStates.add(playerId, { state with activeQuests = newActive });
    updatedQuest;
  };

  public func observeWaypoint(
    playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
    waypoints : List.List<Types.Waypoint>,
    playerId : Common.PlayerId,
    waypointId : Types.WaypointId,
  ) : Types.Quest {
    // Mark waypoint as observed globally
    let wpIndex = switch (waypoints.findIndex(func(w) { w.id == waypointId })) {
      case (?idx) { idx };
      case (null) { Runtime.trap("Waypoint not found") };
    };
    let wp = waypoints.at(wpIndex);
    waypoints.put(wpIndex, { wp with observed = true });

    // Update player's quest progress
    let state = switch (playerStates.get(playerId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Player state not found") };
    };

    let updatedQuests = state.activeQuests.map(
      func(q) {
        if (q.zoneId == wp.zoneId and q.requiredWaypoints.find<Types.WaypointId>(func(rid) { rid == waypointId }) != null) {
          let newObserved = q.observedWaypoints.concat([waypointId]);
          { q with observedWaypoints = newObserved };
        } else {
          q;
        };
      },
    );

    playerStates.add(playerId, { state with activeQuests = updatedQuests });

    // Return the quest that contains this waypoint (if any)
    switch (updatedQuests.find<Types.Quest>(func(q) { q.requiredWaypoints.find<Types.WaypointId>(func(rid) { rid == waypointId }) != null })) {
      case (?q) { q };
      case (null) { Runtime.trap("No active quest for this waypoint") };
    };
  };

  public func completeQuest(
    playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
    quests : List.List<Types.Quest>,
    artifacts : List.List<Types.Artifact>,
    playerId : Common.PlayerId,
    questId : Types.QuestId,
  ) : ?Types.Artifact {
    let state = switch (playerStates.get(playerId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Player state not found") };
    };

    let quest = switch (quests.find(func(q) { q.id == questId })) {
      case (?q) { q };
      case (null) { Runtime.trap("Quest not found") };
    };

    // Check if all required waypoints are observed
    let activeQuest = switch (state.activeQuests.find(func(q) { q.id == questId })) {
      case (?q) { q };
      case (null) { Runtime.trap("Quest not active for player") };
    };

    let allObserved = quest.requiredWaypoints.all(
      func(rid) { activeQuest.observedWaypoints.find<Types.WaypointId>(func(oid) { oid == rid }) != null },
    );

    if (not allObserved) {
      Runtime.trap("Not all waypoints observed");
    };

    // Mark quest as completed
    let updatedQuests = state.activeQuests.filter(func(q) { q.id != questId });
    let newCompleted = state.completedQuestIds.concat([questId]);

    // Award artifact (quest 0 -> artifact 0)
    let artifact = switch (artifacts.find(func(a) { a.id == questId })) {
      case (?a) { a };
      case (null) { Runtime.trap("Artifact not found") };
    };
    let earnedArtifact = { artifact with earnedAt = 0 };
    let newArtifacts = state.artifacts.concat([earnedArtifact]);

    playerStates.add(playerId, {
      state with
      activeQuests = updatedQuests;
      completedQuestIds = newCompleted;
      artifacts = newArtifacts;
    });

    ?earnedArtifact;
  };

  public func getArtifactsForPlayer(playerStates : Map.Map<Common.PlayerId, Types.PlayerState>, playerId : Common.PlayerId) : [Types.Artifact] {
    switch (playerStates.get(playerId)) {
      case (?state) { state.artifacts };
      case (null) { [] };
    };
  };

  public func getPlayerState(playerStates : Map.Map<Common.PlayerId, Types.PlayerState>, playerId : Common.PlayerId) : ?Types.PlayerState {
    playerStates.get(playerId);
  };

  public func initPlayerState(
    playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
    zones : List.List<Types.Zone>,
    quests : List.List<Types.Quest>,
    playerId : Common.PlayerId,
  ) : Types.PlayerState {
    seedWorldIfNeeded(zones, List.empty(), quests, List.empty(), List.empty());
    switch (playerStates.get(playerId)) {
      case (?state) { state };
      case (null) {
        let newState : Types.PlayerState = {
          principal = playerId;
          currentZoneId = 0;
          position = { x = 10; y = 7 };
          activeQuests = [];
          completedQuestIds = [];
          artifacts = [];
        };
        playerStates.add(playerId, newState);
        newState;
      };
    };
  };

  public func updatePlayerPosition(
    playerStates : Map.Map<Common.PlayerId, Types.PlayerState>,
    playerId : Common.PlayerId,
    zoneId : Types.ZoneId,
    position : Types.Position,
  ) : Types.PlayerState {
    let state = switch (playerStates.get(playerId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Player state not found") };
    };
    let updated = { state with currentZoneId = zoneId; position = position };
    playerStates.add(playerId, updated);
    updated;
  };

  public func getWaypointsInZone(waypoints : List.List<Types.Waypoint>, zoneId : Types.ZoneId) : [Types.Waypoint] {
    waypoints.filter(func(w) { w.zoneId == zoneId }).toArray();
  };
};
