import { useCallback, useEffect, useRef } from "react";
import type { GameState } from "./types";
import { INTERACT_DISTANCE, MOVE_SPEED, TILE_SIZE } from "./types";

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
}

export function useGameLoop(
  gameStateRef: React.MutableRefObject<GameState>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  _canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
  });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const getCurrentZone = useCallback(() => {
    const gs = gameStateRef.current;
    return gs.zones.find((z) => z.id === gs.player.currentZoneId)!;
  }, [gameStateRef]);

  const isWall = useCallback(
    (x: number, y: number) => {
      const zone = getCurrentZone();
      const tx = Math.floor(x / TILE_SIZE);
      const ty = Math.floor(y / TILE_SIZE);
      if (tx < 0 || tx >= zone.width || ty < 0 || ty >= zone.height)
        return true;
      return zone.tiles[ty][tx] === 1;
    },
    [getCurrentZone],
  );

  const checkPortal = useCallback(
    (x: number, y: number) => {
      const zone = getCurrentZone();
      const tx = Math.floor(x / TILE_SIZE);
      const ty = Math.floor(y / TILE_SIZE);
      return zone.portals.find((p) => p.x === tx && p.y === ty);
    },
    [getCurrentZone],
  );

  const checkNpcInteraction = useCallback(
    (px: number, py: number) => {
      const gs = gameStateRef.current;
      const zoneNpcs = gs.npcs.filter(
        (n) => n.zoneId === gs.player.currentZoneId,
      );
      for (const npc of zoneNpcs) {
        const nx = npc.position.x * TILE_SIZE + TILE_SIZE / 2;
        const ny = npc.position.y * TILE_SIZE + TILE_SIZE / 2;
        const dist = Math.sqrt((px - nx) ** 2 + (py - ny) ** 2);
        if (dist < INTERACT_DISTANCE) return npc;
      }
      return null;
    },
    [gameStateRef],
  );

  const checkWaypointInteraction = useCallback(
    (px: number, py: number) => {
      const gs = gameStateRef.current;
      const zoneWaypoints = gs.waypoints.filter(
        (w) => w.zoneId === gs.player.currentZoneId && !w.observed,
      );
      for (const wp of zoneWaypoints) {
        const wx = wp.position.x * TILE_SIZE + TILE_SIZE / 2;
        const wy = wp.position.y * TILE_SIZE + TILE_SIZE / 2;
        const dist = Math.sqrt((px - wx) ** 2 + (py - wy) ** 2);
        if (dist < INTERACT_DISTANCE) return wp;
      }
      return null;
    },
    [gameStateRef],
  );

  const advanceDialogue = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentDialogue) return prev;
      const nextIndex = prev.currentDialogue.lineIndex + 1;
      if (nextIndex >= prev.currentDialogue.npc.dialogue.length) {
        // Dialogue ended — check if quest should start
        const npc = prev.currentDialogue.npc;
        let newState = { ...prev, currentDialogue: null };
        if (npc.questId) {
          const quest = newState.quests.find((q) => q.id === npc.questId);
          if (quest && quest.status === "notStarted") {
            newState = {
              ...newState,
              quests: newState.quests.map((q) =>
                q.id === npc.questId
                  ? { ...q, status: "inProgress" as const }
                  : q,
              ),
              player: {
                ...newState.player,
                activeQuests: [
                  ...newState.player.activeQuests,
                  { ...quest, status: "inProgress" as const },
                ],
              },
              notification: `Quest started: ${quest.title}`,
              notificationTime: Date.now(),
            };
          }
        }
        return newState;
      }
      return {
        ...prev,
        currentDialogue: { ...prev.currentDialogue, lineIndex: nextIndex },
      };
    });
  }, [setGameState]);

  const observeWaypoint = useCallback(
    (waypointId: number) => {
      setGameState((prev) => {
        const wp = prev.waypoints.find((w) => w.id === waypointId);
        if (!wp || wp.observed) return prev;

        const newWaypoints = prev.waypoints.map((w) =>
          w.id === waypointId ? { ...w, observed: true } : w,
        );
        const quest = prev.quests.find((q) => q.id === 1);
        if (!quest) return { ...prev, waypoints: newWaypoints };

        const newObserved = [...quest.observedWaypoints, waypointId];
        const allObserved = quest.requiredWaypoints.every((rw) =>
          newObserved.includes(rw),
        );

        let newQuests = prev.quests.map((q) =>
          q.id === 1 ? { ...q, observedWaypoints: newObserved } : q,
        );
        let newArtifacts = prev.player.artifacts;
        let newCompleted = prev.player.completedQuestIds;
        let notification: string | null = `Observed: ${wp.waypointLabel}`;
        let notificationTime = Date.now();

        if (allObserved && quest.status === "inProgress") {
          newQuests = newQuests.map((q) =>
            q.id === 1 ? { ...q, status: "completed" as const } : q,
          );
          newCompleted = [...newCompleted, 1];
          const artifact: import("./types").Artifact = {
            id: 1,
            title: "Onboarding Blueprint",
            description:
              "A comprehensive map of the onboarding flow with three documented pain points: confusing documentation, tool access delays, and unclear role expectations. This artifact can be used to advocate for workflow improvements.",
            earnedAt: Date.now(),
          };
          newArtifacts = [...newArtifacts, artifact];
          notification = "Quest complete! Earned: Onboarding Blueprint";
          notificationTime = Date.now();
        }

        return {
          ...prev,
          waypoints: newWaypoints,
          quests: newQuests,
          player: {
            ...prev.player,
            artifacts: newArtifacts,
            completedQuestIds: newCompleted,
            activeQuests: newQuests.filter((q) => q.status === "inProgress"),
          },
          notification,
          notificationTime,
        };
      });
    },
    [setGameState],
  );

  const gameLoop = useCallback(
    (timestamp: number) => {
      const gs = gameStateRef.current;
      if (!gs.gameStarted || gs.currentDialogue) {
        lastTimeRef.current = timestamp;
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      const input = inputRef.current;
      let dx = 0;
      let dy = 0;
      if (input.up) dy -= 1;
      if (input.down) dy += 1;
      if (input.left) dx -= 1;
      if (input.right) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / len) * MOVE_SPEED * dt;
        dy = (dy / len) * MOVE_SPEED * dt;

        const player = gs.player;
        const newX = player.position.x + dx;
        const newY = player.position.y + dy;

        const halfSize = 14;
        if (
          !isWall(newX - halfSize, newY - halfSize) &&
          !isWall(newX + halfSize, newY - halfSize) &&
          !isWall(newX - halfSize, newY + halfSize) &&
          !isWall(newX + halfSize, newY + halfSize)
        ) {
          player.position.x = newX;
          player.position.y = newY;
        }

        const portal = checkPortal(newX, newY);
        if (portal) {
          player.currentZoneId = portal.targetZoneId;
          player.position.x = portal.targetX * TILE_SIZE + TILE_SIZE / 2;
          player.position.y = portal.targetY * TILE_SIZE + TILE_SIZE / 2;
          setGameState((prev) => ({ ...prev, player: { ...player } }));
        }
      }

      if (input.interact) {
        inputRef.current.interact = false;
        const px = gs.player.position.x;
        const py = gs.player.position.y;
        const npc = checkNpcInteraction(px, py);
        if (npc) {
          setGameState((prev) => ({
            ...prev,
            currentDialogue: { npc, lineIndex: 0 },
          }));
        } else {
          const wp = checkWaypointInteraction(px, py);
          if (wp) {
            observeWaypoint(wp.id);
          }
        }
      }

      // Clear old notification
      if (gs.notification && Date.now() - gs.notificationTime > 4000) {
        setGameState((prev) => ({ ...prev, notification: null }));
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [
      gameStateRef,
      setGameState,
      isWall,
      checkPortal,
      checkNpcInteraction,
      checkWaypointInteraction,
      observeWaypoint,
    ],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) inputRef.current.up = true;
      if (["arrowdown", "s"].includes(key)) inputRef.current.down = true;
      if (["arrowleft", "a"].includes(key)) inputRef.current.left = true;
      if (["arrowright", "d"].includes(key)) inputRef.current.right = true;
      if (["e", "enter", " "].includes(key)) {
        e.preventDefault();
        inputRef.current.interact = true;
        const gs = gameStateRef.current;
        if (gs.currentDialogue) {
          advanceDialogue();
        }
      }
      if (key === "q") {
        setGameState((prev) => ({
          ...prev,
          showQuestLog: !prev.showQuestLog,
          showArtifacts: false,
        }));
      }
      if (key === "i") {
        setGameState((prev) => ({
          ...prev,
          showArtifacts: !prev.showArtifacts,
          showQuestLog: false,
        }));
      }
      if (key === "escape") {
        setGameState((prev) => ({
          ...prev,
          currentDialogue: null,
          showQuestLog: false,
          showArtifacts: false,
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) inputRef.current.up = false;
      if (["arrowdown", "s"].includes(key)) inputRef.current.down = false;
      if (["arrowleft", "a"].includes(key)) inputRef.current.left = false;
      if (["arrowright", "d"].includes(key)) inputRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameLoop, advanceDialogue, setGameState, gameStateRef]);

  return { inputRef };
}
