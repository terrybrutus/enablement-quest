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
    currentCaseId: qaScene?.caseId ?? "onboarding",
    completedCaseIds: qaScene?.caseId === "sales" ? ["onboarding"] : [],
    characterStates: Object.fromEntries(
      characters.map((character) => [
        character.id,
        {
          position: character.position,
          direction: "down",
          patrolIndex: 0,
          isMoving: false,
        },
      ]),
    ),
    questStage: qaScene?.questStage ?? "briefing",
    collectedEvidenceIds: qaScene?.collectedEvidenceIds ?? [],
    diagnosisId: qaScene?.diagnosisId ?? null,
    interventionId: qaScene?.interventionId ?? null,
    activeEvidenceId: null,
    activeCanvasCaseId: null,
    earnedArtifact: null,
    overlay: qaScene?.overlay ?? (qaScene ? "none" : "briefing"),
    dialogue: null,
    toast: null,
  };
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
    currentCollectedEvidenceCount,
    currentEvidenceItems.length,
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
                "Step 3 of 5: all evidence is reviewed. Press Talk / Inspect anywhere to choose the root cause.",
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
        sceneId: "operations",
        position: { x: 9, y: 6.45 },
        direction: "up",
        isMoving: false,
      },
      currentCaseId: "onboarding",
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
                "Not quite. Re-check the evidence pattern before choosing a solution.",
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
              "That solution does not fix the root cause yet. Try again from the evidence pattern.",
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
          inputRef={inputRef}
        />
      )}

      {!gameState.player.hasStarted && (
        <TitleScreen onStart={startMission} onClose={startMission} />
      )}

      {gameState.overlay === "briefing" && gameState.player.hasStarted && (
        <TitleScreen onStart={startMission} onClose={closeOverlay} />
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
            totalLines={activeCharacter.dialogue[gameState.questStage].length}
            onAdvance={advanceDialogue}
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

function getQaScene(): {
  caseId: GameState["currentCaseId"];
  collectedEvidenceIds?: string[];
  diagnosisId?: string | null;
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
  const qaDiagnosis = searchParams.get("qaDiagnosis");
  const qaIntervention = searchParams.get("qaIntervention");
  if (sceneId === "operations") {
    const caseId = "onboarding" as const;
    return {
      sceneId,
      caseId,
      position: { x: 9, y: 10.25 },
      ...getQaStageState(caseId, qaStage, qaDiagnosis, qaIntervention),
    };
  }
  if (sceneId === "sales") {
    const caseId = "sales" as const;
    return {
      sceneId,
      caseId,
      position: { x: 9, y: 10.25 },
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
  evidenceCount: number,
  evidenceTotal: number,
  nextEvidenceTitle: string | null,
  sceneId: GameState["player"]["sceneId"],
  completedCaseIds: GameState["completedCaseIds"],
) {
  if (questStage === "briefing") {
    if (caseId === "sales") {
      return sceneId === "sales"
        ? "Step 1 of 5: talk with Leo. Listen for the sales problem, then look for the real cause."
        : "Optional advanced case: enter Sales Strategy Studio and talk with Leo.";
    }
    return sceneId === "operations"
      ? "Step 1 of 5: talk with Maya. Listen to the training request, then question whether training is enough."
      : "Enter Operations Suite and talk with Maya.";
  }
  if (questStage === "investigate") {
    return nextEvidenceTitle
      ? `Step 2 of 5: review ${nextEvidenceTitle}. Evidence ${evidenceCount + 1} of ${evidenceTotal}.`
      : `All evidence reviewed: ${evidenceCount}/${evidenceTotal}. Press Talk / Inspect anywhere to choose the root cause.`;
  }
  if (questStage === "diagnose") {
    return "Step 3 of 5: press Talk / Inspect anywhere, then choose the root cause that explains all the evidence.";
  }
  if (questStage === "design") {
    return "Step 4 of 5: press Talk / Inspect anywhere, then choose the solution that changes behavior and creates a useful metric.";
  }
  if (caseId === "onboarding" && !completedCaseIds.includes("sales")) {
    return "Step 5 of 5: review the case summary. It shows the before, decision, solution, and impact.";
  }
  return "Case complete: review both summaries and the business impact story.";
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
  const room = caseId === "sales" ? "Sales Studio" : "Operations";

  if (questStage === "briefing") {
    return sceneId === (caseId === "sales" ? "sales" : "operations")
      ? {
          action: `Talk with ${caseOwner}`,
          reason:
            "real enablement starts by understanding the business request before building a solution.",
        }
      : {
          action: `Enter ${room}`,
          reason:
            "the case begins with the person asking for help, not with a template or course idea.",
        };
  }

  if (questStage === "investigate") {
    return evidenceCount < evidenceTotal
      ? {
          action: `Review evidence ${evidenceCount + 1} of ${evidenceTotal}`,
          reason:
            "each evidence item helps you separate the real performance problem from the tempting quick fix.",
        }
      : {
          action: "Choose the root cause",
          reason:
            "a good diagnosis explains all evidence at once, not just the loudest complaint.",
        };
  }

  if (questStage === "diagnose") {
    return {
      action: "Choose the root cause",
      reason:
        "this is where you prove judgment: training is only right when the evidence shows a knowledge or skill gap.",
    };
  }

  if (questStage === "design") {
    return {
      action: "Choose the intervention",
      reason:
        "the best solution changes daily work and gives leaders a business signal they can inspect.",
    };
  }

  if (caseId === "onboarding" && !completedCaseIds.includes("sales")) {
    return {
      action: "Review the case summary",
      reason:
        "the summary turns the playthrough into a portfolio artifact: problem, decision, solution, and impact.",
    };
  }

  return {
    action: "Review both case summaries",
    reason:
      "together, the cases show both performance consulting and sales enablement judgment.",
  };
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
  const evidenceIndex = caseEvidence.findIndex(
    (item) => item.id === evidence.id,
  );
  const runningEvidence = caseEvidence.filter((item) =>
    collectedEvidenceIds.includes(item.id),
  );
  const hasReadCorrectly = selectedSignal === "signal";
  const checkOptions = useMemo(() => {
    const options = [
      {
        kind: "signal" as const,
        label: evidence.signal,
        feedback:
          "Good. This is the signal that should shape the root-cause call.",
      },
      {
        kind: "trap" as const,
        label: evidence.trap,
        feedback:
          "Not quite. That jumps to a surface explanation before the full evidence pattern is clear.",
      },
      {
        kind: "ignore" as const,
        label: "Treat this as background context and move on.",
        feedback:
          "Not quite. This evidence changes the diagnosis, so it should not be treated as a side detail.",
      },
    ];
    if (evidence.id.length % 3 === 0) {
      return [options[1], options[2], options[0]];
    }
    if (evidence.id.length % 2 === 0) {
      return [options[2], options[0], options[1]];
    }
    return options;
  }, [evidence.id, evidence.signal, evidence.trap]);

  useEffect(() => {
    const handleEvidenceKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "1") {
        event.preventDefault();
        setSelectedSignal(checkOptions[0].kind);
        return;
      }
      if (key === "2") {
        event.preventDefault();
        setSelectedSignal(checkOptions[1].kind);
        return;
      }
      if (key === "3") {
        event.preventDefault();
        setSelectedSignal(checkOptions[2].kind);
        return;
      }
      if ((key === " " || key === "enter") && hasReadCorrectly) {
        event.preventDefault();
        onContinue();
      }
    };

    window.addEventListener("keydown", handleEvidenceKey);
    return () => window.removeEventListener("keydown", handleEvidenceKey);
  }, [checkOptions, hasReadCorrectly, onContinue]);

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

      <aside className="eq-evidence-purpose" aria-label="Evidence purpose">
        <strong>Why this matters</strong>
        <span>
          Do not memorize this item. Ask what it proves about the work system,
          then decide whether the leader's training request still fits the
          evidence.
        </span>
      </aside>

      <aside className="eq-running-case" aria-label="Running case pattern">
        <div>
          <p className="eq-kicker">Running Case Pattern</p>
          <h3>What the evidence is starting to prove</h3>
        </div>
        <ol>
          {runningEvidence.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.signal}</span>
            </li>
          ))}
        </ol>
      </aside>

      <div className="eq-canvas-grid">
        <article className="eq-canvas-card">
          <h3>What you found</h3>
          <p>{evidence.summary}</p>
        </article>
        <article className="eq-canvas-card">
          <h3>What it means</h3>
          <p>{evidence.insight}</p>
        </article>
        <article className="eq-canvas-card">
          <h3>Signal to notice</h3>
          <p>{evidence.signal}</p>
        </article>
      </div>

      <div className="eq-evidence-check">
        <div>
          <p className="eq-kicker">Check Your Read</p>
          <h3>What is the best read of this evidence?</h3>
          <p>
            The goal is not to guess. Choose the interpretation you would use
            later when explaining the root cause to a leader.
          </p>
        </div>
        {checkOptions.map((option, index) => (
          <button
            className={`eq-choice ${selectedSignal === option.kind ? "is-selected" : ""}`}
            key={option.kind}
            type="button"
            onClick={() => setSelectedSignal(option.kind)}
          >
            <kbd>{index + 1}</kbd>
            <span>{option.label}</span>
            {selectedSignal === option.kind && <small>{option.feedback}</small>}
          </button>
        ))}
      </div>

      {hasReadCorrectly && (
        <aside className="eq-evidence-takeaway" aria-label="Evidence takeaway">
          <strong>Saved for the final recommendation</strong>
          <span>
            This evidence now supports your diagnosis: {evidence.signal}
          </span>
        </aside>
      )}

      <button
        className="eq-primary-button mt-4"
        disabled={!hasReadCorrectly}
        type="button"
        onClick={onContinue}
      >
        {hasReadCorrectly
          ? "Save evidence and continue"
          : "Choose the useful signal to continue"}
      </button>
    </section>
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
        <p>Mobile: use the joystick and Talk / Inspect button.</p>
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

  return (
    <section
      className="eq-overlay eq-panel eq-decision"
      aria-label="Decision panel"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Diagnostic Decision</p>
          <h2>Is this really a training problem?</h2>
          <p>{synthesis.prompt}</p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <aside className="eq-decision-brief" aria-label="Plain language brief">
        <strong>Your role in this moment</strong>
        <span>
          Read this like a real stakeholder meeting. You are not guessing a game
          answer; you are deciding what you would recommend to leaders and how
          you would defend it with evidence.
        </span>
      </aside>

      <CaseMap
        selectedDiagnosis={selectedDiagnosis}
        selectedIntervention={selectedIntervention}
        synthesis={synthesis}
      />

      <div className="eq-option-grid">
        <div>
          <h3>1. Diagnose the root cause</h3>
          <p className="eq-decision-prompt">
            Which answer would still make sense if a leader challenged you to
            defend it with all three evidence items?
          </p>
          {diagnosisOptions.map((option) => (
            <button
              className={`eq-choice ${diagnosisId === option.id ? "is-selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => onChooseDiagnosis(option.id)}
            >
              <span>{option.label}</span>
              {diagnosisId === option.id && (
                <small>
                  {option.explanation}
                  <br />
                  Evidence check: {option.evidenceHint}
                  <br />
                  <span className="eq-choice-consequence">
                    Workplace consequence: {option.consequence}
                  </span>
                </small>
              )}
            </button>
          ))}
        </div>

        <div className={!canChooseIntervention ? "is-disabled" : ""}>
          <h3>2. Select the intervention</h3>
          <p className="eq-decision-prompt">
            {canChooseIntervention
              ? "Which solution changes the work, gives managers something to reinforce, and creates a metric leaders can inspect?"
              : "The solution is locked until your diagnosis explains the evidence. This is the performance-consulting pause."}
          </p>
          {interventionOptions.map((option) => (
            <button
              className={`eq-choice ${interventionId === option.id ? "is-selected" : ""}`}
              disabled={!canChooseIntervention}
              key={option.id}
              type="button"
              onClick={() => onChooseIntervention(option.id)}
            >
              <span>{option.label}</span>
              {interventionId === option.id && (
                <small>
                  {option.explanation}
                  <br />
                  Tradeoff: {option.tradeoff}
                  <br />
                  <span className="eq-choice-consequence">
                    Workplace consequence: {option.consequence}
                  </span>
                </small>
              )}
            </button>
          ))}
        </div>
      </div>

      <DecisionCoach
        selectedDiagnosis={selectedDiagnosis}
        selectedIntervention={selectedIntervention}
        canChooseIntervention={canChooseIntervention}
      />

      <div className="eq-case-synthesis" aria-label="Evidence synthesis">
        <article>
          <span>What Must Be Explained</span>
          <p>{synthesis.pattern}</p>
        </article>
        <article>
          <span>Tempting Wrong Turn</span>
          <p>{synthesis.trap}</p>
        </article>
        <article>
          <span>Business Result</span>
          <p>{synthesis.metric}</p>
        </article>
      </div>

      <DecisionChecklist canChooseIntervention={canChooseIntervention} />
    </section>
  );
}

function CaseMap({
  selectedDiagnosis,
  selectedIntervention,
  synthesis,
}: {
  selectedDiagnosis: DiagnosisOption | undefined;
  selectedIntervention: InterventionOption | undefined;
  synthesis: (typeof caseSynthesis)[CaseId];
}) {
  return (
    <section className="eq-case-map" aria-label="Case map">
      <div>
        <p className="eq-kicker">Plain-Language Case Map</p>
        <h3>How this case turns into a real recommendation</h3>
      </div>
      <ol>
        <li>
          <strong>1. Request</strong>
          <span>{synthesis.prompt}</span>
        </li>
        <li>
          <strong>2. Evidence pattern</strong>
          <span>{synthesis.pattern}</span>
        </li>
        <li>
          <strong>3. Diagnosis</strong>
          <span>
            {selectedDiagnosis?.label ??
              "Choose the cause that explains every evidence item."}
          </span>
        </li>
        <li>
          <strong>4. Solution</strong>
          <span>
            {selectedIntervention?.label ??
              "Choose the support that changes the work and can be measured."}
          </span>
        </li>
        <li>
          <strong>5. Impact</strong>
          <span>{synthesis.metric}</span>
        </li>
      </ol>
    </section>
  );
}

function DecisionChecklist({
  canChooseIntervention,
}: {
  canChooseIntervention: boolean;
}) {
  return (
    <section className="eq-decision-checklist" aria-label="Decision tests">
      <div>
        <p className="eq-kicker">Use These Three Tests</p>
        <h3>
          {canChooseIntervention
            ? "Before choosing a solution"
            : "Before choosing the root cause"}
        </h3>
      </div>
      <ol>
        {canChooseIntervention ? (
          <>
            <li>
              <strong>Changes the work</strong>
              <span>
                The best fix changes daily behavior, handoffs, coaching, or
                tools.
              </span>
            </li>
            <li>
              <strong>Creates reinforcement</strong>
              <span>
                Someone should be able to coach, inspect, or support the new
                behavior after launch.
              </span>
            </li>
            <li>
              <strong>Can be measured</strong>
              <span>
                Leaders should be able to inspect a business signal after the
                fix.
              </span>
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Explains all evidence</strong>
              <span>
                The diagnosis should connect all three evidence items, not just
                the loudest complaint.
              </span>
            </li>
            <li>
              <strong>Separates request from cause</strong>
              <span>
                A leader may ask for training even when the evidence points to
                workflow, coaching, tools, or communication.
              </span>
            </li>
            <li>
              <strong>Points to a measurable fix</strong>
              <span>
                The cause should lead to a solution that can improve a business
                signal.
              </span>
            </li>
          </>
        )}
      </ol>
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
          sure the root cause explains every evidence item, not just the loudest
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
          Now choose the intervention that changes the work, reinforces the
          behavior, and gives leaders a useful metric.
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
        {selectedIntervention.correct ? "Strong solution" : "Not enough yet"}
      </strong>
      <span>
        {selectedIntervention.correct
          ? "This solution fits the evidence and connects enablement work to a business signal."
          : "This solution leaves at least one important evidence item unresolved."}
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
    trap: string;
  }
> = {
  onboarding: {
    prompt:
      "Leadership asked for more training. Your job is to decide whether the evidence supports that request or points somewhere else.",
    pattern:
      "Your answer must explain conflicting instructions, delayed access, and a support-ticket spike after orientation.",
    trap: "A polished course would look responsive, but it may leave ownership and follow-up untouched.",
    metric:
      "The business wants faster time-to-productivity and fewer support tickets after orientation.",
  },
  sales: {
    prompt:
      "The team wants better demo results. Your job is to decide whether the evidence points to content, skill practice, coaching, or measurement.",
    pattern:
      "Your answer must explain shallow discovery, missing pain notes, and inconsistent manager coaching.",
    trap: "A stricter demo certification may improve presentation polish without improving buyer diagnosis.",
    metric:
      "The business wants better demo-to-next-step conversion and visible coaching rubric use.",
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
  const impact = getArtifactSection(artifact, "Expected Impact");
  const [copyStatus, setCopyStatus] = useState<"copied" | "idle" | "failed">(
    "idle",
  );
  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(artifact),
    [artifact],
  );

  const copyPortfolioSummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioSummary);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }, [portfolioSummary]);

  return (
    <section
      className="eq-overlay eq-panel eq-canvas"
      aria-label={artifact.title}
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Case Summary</p>
          <h2>{artifact.title}</h2>
          <p>{artifact.subtitle}</p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="eq-case-outcome" aria-label="Case outcome summary">
        <article>
          <span>Before</span>
          <strong>{businessProblem}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{rootCause}</strong>
        </article>
        <article>
          <span>Impact</span>
          <strong>{impact}</strong>
        </article>
      </div>

      <ReflectionPanel artifact={artifact} />

      <div className="eq-canvas-grid">
        {artifact.sections.map((section) => (
          <article className="eq-canvas-card" key={section.label}>
            <h3>{section.label}</h3>
            <p>{section.value}</p>
          </article>
        ))}
      </div>

      {artifact.learnerDebrief && (
        <aside className="eq-learner-debrief" aria-label="Learner debrief">
          <p className="eq-kicker">Learner debrief</p>
          <h3>{artifact.learnerDebrief.headline}</h3>
          <div>
            {artifact.learnerDebrief.points.map((point) => (
              <article key={point.label}>
                <strong>{point.label}</strong>
                <span>{point.value}</span>
              </article>
            ))}
          </div>
        </aside>
      )}

      {artifact.portfolioTakeaway && (
        <aside
          className="eq-portfolio-takeaway"
          aria-label="Portfolio takeaway"
        >
          <p className="eq-kicker">Portfolio takeaway</p>
          <h3>What this proves</h3>
          <p>{artifact.portfolioTakeaway}</p>
        </aside>
      )}

      <aside
        className="eq-share-summary"
        aria-label="Shareable portfolio summary"
      >
        <div>
          <p className="eq-kicker">Shareable summary</p>
          <h3>Copy this as the portfolio takeaway</h3>
          <p>
            This turns the playthrough into plain language a recruiter can
            understand without playing the full case.
          </p>
        </div>
        <textarea readOnly value={portfolioSummary} />
        <div className="eq-share-actions">
          <button
            className="eq-primary-button"
            type="button"
            onClick={copyPortfolioSummary}
          >
            Copy portfolio summary
          </button>
          {copyStatus === "copied" && <span>Copied.</span>}
          {copyStatus === "failed" && (
            <span>Copy was blocked. Select the text above instead.</span>
          )}
        </div>
      </aside>

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

      {showFinalDebrief && <FinalReviewerDebrief />}
    </section>
  );
}

function ReflectionPanel({
  artifact,
}: {
  artifact: NonNullable<GameState["earnedArtifact"]>;
}) {
  const businessProblem = getArtifactSection(artifact, "Business Problem");
  const rootCause = getArtifactSection(artifact, "Root Cause");
  const intervention = getArtifactSection(artifact, "Intervention");
  const impact = getArtifactSection(artifact, "Expected Impact");

  return (
    <aside className="eq-reflection-panel" aria-label="Reflection prompts">
      <p className="eq-kicker">Reflection prompts</p>
      <h3>Use this to explain the work</h3>
      <div>
        <article>
          <strong>What request did you question?</strong>
          <span>{businessProblem}</span>
        </article>
        <article>
          <strong>What changed your recommendation?</strong>
          <span>{rootCause}</span>
        </article>
        <article>
          <strong>What would you build and measure?</strong>
          <span>
            {intervention} Impact target: {impact}
          </span>
        </article>
      </div>
    </aside>
  );
}

function buildPortfolioSummary(
  artifact: NonNullable<GameState["earnedArtifact"]>,
) {
  const sections = Object.fromEntries(
    artifact.sections.map((section) => [section.label, section.value]),
  );
  return [
    `${artifact.title}: ${artifact.subtitle}`,
    "",
    `Business problem: ${sections["Business Problem"] ?? "Not captured."}`,
    `Root cause: ${sections["Root Cause"] ?? "Not captured."}`,
    `Enablement solution: ${sections.Intervention ?? "Not captured."}`,
    `Expected impact: ${sections["Expected Impact"] ?? "Not captured."}`,
    "",
    artifact.portfolioTakeaway
      ? `Portfolio takeaway: ${artifact.portfolioTakeaway}`
      : "Portfolio takeaway: This case demonstrates performance diagnosis, solution design, and business-impact thinking.",
  ].join("\n");
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
    <aside className="eq-final-debrief" aria-label="Final reviewer debrief">
      <p className="eq-kicker">Final reviewer debrief</p>
      <h3>What this complete run proves</h3>
      <div className="eq-final-debrief-grid">
        <article>
          <strong>Performance consulting</strong>
          <span>
            You do not accept a training request at face value. You interview,
            inspect evidence, diagnose the root cause, then choose the
            intervention.
          </span>
        </article>
        <article>
          <strong>Sales enablement range</strong>
          <span>
            The second case connects discovery behavior, manager coaching, and
            pipeline metrics instead of defaulting to more content.
          </span>
        </article>
        <article>
          <strong>Learning architecture</strong>
          <span>
            Each case follows a repeatable loop: investigate, diagnose, design,
            implement, and measure business impact.
          </span>
        </article>
        <article>
          <strong>Portfolio talking point</strong>
          <span>
            Terry Brutus built this as a playable case study to demonstrate
            judgment, systems thinking, accessibility, responsible AI use, and
            measurable enablement outcomes.
          </span>
        </article>
      </div>
    </aside>
  );
}
