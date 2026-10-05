import { useCallback, useEffect, useRef } from "react";
import {
  characters,
  earnedArtifactsByCase,
  evidenceItems,
  scenes,
} from "./levels";
import type {
  CharacterState,
  Direction,
  GameState,
  InputState,
  Portal,
  Position,
  Rect,
  Scene,
} from "./types";
import { INTERACT_DISTANCE, TILE_SIZE } from "./types";

interface UseGameLoopArgs {
  gameStateRef: React.MutableRefObject<GameState>;
  moveSpeed: number;
  sceneList?: Scene[];
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function useGameLoop({
  gameStateRef,
  moveSpeed,
  sceneList = scenes,
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
        item.caseId !== state.currentCaseId ||
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

    if (!isCurrentCaseBriefed(state)) {
      const stakeholder = state.currentCaseId === "sales" ? "Leo" : "Maya";
      setToast(
        `Talk to ${stakeholder} first. They explain the case before you review evidence.`,
      );
      return true;
    }

    const caseEvidence = evidenceItems.filter(
      (item) => item.caseId === state.currentCaseId,
    );
    const expectedEvidence = caseEvidence.find(
      (item) => !state.collectedEvidenceIds.includes(item.id),
    );
    if (expectedEvidence && nearby.id !== expectedEvidence.id) {
      setToast(
        `Start with ${expectedEvidence.title}. The case works best when you review evidence in order.`,
      );
      return true;
    }

    setGameState((previous) => {
      const collectedEvidenceIds = [
        ...previous.collectedEvidenceIds,
        nearby.id,
      ];
      const allCollected = caseEvidence.every((item) =>
        collectedEvidenceIds.includes(item.id),
      );
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

    setGameState((previous) => {
      const isCaseOwner =
        character.id === (previous.currentCaseId === "sales" ? "leo" : "maya");
      const needsBriefing = isCaseOwner && !isCurrentCaseBriefed(previous);
      return {
        ...previous,
        questStage: needsBriefing ? "briefing" : previous.questStage,
        overlay: "dialogue",
        dialogue: {
          characterId: character.id,
          lineIndex: 0,
          openedAt: Date.now(),
        },
        characterStates: faceCharacterTowardPlayer(previous, character.id),
      };
    });
    return true;
  }, [gameStateRef, setGameState]);

  const interact = useCallback(() => {
    const state = gameStateRef.current;
    if (state.overlay !== "none") {
      return;
    }

    if (
      (state.questStage === "diagnose" || state.questStage === "design") &&
      getNearbyCaseOwner(state)
    ) {
      setGameState((previous) => ({
        ...previous,
        overlay: "decision",
        toast: null,
      }));
      return;
    }

    if (state.questStage === "diagnose" || state.questStage === "design") {
      const stakeholder = state.currentCaseId === "sales" ? "Leo" : "Maya";
      setToast(
        `Bring your findings back to ${stakeholder}. Stand near them to choose the cause and fix.`,
      );
      return;
    }

    if (!isCurrentCaseBriefed(state) && openNearbyCharacter()) {
      return;
    }

    if (collectNearbyEvidence()) {
      return;
    }

    if (openNearbyCharacter()) {
      return;
    }

    const prop = getNearbyInspectableProp(state, sceneList);
    if (prop?.description) {
      if (prop.id === "lab-canvas-workstation") {
        setGameState((previous) => ({
          ...previous,
          overlay: "email",
          toast: null,
        }));
        return;
      }
      if (state.player.sceneId === "lab" && !state.labEmailRead) {
        setToast(
          "Check your workstation first. Leadership sent the request that starts the case.",
        );
        return;
      }
      if (prop.id === "mission-backpack") {
        const message = prop.description;
        setGameState((previous) => ({
          ...previous,
          labBriefingCompleted: true,
          toast: {
            id: Date.now(),
            message,
          },
        }));
        return;
      }
      setToast(prop.description);
      return;
    }

    const portal = getPortalAtPosition(state, state.player.position, sceneList);
    if (portal) {
      if (portal.id === "lab-to-hub" && !state.labEmailRead) {
        setToast(
          "Check your workstation first. The leadership request explains why you are leaving the lab.",
        );
        return;
      }
      if (portal.id === "lab-to-hub" && !state.labBriefingCompleted) {
        setToast(
          "Grab your orange backpack first. Then leave the lab and find Leo.",
        );
        return;
      }
      if (
        portal.targetSceneId === "sales" &&
        state.currentCaseId !== "sales" &&
        !state.completedCaseIds.includes("onboarding")
      ) {
        setGameState((previous) => ({
          ...previous,
          toast: {
            id: Date.now(),
            message:
              "Finish the onboarding case first. The Sales Enablement Studio unlocks after you earn the first case summary.",
          },
        }));
        return;
      }
      const caseTransition = getCaseTransition(state, portal.targetSceneId);
      const destination = getPortalDestination(state, portal, sceneList);
      setGameState((previous) => ({
        ...previous,
        ...caseTransition,
        player: {
          ...previous.player,
          sceneId: portal.targetSceneId,
          position: destination.position,
          direction: destination.direction ?? previous.player.direction,
        },
        toast:
          "toast" in caseTransition && caseTransition.toast
            ? caseTransition.toast
            : null,
      }));
      return;
    }

    setToast(
      "There is nothing useful to inspect here yet. Look for people, marked evidence, or doorways.",
    );
  }, [
    collectNearbyEvidence,
    gameStateRef,
    openNearbyCharacter,
    sceneList,
    setGameState,
    setToast,
  ]);

  const tick = useCallback(
    (timestamp: number) => {
      const state = gameStateRef.current;
      const delta = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      if (state.player.hasStarted && state.overlay === "none") {
        const ambientState = {
          ...state,
          characterStates: moveCharacters(state, delta, sceneList),
        };
        const nextPosition = getNextPosition(
          ambientState.player.position,
          inputRef.current,
          delta,
          moveSpeed,
        );
        if (nextPosition) {
          const nextState = moveWithinScene(
            ambientState,
            nextPosition,
            sceneList,
          );
          if (nextState) {
            gameStateRef.current = nextState;
            setGameState(nextState);
          }
        } else if (
          state.player.isMoving ||
          ambientState.characterStates !== state.characterStates
        ) {
          const nextState = {
            ...ambientState,
            player: { ...ambientState.player, isMoving: false },
          };
          gameStateRef.current = nextState;
          setGameState(nextState);
        }
      } else if (state.player.hasStarted && state.overlay === "dialogue") {
        const nextState = {
          ...state,
          characterStates: faceActiveCharacterTowardPlayer(state),
        };
        gameStateRef.current = nextState;
        setGameState(nextState);
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [gameStateRef, moveSpeed, sceneList, setGameState],
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
      if ((key === "e" || key === "enter" || key === " ") && !event.repeat) {
        event.preventDefault();
        interact();
      }
      if (key === "q") {
        event.preventDefault();
        setGameState((previous) => ({
          ...previous,
          ...(canToggleUtilityPanel(previous.overlay)
            ? {
                activeEvidenceId: null,
                dialogue: null,
                overlay: previous.overlay === "quest" ? "none" : "quest",
              }
            : {}),
        }));
      }
      if (key === "b" || key === "i") {
        event.preventDefault();
        setGameState((previous) => ({
          ...previous,
          ...(canToggleUtilityPanel(previous.overlay)
            ? {
                activeEvidenceId: null,
                dialogue: null,
                overlay: previous.overlay === "backpack" ? "none" : "backpack",
              }
            : {}),
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

function canToggleUtilityPanel(overlay: GameState["overlay"]) {
  return (
    overlay === "none" ||
    overlay === "quest" ||
    overlay === "backpack" ||
    overlay === "settings"
  );
}

export function completeIntervention(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
) {
  setGameState((previous) => ({
    ...previous,
    questStage: "complete",
    completedCaseIds: previous.completedCaseIds.includes(previous.currentCaseId)
      ? previous.completedCaseIds
      : [...previous.completedCaseIds, previous.currentCaseId],
    activeCanvasCaseId: null,
    earnedArtifact: earnedArtifactsByCase[previous.currentCaseId],
    overlay: "canvas",
    toast: {
      id: Date.now(),
      message: `Earned: ${earnedArtifactsByCase[previous.currentCaseId].title}`,
    },
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
  sceneList: Scene[],
): GameState | null {
  const scene = getCurrentScene(state, sceneList);
  const direction = getDirection(state.player.position, nextPosition);
  const edgePortal = getPortalAtPosition(state, nextPosition, sceneList);
  if (edgePortal) {
    if (edgePortal.id === "lab-to-hub" && !state.labEmailRead) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Check your workstation first. The leadership request explains why you are leaving the lab.",
        },
      };
    }
    if (edgePortal.id === "lab-to-hub" && !state.labBriefingCompleted) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Grab your orange backpack first. Then leave the lab and find Leo.",
        },
      };
    }
    if (
      edgePortal.targetSceneId === "sales" &&
      state.currentCaseId !== "sales" &&
      !state.completedCaseIds.includes("onboarding")
    ) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Finish the onboarding case first. The Sales Enablement Studio unlocks after you earn the first case summary.",
        },
      };
    }
    const caseTransition = getCaseTransition(state, edgePortal.targetSceneId);
    const destination = getPortalDestination(state, edgePortal, sceneList);
    return {
      ...state,
      ...caseTransition,
      player: {
        ...state.player,
        sceneId: edgePortal.targetSceneId,
        position: destination.position,
        direction: destination.direction ?? direction,
        isMoving: false,
      },
      toast:
        "toast" in caseTransition && caseTransition.toast
          ? caseTransition.toast
          : null,
    };
  }

  const bounded = {
    x: clamp(nextPosition.x, 1.2, scene.width - 1.2),
    y: clamp(nextPosition.y, 1.4, scene.height - 1.1),
  };

  const blocked = scene.blocks.some((block) => pointInRect(bounded, block));
  const propBlocked = scene.props.some(
    (prop) => prop.collision && pointInRect(bounded, getVisiblePropRect(prop)),
  );
  const characterBlocked = characters.some((character) => {
    if (character.sceneId !== state.player.sceneId) {
      return false;
    }
    const characterState = state.characterStates[character.id];
    const position = characterState?.position ?? character.position;
    return distanceInPixels(bounded, position) < 24;
  });
  if (blocked || propBlocked || characterBlocked) {
    return {
      ...state,
      player: {
        ...state.player,
        direction,
        isMoving: false,
      },
    };
  }

  const portal = getPortalAtPosition(state, bounded, sceneList);
  if (portal) {
    if (portal.id === "lab-to-hub" && !state.labEmailRead) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Check your workstation first. The leadership request explains why you are leaving the lab.",
        },
      };
    }
    if (portal.id === "lab-to-hub" && !state.labBriefingCompleted) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Grab your orange backpack first. Then leave the lab and find Leo.",
        },
      };
    }
    if (
      portal.targetSceneId === "sales" &&
      state.currentCaseId !== "sales" &&
      !state.completedCaseIds.includes("onboarding")
    ) {
      return {
        ...state,
        player: {
          ...state.player,
          direction,
          isMoving: false,
        },
        toast: {
          id: Date.now(),
          message:
            "Finish the onboarding case first. The Sales Enablement Studio unlocks after you earn the first case summary.",
        },
      };
    }
    const caseTransition = getCaseTransition(state, portal.targetSceneId);
    const destination = getPortalDestination(state, portal, sceneList);
    return {
      ...state,
      ...caseTransition,
      player: {
        ...state.player,
        sceneId: portal.targetSceneId,
        position: destination.position,
        direction: destination.direction ?? direction,
        isMoving: false,
      },
      toast:
        "toast" in caseTransition && caseTransition.toast
          ? caseTransition.toast
          : null,
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
    const characterState = state.characterStates[character.id];
    return (
      distanceInPixels(
        state.player.position,
        characterState?.position ?? character.position,
      ) < INTERACT_DISTANCE
    );
  });
}

function getPortalAtPosition(
  state: GameState,
  position: Position,
  sceneList: Scene[],
) {
  const scene = getCurrentScene(state, sceneList);
  return scene.portals.find((portal) => pointInRect(position, portal.rect));
}

function getPortalDestination(
  state: GameState,
  portal: Portal,
  sceneList: Scene[],
) {
  const targetScene = sceneList.find(
    (scene) => scene.id === portal.targetSceneId,
  );
  const currentSceneId = state.player.sceneId;
  const pairedPortal = targetScene?.portals.find(
    (candidate) => candidate.targetSceneId === currentSceneId,
  );
  if (targetScene?.theme === "exterior") {
    return {
      direction: pairedPortal
        ? getDirectionAwayFromPortal(targetScene, pairedPortal)
        : state.player.direction,
      position: portal.targetPosition,
    };
  }
  if (!targetScene || !pairedPortal) {
    return { position: portal.targetPosition };
  }
  return getEntryPositionFromPortal(targetScene, pairedPortal);
}

function getDirectionAwayFromPortal(scene: Scene, portal: Portal) {
  const distances = {
    bottom: scene.height - (portal.rect.y + portal.rect.height),
    left: portal.rect.x,
    right: scene.width - (portal.rect.x + portal.rect.width),
    top: portal.rect.y,
  };
  const side = (Object.entries(distances).sort(
    (first, second) => first[1] - second[1],
  )[0]?.[0] ?? "bottom") as "bottom" | "left" | "right" | "top";

  if (side === "left") {
    return "left" as const;
  }
  if (side === "right") {
    return "right" as const;
  }
  if (side === "top") {
    return "up" as const;
  }
  return "down" as const;
}

function getEntryPositionFromPortal(scene: Scene, portal: Portal) {
  const inset = 0.45;
  const center = {
    x: portal.rect.x + portal.rect.width / 2,
    y: portal.rect.y + portal.rect.height / 2,
  };
  const distances = {
    bottom: scene.height - (portal.rect.y + portal.rect.height),
    left: portal.rect.x,
    right: scene.width - (portal.rect.x + portal.rect.width),
    top: portal.rect.y,
  };
  const side = (Object.entries(distances).sort(
    (first, second) => first[1] - second[1],
  )[0]?.[0] ?? "bottom") as "bottom" | "left" | "right" | "top";

  if (side === "left") {
    return {
      direction: "right" as const,
      position: {
        x: clamp(
          portal.rect.x + portal.rect.width + inset,
          1.2,
          scene.width - 1.2,
        ),
        y: clamp(center.y, 1.4, scene.height - 1.1),
      },
    };
  }
  if (side === "right") {
    return {
      direction: "left" as const,
      position: {
        x: clamp(portal.rect.x - inset, 1.2, scene.width - 1.2),
        y: clamp(center.y, 1.4, scene.height - 1.1),
      },
    };
  }
  if (side === "top") {
    return {
      direction: "down" as const,
      position: {
        x: clamp(center.x, 1.2, scene.width - 1.2),
        y: clamp(
          portal.rect.y + portal.rect.height + inset,
          1.4,
          scene.height - 1.1,
        ),
      },
    };
  }
  return {
    direction: "up" as const,
    position: {
      x: clamp(center.x, 1.2, scene.width - 1.2),
      y: clamp(portal.rect.y - inset, 1.4, scene.height - 1.1),
    },
  };
}

function getNearbyCaseOwner(state: GameState) {
  const ownerId = state.currentCaseId === "sales" ? "leo" : "maya";
  const owner = characters.find((character) => character.id === ownerId);
  if (!owner || owner.sceneId !== state.player.sceneId) {
    return null;
  }
  const ownerState = state.characterStates[owner.id];
  const ownerPosition = ownerState?.position ?? owner.position;
  return distanceInPixels(state.player.position, ownerPosition) <
    INTERACT_DISTANCE
    ? owner
    : null;
}

function getCaseTransition(
  state: GameState,
  targetSceneId: GameState["player"]["sceneId"],
) {
  if (
    targetSceneId === "sales" &&
    state.completedCaseIds.includes("onboarding") &&
    state.currentCaseId !== "sales"
  ) {
    return {
      currentCaseId: "sales" as const,
      questStage: "briefing" as const,
      diagnosisId: null,
      interventionId: null,
      activeEvidenceId: null,
      activeCanvasCaseId: null,
      earnedArtifact: null,
      caseBriefingCompletedIds: state.caseBriefingCompletedIds.filter(
        (caseId) => caseId !== "sales",
      ),
      overlay: "none" as const,
      dialogue: null,
      toast: {
        id: Date.now(),
        message:
          "New case started: investigate why demos are not converting into qualified next steps.",
      },
    };
  }
  return {};
}

function isCurrentCaseBriefed(state: GameState) {
  return state.caseBriefingCompletedIds.includes(state.currentCaseId);
}

function moveCharacters(state: GameState, delta: number, sceneList: Scene[]) {
  const nextStates: Record<string, CharacterState> = {
    ...state.characterStates,
  };
  const scene = getCurrentScene(state, sceneList);
  for (const character of characters) {
    const patrol = character.patrol;
    const current =
      nextStates[character.id] ??
      ({
        position: character.position,
        direction: "down",
        patrolIndex: 0,
        isMoving: false,
        pauseUntil: getCharacterPauseUntil(character.id, 0),
      } satisfies CharacterState);

    if (
      !patrol ||
      patrol.length < 2 ||
      character.sceneId !== state.player.sceneId
    ) {
      nextStates[character.id] = { ...current, isMoving: false };
      continue;
    }

    if (
      distanceInPixels(state.player.position, current.position) <
      INTERACT_DISTANCE + 22
    ) {
      nextStates[character.id] = {
        ...current,
        isMoving: false,
        pauseUntil: Math.max(current.pauseUntil ?? 0, Date.now() + 900),
      };
      continue;
    }

    if ((current.pauseUntil ?? 0) > Date.now()) {
      nextStates[character.id] = { ...current, isMoving: false };
      continue;
    }

    const targetIndex = (current.patrolIndex + 1) % patrol.length;
    const target = patrol[targetIndex];
    const dx = target.x - current.position.x;
    const dy = target.y - current.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.04) {
      nextStates[character.id] = {
        ...current,
        patrolIndex: targetIndex,
        isMoving: false,
        pauseUntil: getCharacterPauseUntil(character.id, targetIndex),
      };
      continue;
    }

    const speed = (character.movement?.speed ?? 0.012) * delta;
    const step = Math.min(speed, distance);
    const nextPosition = {
      x: current.position.x + (dx / distance) * step,
      y: current.position.y + (dy / distance) * step,
    };
    if (isCharacterPositionBlocked(nextPosition, scene)) {
      nextStates[character.id] = {
        ...current,
        isMoving: false,
        patrolIndex: targetIndex,
        pauseUntil: getCharacterPauseUntil(character.id, targetIndex),
      };
      continue;
    }
    nextStates[character.id] = {
      ...current,
      position: nextPosition,
      direction: getDirection(current.position, nextPosition),
      isMoving: true,
      pauseUntil: undefined,
    };
  }
  return nextStates;
}

function isCharacterPositionBlocked(position: Position, scene: Scene) {
  if (
    position.x < 1.2 ||
    position.x > scene.width - 1.2 ||
    position.y < 1.4 ||
    position.y > scene.height - 1.1
  ) {
    return true;
  }
  return (
    scene.blocks.some((block) => pointInRect(position, block)) ||
    scene.props.some(
      (prop) =>
        prop.collision && pointInRect(position, getVisiblePropRect(prop)),
    )
  );
}

function getCharacterPauseUntil(characterId: string, step: number) {
  return Date.now() + getCharacterPauseDuration(characterId, step);
}

function getCharacterPauseDuration(characterId: string, step: number) {
  const character = characters.find((item) => item.id === characterId);
  const minPause = character?.movement?.pauseMinMs ?? 900;
  const maxPause = character?.movement?.pauseMaxMs ?? 2300;
  const pauseRange = Math.max(0, maxPause - minPause);
  const seed = characterId
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return minPause + ((seed + step * 397) % (pauseRange + 1));
}

function faceActiveCharacterTowardPlayer(state: GameState) {
  if (!state.dialogue) {
    return state.characterStates;
  }
  return faceCharacterTowardPlayer(state, state.dialogue.characterId);
}

function faceCharacterTowardPlayer(state: GameState, characterId: string) {
  const current = state.characterStates[characterId];
  if (!current) {
    return state.characterStates;
  }
  return {
    ...state.characterStates,
    [characterId]: {
      ...current,
      direction: getDirection(current.position, state.player.position),
      isMoving: false,
    },
  };
}

function getNearbyInspectableProp(state: GameState, sceneList: Scene[]) {
  const scene = getCurrentScene(state, sceneList);
  return scene.props.find((prop) => {
    if (!prop.description) {
      return false;
    }
    const propBounds = getVisiblePropRect(prop);
    const center = {
      x: propBounds.x + propBounds.width / 2,
      y: propBounds.y + propBounds.height / 2,
    };
    const interactionDistance =
      prop.id === "mission-backpack"
        ? INTERACT_DISTANCE * 2.1
        : prop.id === "lab-canvas-workstation"
          ? INTERACT_DISTANCE * 2.35
          : INTERACT_DISTANCE;
    return (
      distanceInPixels(state.player.position, center) < interactionDistance
    );
  });
}

function getCurrentScene(state: GameState, sceneList: Scene[]) {
  const scene = sceneList.find((item) => item.id === state.player.sceneId);
  if (!scene) {
    return sceneList[0] ?? scenes[0];
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

function getVisiblePropRect(prop: Scene["props"][number]): Rect {
  if (!prop.sprite) {
    return {
      height: prop.size.height,
      width: prop.size.width,
      x: prop.position.x,
      y: prop.position.y,
    };
  }
  const scale = Math.min(
    prop.size.width / prop.sprite.sw,
    prop.size.height / prop.sprite.sh,
  );
  const width = prop.sprite.sw * scale;
  const height = prop.sprite.sh * scale;
  return {
    height,
    width,
    x: prop.position.x + (prop.size.width - width) / 2,
    y: prop.position.y + (prop.size.height - height) / 2,
  };
}

function distanceInPixels(a: Position, b: Position) {
  const dx = (a.x - b.x) * TILE_SIZE;
  const dy = (a.y - b.y) * TILE_SIZE;
  return Math.sqrt(dx * dx + dy * dy);
}

function getDirection(previous: Position, next: Position): Direction {
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
