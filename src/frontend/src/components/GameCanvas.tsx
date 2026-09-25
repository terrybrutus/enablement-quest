import {
  characters,
  diagnosisOptions,
  earnedArtifactsByCase,
  earnedCanvas,
  evidenceItems,
  initialPosition,
  interventionOptions,
  scenes,
} from "@/game/levels";
import { type LoadedAssets, loadGameAssets, renderGame } from "@/game/renderer";
import type {
  CaseId,
  DiagnosisOption,
  Evidence,
  GameState,
  InterventionOption,
  OverlayKind,
  Position,
  SceneId,
} from "@/game/types";
import { MOVE_SPEED } from "@/game/types";
import { completeIntervention, useGameLoop } from "@/game/useGameLoop";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { DialoguePanel } from "./DialoguePanel";
import { Hud } from "./Hud";
import { NotificationToast } from "./NotificationToast";
import { QuestLog } from "./QuestLog";
import { TitleScreen } from "./TitleScreen";

declare global {
  interface Window {
    __EQ_QA_STATE?: {
      sceneId: SceneId;
      position: Position;
      direction: GameState["player"]["direction"];
      collectedEvidenceIds: string[];
      completedCaseIds: CaseId[];
      currentCaseId: CaseId;
      diagnosisId: string | null;
      interventionId: string | null;
      dialogue: GameState["dialogue"];
      characterStates: GameState["characterStates"];
      questStage: GameState["questStage"];
      overlay: GameState["overlay"];
    };
  }
}

function createInitialGameState(): GameState {
  const qaScene = getQaScene();
  return {
    player: {
      position: qaScene?.position ?? initialPosition,
      direction: "down",
      isMoving: false,
      sceneId: qaScene?.sceneId ?? "lab",
      hasStarted: Boolean(qaScene),
    },
    currentCaseId: qaScene?.caseId ?? "sales",
    completedCaseIds: qaScene?.caseId === "sales" ? ["onboarding"] : [],
    characterStates: Object.fromEntries(
      characters.map((character) => [
        character.id,
        {
          position: character.position,
          direction: "down",
          patrolIndex: 0,
          isMoving: false,
          pauseUntil: getCharacterPauseUntil(character.id, 0),
        },
      ]),
    ),
    questStage: qaScene?.questStage ?? "briefing",
    collectedEvidenceIds: qaScene?.collectedEvidenceIds ?? [],
    diagnosisId: qaScene?.diagnosisId ?? null,
    interventionId: qaScene?.interventionId ?? null,
    activeEvidenceId: qaScene?.activeEvidenceId ?? null,
    activeCanvasCaseId: null,
    earnedArtifact: null,
    overlay: qaScene?.overlay ?? (qaScene ? "none" : "briefing"),
    dialogue: qaScene?.dialogue ?? null,
    toast: null,
  };
}

function getCharacterPauseUntil(characterId: string, step: number) {
  return Date.now() + 700 + getCharacterPauseDuration(characterId, step);
}

function getCharacterPauseDuration(characterId: string, step: number) {
  const seed = characterId
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return 900 + ((seed + step * 397) % 1400);
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<LoadedAssets>({});
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [moveSpeed, setMoveSpeed] = useState(MOVE_SPEED);
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
    window.__EQ_QA_STATE = {
      sceneId: gameState.player.sceneId,
      position: gameState.player.position,
      direction: gameState.player.direction,
      collectedEvidenceIds: gameState.collectedEvidenceIds,
      completedCaseIds: gameState.completedCaseIds,
      currentCaseId: gameState.currentCaseId,
      diagnosisId: gameState.diagnosisId,
      interventionId: gameState.interventionId,
      dialogue: gameState.dialogue,
      characterStates: gameState.characterStates,
      questStage: gameState.questStage,
      overlay: gameState.overlay,
    };
  }, [gameState]);

  const { inputRef, interact } = useGameLoop({
    gameStateRef,
    moveSpeed,
    setGameState,
  });

  useEffect(() => loadGameAssets(setAssets), []);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          renderGame(context, canvas, gameStateRef.current, assets);
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [assets]);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const scale = window.devicePixelRatio || 1;
      if (!canvas || !container) {
        return;
      }
      canvas.width = Math.floor(container.clientWidth * scale);
      canvas.height = Math.floor(container.clientHeight * scale);
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(scale, 0, 0, scale, 0, 0);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const currentScene = useMemo(
    () =>
      scenes.find((scene) => scene.id === gameState.player.sceneId) ??
      scenes[0],
    [gameState.player.sceneId],
  );

  const activeCharacter = useMemo(() => {
    if (!gameState.dialogue) {
      return null;
    }
    return (
      characters.find(
        (character) => character.id === gameState.dialogue?.characterId,
      ) ?? null
    );
  }, [gameState.dialogue]);
  const activeEvidence = useMemo(
    () =>
      evidenceItems.find((item) => item.id === gameState.activeEvidenceId) ??
      null,
    [gameState.activeEvidenceId],
  );
  const currentEvidenceItems = useMemo(
    () =>
      evidenceItems.filter((item) => item.caseId === gameState.currentCaseId),
    [gameState.currentCaseId],
  );
  const currentCollectedEvidenceCount = useMemo(
    () =>
      currentEvidenceItems.filter((item) =>
        gameState.collectedEvidenceIds.includes(item.id),
      ).length,
    [currentEvidenceItems, gameState.collectedEvidenceIds],
  );
  const currentDiagnosisOptions = useMemo(
    () =>
      diagnosisOptions.filter(
        (item) => item.caseId === gameState.currentCaseId,
      ),
    [gameState.currentCaseId],
  );
  const currentInterventionOptions = useMemo(
    () =>
      interventionOptions.filter(
        (item) => item.caseId === gameState.currentCaseId,
      ),
    [gameState.currentCaseId],
  );
  const nextObjective = getNextObjective(
    gameState.currentCaseId,
    gameState.questStage,
    currentEvidenceItems.find(
      (item) => !gameState.collectedEvidenceIds.includes(item.id),
    )?.title ?? null,
    gameState.player.sceneId,
    gameState.completedCaseIds,
  );
  const coachPrompt = getCoachPrompt(
    gameState.currentCaseId,
    gameState.questStage,
    currentCollectedEvidenceCount,
    currentEvidenceItems.length,
    gameState.player.sceneId,
    gameState.completedCaseIds,
  );
  const hasBlockingOverlay = [
    "briefing",
    "canvas",
    "decision",
    "dialogue",
    "evidence",
  ].includes(gameState.overlay);

  const closeOverlay = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      overlay: "none",
      dialogue: null,
      activeEvidenceId: null,
    }));
  }, []);

  const setOverlay = useCallback((overlay: OverlayKind) => {
    setGameState((previous) => ({
      ...previous,
      overlay: previous.overlay === overlay ? "none" : overlay,
      dialogue: null,
      activeEvidenceId: null,
    }));
  }, []);

  const closeEvidenceReview = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      activeEvidenceId: null,
      overlay: previous.questStage === "diagnose" ? "decision" : "none",
      toast:
        previous.questStage === "diagnose"
          ? {
              id: Date.now(),
              message:
                "All evidence is saved. Return to Leo to defend the cause and choose the fix.",
            }
          : previous.toast,
    }));
  }, []);

  const startMission = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      player: {
        ...previous.player,
        hasStarted: true,
        sceneId: "lab",
        position: initialPosition,
        direction: "up",
        isMoving: false,
      },
      currentCaseId: "sales",
      questStage: "briefing",
      collectedEvidenceIds: [],
      diagnosisId: null,
      interventionId: null,
      activeEvidenceId: null,
      activeCanvasCaseId: null,
      earnedArtifact: null,
      dialogue: null,
      overlay: "none",
      toast: null,
    }));
  }, []);

  const advanceDialogue = useCallback(() => {
    setGameState((previous) => {
      if (!previous.dialogue) {
        return previous;
      }
      const character = characters.find(
        (item) => item.id === previous.dialogue?.characterId,
      );
      if (!character) {
        return { ...previous, overlay: "none", dialogue: null };
      }
      const lines = character.dialogue[previous.questStage];
      if (Date.now() - previous.dialogue.openedAt < 180) {
        return previous;
      }
      const nextIndex = previous.dialogue.lineIndex + 1;
      if (nextIndex >= lines.length) {
        const nextStage =
          previous.questStage === "briefing"
            ? "investigate"
            : previous.questStage;
        return {
          ...previous,
          questStage: nextStage,
          overlay: "none",
          dialogue: null,
          toast: previous.questStage === "briefing" ? null : previous.toast,
        };
      }
      return {
        ...previous,
        dialogue: { ...previous.dialogue, lineIndex: nextIndex },
      };
    });
  }, []);

  const backDialogue = useCallback(() => {
    setGameState((previous) => {
      if (!previous.dialogue || previous.dialogue.lineIndex === 0) {
        return previous;
      }
      return {
        ...previous,
        dialogue: {
          ...previous.dialogue,
          lineIndex: previous.dialogue.lineIndex - 1,
          openedAt: Date.now() - 1000,
        },
      };
    });
  }, []);

  useEffect(() => {
    const handleDialogueKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        gameStateRef.current.overlay === "dialogue" &&
        (key === "e" || key === "enter" || key === " ") &&
        !event.repeat
      ) {
        event.preventDefault();
        advanceDialogue();
      }
    };

    window.addEventListener("keydown", handleDialogueKeys);
    return () => window.removeEventListener("keydown", handleDialogueKeys);
  }, [advanceDialogue]);

  const chooseDiagnosis = useCallback(
    (id: string) => {
      const option = currentDiagnosisOptions.find((item) => item.id === id);
      if (!option) {
        return;
      }
      setGameState((previous) => ({
        ...previous,
        diagnosisId: id,
        questStage: option.correct ? "design" : previous.questStage,
        toast: option.correct
          ? null
          : {
              id: Date.now(),
              message:
                "Not quite. Re-check the evidence pattern before choosing a fix.",
            },
      }));
    },
    [currentDiagnosisOptions],
  );

  const chooseIntervention = useCallback(
    (id: string) => {
      const option = currentInterventionOptions.find((item) => item.id === id);
      if (!option) {
        return;
      }
      if (!option.correct) {
        setGameState((previous) => ({
          ...previous,
          interventionId: id,
          toast: {
            id: Date.now(),
            message:
              "That fix does not solve the cause yet. Try again from the evidence pattern.",
          },
        }));
        return;
      }
      setGameState((previous) => ({
        ...previous,
        interventionId: id,
      }));
      completeIntervention(setGameState);
    },
    [currentInterventionOptions],
  );

  const openCanvas = useCallback((caseId?: CaseId) => {
    setGameState((previous) => ({
      ...previous,
      activeCanvasCaseId: caseId ?? null,
      overlay: "canvas",
      dialogue: null,
      activeEvidenceId: null,
    }));
  }, []);

  const startSalesCase = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      currentCaseId: "sales",
      questStage: "briefing",
      diagnosisId: null,
      interventionId: null,
      activeEvidenceId: null,
      activeCanvasCaseId: null,
      earnedArtifact: null,
      dialogue: null,
      overlay: "none",
      toast: {
        id: Date.now(),
        message:
          "Case 02 started: talk with Leo and diagnose the sales enablement problem.",
      },
      player: {
        ...previous.player,
        hasStarted: true,
        sceneId: "sales",
        position: { x: 9, y: 10.25 },
        direction: "up",
        isMoving: false,
      },
    }));
  }, []);

  const restartCase = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      player: {
        ...previous.player,
        hasStarted: false,
        sceneId: "lab",
        position: initialPosition,
        direction: "down",
        isMoving: false,
      },
      currentCaseId: "sales",
      completedCaseIds: [],
      questStage: "briefing",
      collectedEvidenceIds: [],
      diagnosisId: null,
      interventionId: null,
      activeEvidenceId: null,
      activeCanvasCaseId: null,
      earnedArtifact: null,
      dialogue: null,
      overlay: "briefing",
      toast: null,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-50"
      data-ocid="game.root"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        data-ocid="game.canvas_target"
      />

      {gameState.player.hasStarted && !hasBlockingOverlay && (
        <Hud
          sceneName={currentScene.name}
          sceneSubtitle={currentScene.subtitle}
          questStage={gameState.questStage}
          evidenceCount={currentCollectedEvidenceCount}
          evidenceTotal={currentEvidenceItems.length}
          hasArtifact={Boolean(gameState.earnedArtifact)}
          nextObjective={nextObjective}
          coachAction={coachPrompt.action}
          coachReason={coachPrompt.reason}
          onOpenQuest={() => setOverlay("quest")}
          onOpenCaseFile={() => setOverlay("backpack")}
          onOpenSettings={() => setOverlay("settings")}
          onInteract={interact}
          onRestart={restartCase}
          inputRef={inputRef}
        />
      )}

      {!gameState.player.hasStarted && (
        <TitleScreen onStart={startMission} onClose={startMission} />
      )}

      {gameState.overlay === "briefing" && gameState.player.hasStarted && (
        <CaseBriefingPanel onClose={closeOverlay} />
      )}

      {gameState.overlay === "dialogue" &&
        activeCharacter &&
        gameState.dialogue && (
          <DialoguePanel
            character={activeCharacter}
            line={
              activeCharacter.dialogue[gameState.questStage][
                Math.min(
                  gameState.dialogue.lineIndex,
                  activeCharacter.dialogue[gameState.questStage].length - 1,
                )
              ]
            }
            lineIndex={Math.min(
              gameState.dialogue.lineIndex,
              activeCharacter.dialogue[gameState.questStage].length - 1,
            )}
            stage={gameState.questStage}
            totalLines={activeCharacter.dialogue[gameState.questStage].length}
            onAdvance={advanceDialogue}
            onBack={backDialogue}
            onClose={closeOverlay}
          />
        )}

      {gameState.overlay === "quest" && (
        <QuestLog
          currentCaseId={gameState.currentCaseId}
          questStage={gameState.questStage}
          collectedEvidenceIds={gameState.collectedEvidenceIds}
          diagnosisId={gameState.diagnosisId}
          interventionId={gameState.interventionId}
          onClose={closeOverlay}
        />
      )}

      {gameState.overlay === "backpack" && (
        <ArtifactsPanel
          collectedEvidenceIds={gameState.collectedEvidenceIds}
          completedCaseIds={gameState.completedCaseIds}
          currentCaseId={gameState.currentCaseId}
          earnedArtifact={gameState.earnedArtifact}
          onClose={closeOverlay}
          onOpenCanvas={openCanvas}
        />
      )}

      {gameState.overlay === "settings" && (
        <SettingsPanel
          moveSpeed={moveSpeed}
          onChangeMoveSpeed={setMoveSpeed}
          onClose={closeOverlay}
        />
      )}

      {gameState.overlay === "evidence" && activeEvidence && (
        <EvidencePanel
          key={activeEvidence.id}
          caseEvidence={currentEvidenceItems}
          collectedEvidenceIds={gameState.collectedEvidenceIds}
          evidence={activeEvidence}
          onContinue={closeEvidenceReview}
        />
      )}

      {gameState.overlay === "decision" && (
        <DecisionPanel
          diagnosisOptions={currentDiagnosisOptions}
          interventionOptions={currentInterventionOptions}
          diagnosisId={gameState.diagnosisId}
          interventionId={gameState.interventionId}
          currentCaseId={gameState.currentCaseId}
          onChooseDiagnosis={chooseDiagnosis}
          onChooseIntervention={chooseIntervention}
          onClose={closeOverlay}
        />
      )}

      {gameState.overlay === "canvas" && (
        <CanvasPanel
          artifact={
            gameState.activeCanvasCaseId
              ? earnedArtifactsByCase[gameState.activeCanvasCaseId]
              : (gameState.earnedArtifact ??
                earnedArtifactsByCase[gameState.currentCaseId] ??
                earnedCanvas)
          }
          canStartSalesCase={
            gameState.currentCaseId === "onboarding" &&
            gameState.completedCaseIds.includes("onboarding") &&
            !gameState.completedCaseIds.includes("sales")
          }
          showFinalDebrief={
            gameState.currentCaseId === "sales" &&
            gameState.completedCaseIds.includes("onboarding") &&
            gameState.completedCaseIds.includes("sales")
          }
          onClose={closeOverlay}
          onStartSalesCase={startSalesCase}
        />
      )}

      {gameState.toast && (
        <NotificationToast
          toast={gameState.toast}
          onDismiss={() =>
            setGameState((previous) => ({ ...previous, toast: null }))
          }
        />
      )}
    </div>
  );
}

function CaseBriefingPanel({ onClose }: { onClose: () => void }) {
  return (
    <section
      className="eq-overlay eq-panel eq-start-briefing"
      aria-label="Atlas Pro case briefing"
    >
      <p className="eq-kicker">Case Start</p>
      <h2>Find Out Why Sales Are Not Closing</h2>
      <p className="eq-start-briefing-lede">
        Atlas Pro is below its expected win rate. Leadership suspects more
        product training is needed, but your job is to investigate before
        choosing a solution.
      </p>

      <aside className="eq-start-briefing-mission" aria-label="Mission goal">
        <strong>Your mission</strong>
        <span>
          Help the organization solve the work problem, not just respond to the
          training request. Follow the evidence, name the cause, choose the
          enablement response, and explain the business impact.
        </span>
      </aside>

      <div className="eq-start-briefing-grid">
        <article>
          <strong>1. Start with Leo</strong>
          <span>
            Leave the lab, enter the Sales Enablement Studio, and talk with Leo.
            He explains what leaders are asking for.
          </span>
        </article>
        <article>
          <strong>2. Investigate across rooms</strong>
          <span>
            Collect the deck, discovery guide, call review, operations data, CRM
            review, and coaching archive. Each evidence item tests a different
            explanation.
          </span>
        </article>
        <article>
          <strong>3. Make the recommendation</strong>
          <span>
            Return to Leo. Choose the cause that explains the whole pattern,
            then pick the fix that changes behavior and can be measured.
          </span>
        </article>
        <article>
          <strong>If you feel lost</strong>
          <span>
            Open Help. It always says what to do now, why it matters, and what
            counts as done.
          </span>
        </article>
      </div>

      <div className="eq-start-briefing-controls">
        <span>Move: arrows, WASD, or joystick</span>
        <span>Talk or inspect: E, Space, Enter, or button</span>
        <span>Help anytime: Q or Help</span>
      </div>

      <button className="eq-primary-button" type="button" onClick={onClose}>
        Begin the investigation
      </button>
    </section>
  );
}

function getQaScene(): {
  caseId: GameState["currentCaseId"];
  activeEvidenceId?: string | null;
  collectedEvidenceIds?: string[];
  diagnosisId?: string | null;
  dialogue?: GameState["dialogue"];
  interventionId?: string | null;
  overlay?: GameState["overlay"];
  position: Position;
  questStage?: GameState["questStage"];
  sceneId: SceneId;
} | null {
  if (typeof window === "undefined") {
    return null;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const sceneId = searchParams.get("qaScene");
  const qaStage = searchParams.get("qaStage");
  const qaDialogue = searchParams.get("qaDialogue");
  const qaDiagnosis = searchParams.get("qaDiagnosis");
  const qaEvidence = searchParams.get("qaEvidence");
  const qaIntervention = searchParams.get("qaIntervention");
  if (sceneId === "operations") {
    const caseId = "onboarding" as const;
    return {
      sceneId,
      caseId,
      position: { x: 9, y: 10.25 },
      ...getQaDialogueState("maya", qaDialogue),
      ...getQaEvidenceState(caseId, qaEvidence),
      ...getQaStageState(caseId, qaStage, qaDiagnosis, qaIntervention),
    };
  }
  if (sceneId === "sales") {
    const caseId = "sales" as const;
    return {
      sceneId,
      caseId,
      position: { x: 9, y: 10.25 },
      ...getQaDialogueState("leo", qaDialogue),
      ...getQaEvidenceState(caseId, qaEvidence),
      ...getQaStageState(caseId, qaStage, qaDiagnosis, qaIntervention),
    };
  }
  if (sceneId === "hub") {
    return {
      sceneId,
      caseId: "onboarding" as const,
      position: { x: 12.75, y: 9.8 },
    };
  }
  return null;
}

function getQaEvidenceState(
  caseId: GameState["currentCaseId"],
  qaEvidence: string | null,
) {
  if (!qaEvidence) {
    return {};
  }
  const caseEvidence = evidenceItems.filter((item) => item.caseId === caseId);
  const evidenceIndex = caseEvidence.findIndex(
    (item) => item.id === qaEvidence,
  );
  if (evidenceIndex < 0) {
    return {};
  }
  return {
    activeEvidenceId: qaEvidence,
    collectedEvidenceIds: caseEvidence
      .slice(0, evidenceIndex)
      .map((item) => item.id),
    overlay: "evidence" as const,
    questStage: "investigate" as const,
  };
}

function getQaDialogueState(characterId: string, qaDialogue: string | null) {
  if (qaDialogue !== characterId) {
    return {};
  }
  return {
    dialogue: {
      characterId,
      lineIndex: 0,
      openedAt: Date.now() - 1000,
    },
    overlay: "dialogue" as const,
  };
}

function getQaStageState(
  caseId: GameState["currentCaseId"],
  qaStage: string | null,
  qaDiagnosis: string | null,
  qaIntervention: string | null,
) {
  if (qaStage !== "diagnose" && qaStage !== "design") {
    return {};
  }
  const collectedEvidenceIds = evidenceItems
    .filter((item) => item.caseId === caseId)
    .map((item) => item.id);
  const correctDiagnosis = diagnosisOptions.find(
    (option) => option.caseId === caseId && option.correct,
  );
  const wrongDiagnosis = diagnosisOptions.find(
    (option) => option.caseId === caseId && !option.correct,
  );
  const correctIntervention = interventionOptions.find(
    (option) => option.caseId === caseId && option.correct,
  );
  const wrongIntervention = interventionOptions.find(
    (option) => option.caseId === caseId && !option.correct,
  );
  const diagnosisId =
    qaDiagnosis === "wrong"
      ? (wrongDiagnosis?.id ?? null)
      : qaStage === "design" || qaDiagnosis === "correct"
        ? (correctDiagnosis?.id ?? null)
        : null;
  const interventionId =
    qaIntervention === "wrong"
      ? (wrongIntervention?.id ?? null)
      : qaIntervention === "correct"
        ? (correctIntervention?.id ?? null)
        : null;
  return {
    collectedEvidenceIds,
    diagnosisId,
    interventionId,
    overlay: "decision" as const,
    questStage: qaStage as GameState["questStage"],
  };
}

function getNextObjective(
  caseId: GameState["currentCaseId"],
  questStage: GameState["questStage"],
  nextEvidenceTitle: string | null,
  sceneId: GameState["player"]["sceneId"],
  completedCaseIds: GameState["completedCaseIds"],
) {
  if (questStage === "briefing") {
    if (caseId === "sales") {
      return sceneId === "sales"
        ? "Talk with Leo to hear why leaders are worried about Atlas Pro sales."
        : sceneId === "lab"
          ? "Optional: inspect the glowing lab objects, then exit to the campus and find Leo."
          : "Find Leo inside and hear why leaders are worried about Atlas Pro sales.";
    }
    return sceneId === "operations"
      ? "Step 1: talk with Maya. Listen to the training request, then question whether training is enough."
      : "Enter Operations Suite and talk with Maya.";
  }
  if (questStage === "investigate") {
    if (nextEvidenceTitle) {
      const nextLocation = getEvidenceLocation(
        caseId,
        nextEvidenceTitle,
        sceneId,
      );
      return `Review ${nextEvidenceTitle}. ${nextLocation}`;
    }
    return `All evidence is collected. Bring your findings back to ${caseId === "sales" ? "Leo" : "Maya"} to choose the cause.`;
  }
  if (questStage === "diagnose") {
    return `Stand near ${caseId === "sales" ? "Leo" : "Maya"} and choose the cause that best fits the evidence.`;
  }
  if (questStage === "design") {
    return "Choose the fix you would recommend to the business.";
  }
  if (caseId === "onboarding" && !completedCaseIds.includes("sales")) {
    return "Step 5: review the case summary. It shows the before, decision, fix, and impact.";
  }
  return "Case complete: review the Atlas Pro recommendation and the business impact story.";
}

function getCoachPrompt(
  caseId: GameState["currentCaseId"],
  questStage: GameState["questStage"],
  evidenceCount: number,
  evidenceTotal: number,
  sceneId: GameState["player"]["sceneId"],
  completedCaseIds: GameState["completedCaseIds"],
) {
  const caseOwner = caseId === "sales" ? "Leo" : "Maya";
  const room = caseId === "sales" ? "Sales Enablement Studio" : "Operations";

  if (questStage === "briefing") {
    return sceneId === (caseId === "sales" ? "sales" : "operations")
      ? {
          action: `Talk with ${caseOwner}`,
          reason:
            "Start by hearing what leaders asked for and what problem they see.",
        }
      : {
          action:
            sceneId === "lab" ? "Explore or exit the lab" : `Go to ${room}`,
          reason: "Start with the request, then verify it with evidence.",
        };
  }

  if (questStage === "investigate") {
    return evidenceCount < evidenceTotal
      ? {
          action: `Review evidence ${evidenceCount + 1} of ${evidenceTotal}`,
          reason:
            "Use each evidence item to decide what is proven and what still needs support.",
        }
      : {
          action: `Return to ${caseOwner}`,
          reason:
            "Bring your evidence back to the person who asked for help before you recommend a cause.",
        };
  }

  if (questStage === "diagnose") {
    return {
      action: `Stand near ${caseOwner}`,
      reason: "The best answer should fit the evidence you collected.",
    };
  }

  if (questStage === "design") {
    return {
      action: "Choose the fix",
      reason:
        "Pick the option that would improve the work and give leaders something to measure.",
    };
  }

  if (caseId === "onboarding" && !completedCaseIds.includes("sales")) {
    return {
      action: "Review the case summary",
      reason:
        "The summary turns the playthrough into a teachable client recommendation: problem, decision, fix, and impact.",
    };
  }

  return {
    action: "Review the case summary",
    reason: "You finished the case. Review the summary or start over.",
  };
}

function getEvidenceLocation(
  caseId: GameState["currentCaseId"],
  evidenceTitle: string,
  currentSceneId: GameState["player"]["sceneId"],
) {
  const evidence = evidenceItems.find(
    (item) => item.caseId === caseId && item.title === evidenceTitle,
  );
  if (!evidence) {
    return "";
  }
  if (evidence.sceneId === currentSceneId) {
    return "Look for the marked evidence in this room.";
  }
  if (evidence.sceneId === "operations") {
    return "Go to the Operations Suite to find it.";
  }
  if (evidence.sceneId === "sales") {
    return "Find it inside the Sales Enablement Studio.";
  }
  return "";
}

function EvidencePanel({
  caseEvidence,
  collectedEvidenceIds,
  evidence,
  onContinue,
}: {
  caseEvidence: Evidence[];
  collectedEvidenceIds: string[];
  evidence: Evidence;
  onContinue: () => void;
}) {
  const [selectedSignal, setSelectedSignal] = useState<
    "ignore" | "signal" | "trap" | null
  >(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedSupportKind, setSelectedSupportKind] = useState<string | null>(
    null,
  );
  const [supportAttemptCount, setSupportAttemptCount] = useState(0);
  const [isSupportRevealed, setIsSupportRevealed] = useState(false);
  const evidenceIndex = caseEvidence.findIndex(
    (item) => item.id === evidence.id,
  );
  const priorEvidence = caseEvidence.filter(
    (item) => item.id !== evidence.id && collectedEvidenceIds.includes(item.id),
  );
  const hasReadCorrectly = selectedSignal === "signal";
  const hasSupportCorrectly = selectedSupportKind === evidence.supportKind;
  const canReveal = attemptCount >= 2 && !hasReadCorrectly && !isRevealed;
  const canRevealSupport =
    supportAttemptCount >= 2 && !hasSupportCorrectly && !isSupportRevealed;
  const canContinue = hasReadCorrectly && hasSupportCorrectly;
  const checkOptions = useMemo(() => {
    const options = [
      {
        kind: "signal" as const,
        label: evidence.signal,
        feedback: evidence.signalFeedback,
      },
      {
        kind: "trap" as const,
        label: evidence.trap,
        feedback: evidence.trapFeedback,
      },
      {
        kind: "ignore" as const,
        label: evidence.partial,
        feedback: evidence.partialFeedback,
      },
    ];
    if (evidence.id.length % 3 === 0) {
      return [options[1], options[2], options[0]];
    }
    if (evidence.id.length % 2 === 0) {
      return [options[2], options[0], options[1]];
    }
    return options;
  }, [
    evidence.id,
    evidence.partial,
    evidence.partialFeedback,
    evidence.signal,
    evidence.signalFeedback,
    evidence.trap,
    evidence.trapFeedback,
  ]);
  const handleSelectSignal = useCallback(
    (kind: "ignore" | "signal" | "trap") => {
      setSelectedSignal(kind);
      setIsRevealed(false);
      setAttemptCount((current) => (kind === "signal" ? current : current + 1));
    },
    [],
  );
  const revealStrongestRead = useCallback(() => {
    setSelectedSignal("signal");
    setIsRevealed(true);
  }, []);
  const handleSelectSupportKind = useCallback(
    (kind: string) => {
      setSelectedSupportKind(kind);
      setIsSupportRevealed(false);
      setSupportAttemptCount((current) =>
        kind === evidence.supportKind ? current : current + 1,
      );
    },
    [evidence.supportKind],
  );
  const revealSupportKind = useCallback(() => {
    setSelectedSupportKind(evidence.supportKind);
    setIsSupportRevealed(true);
  }, [evidence.supportKind]);

  useEffect(() => {
    const handleEvidenceKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "1") {
        event.preventDefault();
        handleSelectSignal(checkOptions[0].kind);
        return;
      }
      if (key === "2") {
        event.preventDefault();
        handleSelectSignal(checkOptions[1].kind);
        return;
      }
      if (key === "3") {
        event.preventDefault();
        handleSelectSignal(checkOptions[2].kind);
        return;
      }
      if (key === "r" && canReveal) {
        event.preventDefault();
        revealStrongestRead();
        return;
      }
      if ((key === " " || key === "enter") && canContinue) {
        event.preventDefault();
        onContinue();
      }
    };

    window.addEventListener("keydown", handleEvidenceKey);
    return () => window.removeEventListener("keydown", handleEvidenceKey);
  }, [
    canContinue,
    canReveal,
    checkOptions,
    handleSelectSignal,
    onContinue,
    revealStrongestRead,
  ]);

  return (
    <section
      className="eq-overlay eq-panel eq-evidence"
      aria-label={evidence.title}
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Evidence Reviewed</p>
          <h2>{evidence.title}</h2>
          <p>
            Evidence {evidenceIndex + 1} of {caseEvidence.length}
            {evidence.metric ? ` | ${evidence.metric}` : ""}
          </p>
        </div>
      </div>

      <aside className="eq-running-case" aria-label="Running case pattern">
        <div>
          <p className="eq-kicker">Pattern So Far</p>
          <h3>
            {priorEvidence.length > 0
              ? "What you have already saved"
              : "Nothing saved yet"}
          </h3>
        </div>
        {priorEvidence.length > 0 ? (
          <ol>
            {priorEvidence.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.signal}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>
            After you save evidence, it will appear here so you can see the
            pattern building.
          </p>
        )}
      </aside>

      <article className="eq-evidence-main-read">
        <h3>What you found</h3>
        <p>{evidence.summary}</p>
        <strong>What it may mean</strong>
        <span>{evidence.insight}</span>
      </article>

      <div className="eq-evidence-check">
        <div>
          <p className="eq-kicker">Check Your Read</p>
          <h3>What is the best read of this evidence?</h3>
          <p>
            Choose the interpretation that best fits this evidence. If your
            first read is off, use the feedback and try again.
          </p>
        </div>
        {checkOptions.map((option, index) => (
          <button
            className={`eq-choice ${selectedSignal === option.kind ? "is-selected" : ""}`}
            key={option.kind}
            type="button"
            onClick={() => handleSelectSignal(option.kind)}
          >
            <kbd>{index + 1}</kbd>
            <span>{option.label}</span>
            {selectedSignal === option.kind && <small>{option.feedback}</small>}
          </button>
        ))}
      </div>

      {selectedSignal && !hasReadCorrectly && (
        <aside
          className="eq-evidence-takeaway is-warning"
          aria-label="Evidence coaching"
        >
          <strong>
            {canReveal ? "Need the strongest read?" : "Try again"}
          </strong>
          <span>
            {canReveal
              ? "You have tested two interpretations. You can reveal the strongest read, then save the teaching point."
              : "This answer explains part of the evidence, but not the strongest pattern. Compare it with the other options before moving on."}
          </span>
          {canReveal && (
            <button
              className="eq-ghost-button"
              type="button"
              onClick={revealStrongestRead}
            >
              Reveal strongest read
            </button>
          )}
        </aside>
      )}

      {hasReadCorrectly && (
        <aside
          className={`eq-evidence-takeaway ${isRevealed ? "is-revealed" : ""}`}
          aria-label="Evidence takeaway"
        >
          <strong>
            {isRevealed ? "Strongest read revealed" : "Best read selected"}
          </strong>
          <span>{`This evidence now supports your diagnosis: ${evidence.signal}`}</span>
        </aside>
      )}

      {hasReadCorrectly && (
        <div className="eq-evidence-check">
          <div>
            <p className="eq-kicker">Defend Your Read</p>
            <h3>What kind of evidence supports that conclusion?</h3>
            <p>
              Pick the reason this evidence matters. This is what makes the
              recommendation defensible later.
            </p>
          </div>
          {getSupportKindOptions(evidence.supportKind).map((kind, index) => (
            <button
              className={`eq-choice ${selectedSupportKind === kind ? "is-selected" : ""}`}
              key={kind}
              type="button"
              onClick={() => handleSelectSupportKind(kind)}
            >
              <kbd>{index + 1}</kbd>
              <span>{kind}</span>
              {selectedSupportKind === kind && (
                <small>
                  {kind === evidence.supportKind
                    ? evidence.supportFeedback
                    : "This may be relevant somewhere else, but it is not what this evidence mainly proves."}
                </small>
              )}
            </button>
          ))}
        </div>
      )}

      {hasReadCorrectly && selectedSupportKind && !hasSupportCorrectly && (
        <aside
          className="eq-evidence-takeaway is-warning"
          aria-label="Evidence support coaching"
        >
          <strong>
            {canRevealSupport
              ? "Need the support category?"
              : "Defend it again"}
          </strong>
          <span>
            {canRevealSupport
              ? "You have tested two support categories. Reveal the category, then save the evidence."
              : "The read is right, but the support category is off. Ask what this evidence mainly proves."}
          </span>
          {canRevealSupport && (
            <button
              className="eq-ghost-button"
              type="button"
              onClick={revealSupportKind}
            >
              Reveal support category
            </button>
          )}
        </aside>
      )}

      {hasReadCorrectly && hasSupportCorrectly && (
        <aside
          className={`eq-evidence-takeaway ${
            isSupportRevealed ? "is-revealed" : ""
          }`}
          aria-label="Evidence defended"
        >
          <strong>
            {isSupportRevealed
              ? "Support category revealed"
              : "Evidence defended"}
          </strong>
          <span>{evidence.supportFeedback}</span>
        </aside>
      )}

      <button
        className="eq-primary-button mt-4"
        disabled={!canContinue}
        type="button"
        onClick={onContinue}
      >
        {canContinue
          ? "Save evidence and continue"
          : hasReadCorrectly
            ? "Defend the evidence read to continue"
            : "Choose the best evidence read to continue"}
      </button>
    </section>
  );
}

const SUPPORT_KIND_OPTIONS = [
  "Business metric",
  "Observed sales behavior",
  "Sales behavior support",
  "Content / message quality",
  "Manager reinforcement",
  "Pipeline data quality",
  "Workflow / process",
  "Workflow / manager reinforcement",
];

function getSupportKindOptions(correctKind: string) {
  const distractors = SUPPORT_KIND_OPTIONS.filter(
    (kind) => kind !== correctKind,
  )
    .sort((first, second) => first.localeCompare(second))
    .slice(0, 2);
  return [correctKind, ...distractors].sort((first, second) =>
    first.localeCompare(second),
  );
}

function SettingsPanel({
  moveSpeed,
  onChangeMoveSpeed,
  onClose,
}: {
  moveSpeed: number;
  onChangeMoveSpeed: (speed: number) => void;
  onClose: () => void;
}) {
  return (
    <section
      className="eq-overlay eq-panel eq-side-panel is-right"
      aria-label="Settings"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Settings</p>
          <h2>Play Options</h2>
          <p>Adjust movement without changing the case.</p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <label className="eq-setting-row">
        <span>
          <strong>Movement speed</strong>
          <small>{moveSpeed.toFixed(1)} tiles/sec</small>
        </span>
        <input
          max="7"
          min="2.5"
          step="0.1"
          type="range"
          value={moveSpeed}
          onChange={(event) => onChangeMoveSpeed(Number(event.target.value))}
        />
      </label>

      <div className="eq-mini-section">
        <h3>Controls</h3>
        <p>
          Desktop: WASD or arrow keys to move. E, Space, or Enter to talk or
          inspect.
        </p>
        <p>Mobile: use the joystick and Talk or Inspect button.</p>
      </div>
    </section>
  );
}

function DecisionPanel({
  diagnosisOptions,
  interventionOptions,
  diagnosisId,
  interventionId,
  currentCaseId,
  onChooseDiagnosis,
  onChooseIntervention,
  onClose,
}: {
  diagnosisOptions: DiagnosisOption[];
  interventionOptions: InterventionOption[];
  diagnosisId: string | null;
  interventionId: string | null;
  currentCaseId: CaseId;
  onChooseDiagnosis: (id: string) => void;
  onChooseIntervention: (id: string) => void;
  onClose: () => void;
}) {
  const selectedDiagnosis = diagnosisOptions.find(
    (option) => option.id === diagnosisId,
  );
  const selectedIntervention = interventionOptions.find(
    (option) => option.id === interventionId,
  );
  const canChooseIntervention = selectedDiagnosis?.correct ?? false;
  const synthesis = caseSynthesis[currentCaseId];
  const [decisionStep, setDecisionStep] = useState<"cause" | "fix">(
    canChooseIntervention ? "fix" : "cause",
  );

  useEffect(() => {
    if (canChooseIntervention) {
      setDecisionStep("fix");
    }
  }, [canChooseIntervention]);

  const isFixStep = decisionStep === "fix";
  const visibleOptions = isFixStep ? interventionOptions : diagnosisOptions;

  return (
    <section
      className="eq-overlay eq-panel eq-decision"
      aria-label="Decision panel"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Make the Recommendation</p>
          <h2>{isFixStep ? "Pick the practical fix" : synthesis.question}</h2>
          <p>
            {isFixStep
              ? "Now choose the support that changes the work and can be measured."
              : "Choose the cause that best explains the evidence."}
          </p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="eq-decision-stepper" aria-label="Recommendation step">
        <span className={decisionStep === "cause" ? "is-active" : ""}>
          1. Cause
        </span>
        <span className={decisionStep === "fix" ? "is-active" : ""}>
          2. Fix
        </span>
        {isFixStep && (
          <button
            className="eq-ghost-button"
            type="button"
            onClick={() => setDecisionStep("cause")}
          >
            Back to cause
          </button>
        )}
      </div>

      <aside className="eq-decision-brief" aria-label="Decision hint">
        <strong>{isFixStep ? "Fix test" : "Cause test"}</strong>
        <span>{isFixStep ? synthesis.metric : synthesis.pattern}</span>
      </aside>

      <div className="eq-decision-options">
        {visibleOptions.map((option) => {
          const selected = isFixStep
            ? interventionId === option.id
            : diagnosisId === option.id;
          const disabled = isFixStep && !canChooseIntervention;
          return (
            <button
              className={`eq-choice ${selected ? "is-selected" : ""}`}
              disabled={disabled}
              key={option.id}
              type="button"
              onClick={() =>
                isFixStep
                  ? onChooseIntervention(option.id)
                  : onChooseDiagnosis(option.id)
              }
            >
              <span>{option.label}</span>
              {selected && (
                <small>
                  {option.explanation}
                  <span className="eq-choice-consequence">
                    {isFixStep
                      ? `Tradeoff: ${(option as InterventionOption).tradeoff}`
                      : `Evidence check: ${(option as DiagnosisOption).evidenceHint}`}
                  </span>
                </small>
              )}
            </button>
          );
        })}
      </div>

      {(selectedDiagnosis || selectedIntervention) && (
        <DecisionCoach
          selectedDiagnosis={selectedDiagnosis}
          selectedIntervention={selectedIntervention}
          canChooseIntervention={canChooseIntervention}
        />
      )}
    </section>
  );
}

function DecisionCoach({
  selectedDiagnosis,
  selectedIntervention,
  canChooseIntervention,
}: {
  selectedDiagnosis: DiagnosisOption | undefined;
  selectedIntervention: InterventionOption | undefined;
  canChooseIntervention: boolean;
}) {
  if (!selectedDiagnosis) {
    return (
      <aside className="eq-decision-coach" aria-label="Decision coaching">
        <strong>How to decide</strong>
        <span>
          Imagine you are in a stakeholder meeting. Pick the answer you could
          defend with evidence, not the one that sounds easiest to build.
        </span>
      </aside>
    );
  }

  if (!canChooseIntervention) {
    return (
      <aside
        className="eq-decision-coach is-warning"
        aria-label="Decision coaching"
      >
        <strong>Re-check the evidence</strong>
        <span>
          This answer misses part of the system. Before choosing a fix, make
          sure the cause explains every evidence item, not just the loudest
          request.
        </span>
        <small>Lesson: {selectedDiagnosis.learningTakeaway}</small>
      </aside>
    );
  }

  if (!selectedIntervention) {
    return (
      <aside
        className="eq-decision-coach is-success"
        aria-label="Decision coaching"
      >
        <strong>Good diagnosis</strong>
        <span>
          Now choose the fix that changes the work, reinforces the behavior, and
          gives leaders a useful metric.
        </span>
        <small>Lesson: {selectedDiagnosis.learningTakeaway}</small>
      </aside>
    );
  }

  return (
    <aside
      className={`eq-decision-coach ${selectedIntervention.correct ? "is-success" : "is-warning"}`}
      aria-label="Decision coaching"
    >
      <strong>
        {selectedIntervention.correct ? "Strong fix" : "Not enough yet"}
      </strong>
      <span>
        {selectedIntervention.correct
          ? "This fix fits the evidence and connects enablement work to a business signal."
          : "This fix leaves at least one important evidence item unresolved."}
      </span>
      <small>Lesson: {selectedIntervention.learningTakeaway}</small>
    </aside>
  );
}

const caseSynthesis: Record<
  CaseId,
  {
    metric: string;
    pattern: string;
    prompt: string;
    question: string;
    trap: string;
  }
> = {
  onboarding: {
    question: "Is this really a training problem?",
    prompt:
      "Leadership asked for more training. Your job is to decide whether the evidence supports that request or points somewhere else.",
    pattern:
      "Your answer must explain conflicting instructions, delayed access, and a support-ticket spike after orientation.",
    trap: "A polished course would look responsive, but it may leave ownership and follow-up untouched.",
    metric:
      "The business wants faster time-to-productivity and fewer support tickets after orientation.",
  },
  sales: {
    question: "Why are interested customers not buying Atlas Pro?",
    prompt:
      "The CRO asked whether Sales needs more training. Your job is to decide what the evidence actually supports.",
    pattern:
      "Your answer must explain the feature-heavy deck, shallow discovery, low win rate, unclear loss notes, and inconsistent manager coaching.",
    trap: "A refresher course may look responsive while leaving discovery, coaching, and inspection unchanged.",
    metric:
      "The business wants Atlas Pro win rate moving toward 30%, stronger discovery quality, and visible manager coaching.",
  },
};

function CanvasPanel({
  artifact,
  canStartSalesCase,
  showFinalDebrief,
  onClose,
  onStartSalesCase,
}: {
  artifact: NonNullable<GameState["earnedArtifact"]>;
  canStartSalesCase: boolean;
  showFinalDebrief: boolean;
  onClose: () => void;
  onStartSalesCase: () => void;
}) {
  const businessProblem = getArtifactSection(artifact, "Business Problem");
  const rootCause = getArtifactSection(artifact, "Root Cause");
  const intervention = getArtifactSection(artifact, "Intervention");
  const impact = getArtifactSection(artifact, "Expected Impact");
  const showCompletionProof =
    showFinalDebrief || artifact.id === "sales-enablement-impact-canvas";
  const summaryCards = [
    {
      label: "1 of 4",
      title: "Request",
      value: businessProblem,
    },
    {
      label: "2 of 4",
      title: "Cause",
      value: rootCause,
    },
    {
      label: "3 of 4",
      title: "Fix",
      value: intervention,
    },
    {
      label: "4 of 4",
      title: "Impact",
      value: impact,
    },
  ];
  const [summaryIndex, setSummaryIndex] = useState(0);
  const activeSummary = summaryCards[summaryIndex];

  return (
    <section
      className="eq-overlay eq-panel eq-canvas"
      aria-label={artifact.title}
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Case Complete</p>
          <h2>{artifact.title}</h2>
          <p>
            You finished the recommendation. Use this summary to review what you
            decided.
          </p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <section className="eq-summary-step" aria-label="Case summary step">
        <p className="eq-kicker">{activeSummary.label}</p>
        <h3>{activeSummary.title}</h3>
        <p>{activeSummary.value}</p>
        <div className="eq-summary-step-actions">
          <button
            className="eq-ghost-button"
            disabled={summaryIndex === 0}
            type="button"
            onClick={() => setSummaryIndex((index) => Math.max(0, index - 1))}
          >
            Back
          </button>
          <button
            className="eq-primary-button"
            disabled={summaryIndex === summaryCards.length - 1}
            type="button"
            onClick={() =>
              setSummaryIndex((index) =>
                Math.min(summaryCards.length - 1, index + 1),
              )
            }
          >
            Next
          </button>
        </div>
      </section>

      <SummaryBridge artifact={artifact} />

      {canStartSalesCase && (
        <aside className="eq-next-case" aria-label="Next case">
          <div>
            <p className="eq-kicker">Next case</p>
            <h3>Ready for the sales enablement version?</h3>
            <p>
              Case 01 proves performance-consulting judgment. Case 02 applies
              the same pattern to revenue behavior: discovery quality, manager
              coaching, and pipeline impact.
            </p>
          </div>
          <button
            className="eq-primary-button"
            type="button"
            onClick={onStartSalesCase}
          >
            Start Case 02: Sales Enablement
          </button>
        </aside>
      )}

      {showCompletionProof && <FinalReviewerDebrief />}
    </section>
  );
}

function SummaryBridge({
  artifact,
}: {
  artifact: NonNullable<GameState["earnedArtifact"]>;
}) {
  const debrief = artifact.learnerDebrief;
  return (
    <aside className="eq-summary-bridge" aria-label="What you practiced">
      <div>
        <p className="eq-kicker">What you practiced</p>
        <h3>Decision loop completed</h3>
      </div>
      <ol>
        {(debrief?.points ?? []).map((point) => (
          <li key={point.label}>
            <strong>{point.label}</strong>
            <span>{point.value}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function getArtifactSection(
  artifact: NonNullable<GameState["earnedArtifact"]>,
  label: string,
) {
  return (
    artifact.sections.find((section) => section.label === label)?.value ??
    "Not captured yet."
  );
}

function FinalReviewerDebrief() {
  return (
    <aside className="eq-final-debrief" aria-label="Facilitator debrief">
      <p className="eq-kicker">Facilitator debrief</p>
      <h3>Diagnose before designing.</h3>
      <div className="eq-final-debrief-grid">
        <article>
          <strong>What changed?</strong>
          <span>
            The learner questioned the request before choosing a solution.
          </span>
        </article>
        <article>
          <strong>What made it work?</strong>
          <span>
            Evidence pointed to behavior, workflow, coaching, and measurement.
          </span>
        </article>
        <article>
          <strong>Try this next</strong>
          <span>
            Pick one real request and ask: what evidence would prove the actual
            cause?
          </span>
        </article>
      </div>
    </aside>
  );
}
