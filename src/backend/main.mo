import Map "mo:core/Map";
import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Types "types/game";
import Common "types/common";
import GameMixin "mixins/game-api";

actor {
  let playerStates : Map.Map<Common.PlayerId, Types.PlayerState>;
  let zones : List.List<Types.Zone>;
  let npcs : List.List<Types.Npc>;
  let quests : List.List<Types.Quest>;
  let waypoints : List.List<Types.Waypoint>;
  let artifacts : List.List<Types.Artifact>;

  include MixinViews();
  include GameMixin(playerStates, zones, npcs, quests, waypoints, artifacts);
};
