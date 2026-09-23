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
                "Step 3 of 5: all clues are reviewed. Press Interact anywhere to choose the root cause.",
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
      earnedArtifact: null,
      dialogue: null,
      overlay: "none",
      toast: {
        id: Date.now(),
        message:
          "Step 1 of 5: talk with Maya. Your job is to test whether training is really the fix.",
      },
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
          toast:
            previous.questStage === "briefing"
              ? {
                  id: Date.now(),
                  message: `Step 2 of 5: inspect ${currentEvidenceItems.length} clues. For each clue, separate the useful signal from the tempting assumption.`,
                }
              : previous.toast,
        };
      }
      return {
        ...previous,
        dialogue: { ...previous.dialogue, lineIndex: nextIndex },
      };
    });
  }, [currentEvidenceItems.length]);

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
        toast: {
          id: Date.now(),
          message: option.correct
            ? "Step 4 of 5: diagnosis accepted. Now choose the solution that fixes the real work problem."
            : "Not quite. Re-check the clue pattern before choosing a solution.",
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
              "That solution does not fix the root cause yet. Try again from the clue pattern.",
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

      {gameState.player.hasStarted && (
        <Hud
          sceneName={currentScene.name}
          sceneSubtitle={currentScene.subtitle}
          questStage={gameState.questStage}
          evidenceCount={currentCollectedEvidenceCount}
          evidenceTotal={currentEvidenceItems.length}
          hasArtifact={Boolean(gameState.earnedArtifact)}
          nextObjective={nextObjective}
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
          earnedArtifact={gameState.earnedArtifact}
          onClose={closeOverlay}
          onOpenCanvas={() => setOverlay("canvas")}
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
          evidenceItems={currentEvidenceItems}
          onChooseDiagnosis={chooseDiagnosis}
          onChooseIntervention={chooseIntervention}
          onClose={closeOverlay}
        />
      )}

      {gameState.overlay === "canvas" && (
        <CanvasPanel
          artifact={
            gameState.earnedArtifact ??
            earnedArtifactsByCase[gameState.currentCaseId] ??
            earnedCanvas
          }
          showFinalDebrief={
            gameState.currentCaseId === "sales" &&
            gameState.completedCaseIds.includes("onboarding") &&
            gameState.completedCaseIds.includes("sales")
          }
          onClose={closeOverlay}
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
      ? `Step 2 of 5: inspect ${nextEvidenceTitle}. Clue ${evidenceCount + 1} of ${evidenceTotal}.`
      : `All clues reviewed: ${evidenceCount}/${evidenceTotal}. Press Interact anywhere to choose the root cause.`;
  }
  if (questStage === "diagnose") {
    return "Step 3 of 5: press Interact anywhere, then choose the root cause that explains every clue.";
  }
  if (questStage === "design") {
    return "Step 4 of 5: press Interact anywhere, then choose the solution that changes behavior and creates a useful metric.";
  }
  if (caseId === "onboarding" && !completedCaseIds.includes("sales")) {
    return "Step 5 of 5: review the case summary. It shows the before, decision, solution, and impact.";
  }
  return "Case complete: review both summaries and the business impact story.";
}

function EvidencePanel({
  evidence,
  onContinue,
}: {
  evidence: (typeof evidenceItems)[number];
  onContinue: () => void;
}) {
  const [selectedSignal, setSelectedSignal] = useState<
    "signal" | "trap" | null
  >(null);
  const hasReadCorrectly = selectedSignal === "signal";
  const checkOptions = useMemo(() => {
    const options = [
      {
        kind: "signal" as const,
        label: evidence.signal,
        feedback:
          "Good. This is the clue that should shape the root-cause call.",
      },
      {
        kind: "trap" as const,
        label: evidence.trap,
        feedback:
          "Not quite. That jumps to a surface explanation before the full clue pattern is clear.",
      },
    ];
    return evidence.id.length % 2 === 0 ? options.reverse() : options;
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
          <p className="eq-kicker">Clue Reviewed</p>
          <h2>{evidence.title}</h2>
          {evidence.metric && <p>{evidence.metric}</p>}
        </div>
      </div>

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
          <h3>Which clue should guide the diagnosis?</h3>
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

      <button
        className="eq-primary-button mt-4"
        disabled={!hasReadCorrectly}
        type="button"
        onClick={onContinue}
      >
        {hasReadCorrectly
          ? "Continue investigation"
          : "Pick the useful clue to continue"}
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
          Desktop: WASD or arrow keys to move. E, Space, or Enter to interact.
        </p>
        <p>Mobile: use the joystick and Interact button.</p>
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
  evidenceItems,
  onChooseDiagnosis,
  onChooseIntervention,
  onClose,
}: {
  diagnosisOptions: DiagnosisOption[];
  interventionOptions: InterventionOption[];
  diagnosisId: string | null;
  interventionId: string | null;
  currentCaseId: CaseId;
  evidenceItems: Evidence[];
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

      <div className="eq-case-synthesis" aria-label="Clue synthesis">
        <article>
          <span>Clue Pattern</span>
          <p>{synthesis.pattern}</p>
        </article>
        <article>
          <span>Trap To Avoid</span>
          <p>{synthesis.trap}</p>
        </article>
        <article>
          <span>Business Signal</span>
          <p>{synthesis.metric}</p>
        </article>
      </div>

      <div className="eq-signal-strip">
        {evidenceItems.map((item) => (
          <article key={item.id}>
            <strong>{item.title}</strong>
            <small>{item.metric}</small>
          </article>
        ))}
      </div>

      <DecisionChecklist canChooseIntervention={canChooseIntervention} />

      <DecisionCoach
        selectedDiagnosis={selectedDiagnosis}
        selectedIntervention={selectedIntervention}
        canChooseIntervention={canChooseIntervention}
      />

      <div className="eq-option-grid">
        <div>
          <h3>1. Diagnose the root cause</h3>
          <p className="eq-decision-prompt">
            Which explanation best connects all three clues?
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
                  Clue check: {option.evidenceHint}
                </small>
              )}
            </button>
          ))}
        </div>

        <div className={!canChooseIntervention ? "is-disabled" : ""}>
          <h3>2. Select the intervention</h3>
          <p className="eq-decision-prompt">
            {canChooseIntervention
              ? "Which solution changes the daily work and gives leaders a metric they can inspect?"
              : "Choose the correct root cause first. The solution is locked until the diagnosis fits the clues."}
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
                </small>
              )}
            </button>
          ))}
        </div>
      </div>
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
        <li>
          <strong>Explains every clue</strong>
          <span>
            The answer should connect all three clues, not just the loudest
            complaint.
          </span>
        </li>
        <li>
          <strong>Changes the work</strong>
          <span>
            The best fix changes daily behavior, handoffs, coaching, or tools.
          </span>
        </li>
        <li>
          <strong>Can be measured</strong>
          <span>
            Leaders should be able to inspect a business signal after the fix.
          </span>
        </li>
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
          Do not pick the option that sounds most familiar. Pick the one that
          explains every clue at the same time.
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
        <strong>Re-check the clues</strong>
        <span>
          {selectedDiagnosis.explanation} Look again at the clue check:{" "}
          {selectedDiagnosis.evidenceHint}
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
          {selectedDiagnosis.explanation} Now choose the intervention that
          changes the workflow, reinforces behavior, and gives leaders a useful
          metric.
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
        {selectedIntervention.explanation} Tradeoff:{" "}
        {selectedIntervention.tradeoff}
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
      "Use the clue pattern, not the original leadership request, to decide what the organization should actually build.",
    pattern:
      "The issue shows up across instructions, handoffs, access timing, and week-two support needs.",
    trap: "A longer onboarding course would feel responsive, but it would not fix ownership or reinforcement.",
    metric:
      "The useful outcome is faster time-to-productivity plus fewer support tickets after orientation.",
  },
  sales: {
    prompt:
      "Use the clue pattern to decide whether reps need more content or a better revenue-behavior system.",
    pattern:
      "Reps can explain features, but discovery depth, opportunity notes, and manager coaching are inconsistent.",
    trap: "A stricter demo certification measures presentation skill more than buyer diagnosis.",
    metric:
      "The useful outcome is improved demo-to-next-step conversion and visible coaching rubric use.",
  },
};

function CanvasPanel({
  artifact,
  showFinalDebrief,
  onClose,
}: {
  artifact: NonNullable<GameState["earnedArtifact"]>;
  showFinalDebrief: boolean;
  onClose: () => void;
}) {
  const businessProblem = getArtifactSection(artifact, "Business Problem");
  const rootCause = getArtifactSection(artifact, "Root Cause");
  const impact = getArtifactSection(artifact, "Expected Impact");

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

      {showFinalDebrief && <FinalReviewerDebrief />}
    </section>
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
    <aside className="eq-final-debrief" aria-label="Final reviewer debrief">
      <p className="eq-kicker">Final reviewer debrief</p>
      <h3>What this complete run proves</h3>
      <div className="eq-final-debrief-grid">
        <article>
          <strong>Performance consulting</strong>
          <span>
            The player does not accept a training request at face value. They
            interview, inspect clues, diagnose root cause, then choose the
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
