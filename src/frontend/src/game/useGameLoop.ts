import { useCallback, useEffect, useRef } from "react";
import { characters, earnedCanvas, evidenceItems, scenes } from "./levels";
import type { GameState, InputState, Position, Rect } from "./types";
import { INTERACT_DISTANCE, TILE_SIZE } from "./types";

interface UseGameLoopArgs {
  gameStateRef: React.MutableRefObject<GameState>;
  moveSpeed: number;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function useGameLoop({
  gameStateRef,
  moveSpeed,
  setGameState,
}: UseGameLoopArgs) {
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const setToast = useCallback(
    (message: string) => {
      setGameState((previous) => ({
        ...previous,
        toast: { id: Date.now(), message },
      }));
    },
    [setGameState],
  );

  const collectNearbyEvidence = useCallback(() => {
    const state = gameStateRef.current;
    const nearby = evidenceItems.find((item) => {
      if (
        item.sceneId !== state.player.sceneId ||
        state.collectedEvidenceIds.includes(item.id)
      ) {
        return false;
      }
      return (
        distanceInPixels(state.player.position, item.position) <
        INTERACT_DISTANCE
      );
    });

    if (!nearby) {
      return false;
    }

    if (state.questStage === "briefing") {
      setToast(
        "Talk to Maya first. She frames the case before you inspect evidence.",
      );
      return true;
    }

    setGameState((previous) => {
      const collectedEvidenceIds = [
        ...previous.collectedEvidenceIds,
        nearby.id,
      ];
      const allCollected = collectedEvidenceIds.length === evidenceItems.length;
      return {
        ...previous,
        collectedEvidenceIds,
        activeEvidenceId: nearby.id,
        questStage: allCollected ? "diagnose" : previous.questStage,
        toast: null,
        overlay: "evidence",
      };
    });
    return true;
  }, [gameStateRef, setGameState, setToast]);

  const openNearbyCharacter = useCallback(() => {
    const state = gameStateRef.current;
    const character = getNearbyCharacter(state);
    if (!character) {
      return false;
    }

    setGameState((previous) => ({
      ...previous,
      overlay: "dialogue",
      dialogue: { characterId: character.id, lineIndex: 0 },
    }));
    return true;
  }, [gameStateRef, setGameState]);

  const interact = useCallback(() => {
    const state = gameStateRef.current;
    if (state.overlay !== "none") {
      return;
    }

    if (collectNearbyEvidence()) {
      return;
    }

    if (openNearbyCharacter()) {
      return;
    }

    const prop = getNearbyInspectableProp(state);
    if (prop?.description) {
      setToast(prop.description);
      return;
    }

    if (state.questStage === "diagnose") {
      setGameState((previous) => ({
        ...previous,
        overlay: "decision",
        toast: {
          id: Date.now(),
          message: "Decision panel opened.",
        },
      }));
      return;
    }

    const scene = getCurrentScene(state);
    const portal = scene.portals.find((item) =>
      pointInRect(state.player.position, item.rect),
    );
    if (portal) {
      setGameState((previous) => ({
        ...previous,
        player: {
          ...previous.player,
          sceneId: portal.targetSceneId,
          position: portal.targetPosition,
        },
        toast: { id: Date.now(), message: `Entered ${portal.label}` },
      }));
      return;
    }

    setToast(
      "Nothing important to inspect here. Look for people, glowing evidence, or doorways.",
    );
  }, [
    collectNearbyEvidence,
    gameStateRef,
    openNearbyCharacter,
    setGameState,
    setToast,
  ]);

  const tick = useCallback(
    (timestamp: number) => {
      const state = gameStateRef.current;
      const delta = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      if (state.player.hasStarted && state.overlay === "none") {
        const nextPosition = getNextPosition(
          state.player.position,
          inputRef.current,
          delta,
          moveSpeed,
        );
        if (nextPosition) {
          const nextState = moveWithinScene(state, nextPosition);
          if (nextState) {
            gameStateRef.current = nextState;
            setGameState(nextState);
          }
        } else if (state.player.isMoving) {
          const nextState = {
            ...state,
            player: { ...state.player, isMoving: false },
          };
          gameStateRef.current = nextState;
          setGameState(nextState);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [gameStateRef, moveSpeed, setGameState],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        inputRef.current.up = true;
      }
      if (key === "arrowdown" || key === "s") {
        inputRef.current.down = true;
      }
      if (key === "arrowleft" || key === "a") {
        inputRef.current.left = true;
      }
      if (key === "arrowright" || key === "d") {
        inputRef.current.right = true;
      }
      if (key === "e" || key === "enter" || key === " ") {
        event.preventDefault();
        interact();
      }
      if (key === "q") {
        setGameState((previous) => ({
          ...previous,
          overlay: previous.overlay === "quest" ? "none" : "quest",
        }));
      }
      if (key === "b" || key === "i") {
        setGameState((previous) => ({
          ...previous,
          overlay: previous.overlay === "backpack" ? "none" : "backpack",
        }));
      }
      if (key === "escape") {
        setGameState((previous) => ({
          ...previous,
          overlay: "none",
          dialogue: null,
        }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        inputRef.current.up = false;
      }
      if (key === "arrowdown" || key === "s") {
        inputRef.current.down = false;
      }
      if (key === "arrowleft" || key === "a") {
        inputRef.current.left = false;
      }
      if (key === "arrowright" || key === "d") {
        inputRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(frameRef.current);
    };
  }, [interact, setGameState, tick]);

  return { inputRef, interact };
}

export function completeIntervention(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
) {
  setGameState((previous) => ({
    ...previous,
    questStage: "complete",
    earnedArtifact: earnedCanvas,
    overlay: "canvas",
    toast: { id: Date.now(), message: "Earned: Enablement Diagnostic Canvas" },
  }));
}

function getNextPosition(
  position: Position,
  input: InputState,
  delta: number,
  moveSpeed: number,
): Position | null {
  let dx = 0;
  let dy = 0;
  if (input.up) {
    dy -= 1;
  }
  if (input.down) {
    dy += 1;
  }
  if (input.left) {
    dx -= 1;
  }
  if (input.right) {
    dx += 1;
  }

  if (dx === 0 && dy === 0) {
    return null;
  }

  const length = Math.sqrt(dx * dx + dy * dy);
  const speed = (moveSpeed * delta) / TILE_SIZE;
  return {
    x: position.x + (dx / length) * speed,
    y: position.y + (dy / length) * speed,
  };
}

function moveWithinScene(
  state: GameState,
  nextPosition: Position,
): GameState | null {
  const scene = getCurrentScene(state);
  const direction = getDirection(state.player.position, nextPosition);
  const edgePortal = scene.portals.find((item) =>
    pointInRect(nextPosition, item.rect),
  );
  if (edgePortal) {
    return {
      ...state,
      player: {
        ...state.player,
        sceneId: edgePortal.targetSceneId,
        position: edgePortal.targetPosition,
        direction,
        isMoving: false,
      },
      toast: { id: Date.now(), message: `Entered ${edgePortal.label}` },
    };
  }

  const bounded = {
    x: clamp(nextPosition.x, 1.2, scene.width - 1.2),
    y: clamp(nextPosition.y, 1.4, scene.height - 1.1),
  };

  const blocked = scene.blocks.some((block) => pointInRect(bounded, block));
  const propBlocked = scene.props.some(
    (prop) =>
      prop.collision &&
      pointInRect(bounded, {
        x: prop.position.x,
        y: prop.position.y,
        width: prop.size.width,
        height: prop.size.height,
      }),
  );
  if (blocked || propBlocked) {
    return {
      ...state,
      player: {
        ...state.player,
        direction,
        isMoving: false,
      },
    };
  }

  const characterBlocked = characters.some(
    (character) =>
      character.sceneId === scene.id &&
      distanceInPixels(bounded, character.position) < 38,
  );
  if (characterBlocked) {
    return {
      ...state,
      player: {
        ...state.player,
        direction,
        isMoving: false,
      },
    };
  }

  const portal = scene.portals.find((item) => pointInRect(bounded, item.rect));
  if (portal) {
    return {
      ...state,
      player: {
        ...state.player,
        sceneId: portal.targetSceneId,
        position: portal.targetPosition,
        direction,
        isMoving: false,
      },
      toast: { id: Date.now(), message: `Entered ${portal.label}` },
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      position: bounded,
      direction,
      isMoving: true,
    },
  };
}

function getNearbyCharacter(state: GameState) {
  return characters.find((character) => {
    if (character.sceneId !== state.player.sceneId) {
      return false;
    }
    return (
      distanceInPixels(state.player.position, character.position) <
      INTERACT_DISTANCE
    );
  });
}

function getNearbyInspectableProp(state: GameState) {
  const scene = getCurrentScene(state);
  return scene.props.find((prop) => {
    if (!prop.description) {
      return false;
    }
    const center = {
      x: prop.position.x + prop.size.width / 2,
      y: prop.position.y + prop.size.height / 2,
    };
    return distanceInPixels(state.player.position, center) < INTERACT_DISTANCE;
  });
}

function getCurrentScene(state: GameState) {
  const scene = scenes.find((item) => item.id === state.player.sceneId);
  if (!scene) {
    return scenes[0];
  }
  return scene;
}

function pointInRect(point: Position, rect: Rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function distanceInPixels(a: Position, b: Position) {
  const dx = (a.x - b.x) * TILE_SIZE;
  const dy = (a.y - b.y) * TILE_SIZE;
  return Math.sqrt(dx * dx + dy * dy);
}

function getDirection(previous: Position, next: Position) {
  const dx = next.x - previous.x;
  const dy = next.y - previous.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
