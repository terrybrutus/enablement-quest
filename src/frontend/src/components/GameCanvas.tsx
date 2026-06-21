import {
  characters,
  diagnosisOptions,
  earnedCanvas,
  evidenceItems,
  initialPosition,
  interventionOptions,
  scenes,
} from "@/game/levels";
import { type LoadedAssets, loadGameAssets, renderGame } from "@/game/renderer";
import type { GameState, OverlayKind } from "@/game/types";
import { MOVE_SPEED } from "@/game/types";
import { completeIntervention, useGameLoop } from "@/game/useGameLoop";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { DialoguePanel } from "./DialoguePanel";
import { Hud } from "./Hud";
import { NotificationToast } from "./NotificationToast";
import { QuestLog } from "./QuestLog";
import { TitleScreen } from "./TitleScreen";

const initialGameState: GameState = {
  player: {
    position: initialPosition,
    direction: "down",
    isMoving: false,
    sceneId: "lab",
    hasStarted: false,
  },
  questStage: "briefing",
  collectedEvidenceIds: [],
  diagnosisId: null,
  interventionId: null,
  activeEvidenceId: null,
  earnedArtifact: null,
  overlay: "briefing",
  dialogue: null,
  toast: null,
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<LoadedAssets>({});
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [moveSpeed, setMoveSpeed] = useState(MOVE_SPEED);
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
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
  const nextObjective = getNextObjective(
    gameState.questStage,
    gameState.collectedEvidenceIds.length,
    gameState.player.sceneId,
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
              message: "All evidence reviewed. Make the diagnosis.",
            }
          : previous.toast,
    }));
  }, []);

  useEffect(() => {
    if (gameState.overlay !== "evidence") {
      return;
    }

    const handleEvidenceKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        closeEvidenceReview();
      }
    };

    window.addEventListener("keydown", handleEvidenceKey);
    return () => window.removeEventListener("keydown", handleEvidenceKey);
  }, [closeEvidenceReview, gameState.overlay]);

  const startMission = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      player: { ...previous.player, hasStarted: true },
      overlay: "none",
      toast: {
        id: Date.now(),
        message:
          "Mission started: walk into the blue doorway at the bottom center.",
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
                  message:
                    "Guide updated: enter Operations Suite and collect three evidence items.",
                }
              : previous.toast,
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
        (key === "e" || key === "enter" || key === " ")
      ) {
        event.preventDefault();
        advanceDialogue();
      }
    };

    window.addEventListener("keydown", handleDialogueKeys);
    return () => window.removeEventListener("keydown", handleDialogueKeys);
  }, [advanceDialogue]);

  const chooseDiagnosis = useCallback((id: string) => {
    const option = diagnosisOptions.find((item) => item.id === id);
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
          ? "Diagnosis accepted: this is a workflow and reinforcement problem."
          : "Not quite. Re-check the evidence before choosing the intervention.",
      },
    }));
  }, []);

  const chooseIntervention = useCallback((id: string) => {
    const option = interventionOptions.find((item) => item.id === id);
    if (!option) {
      return;
    }
    if (!option.correct) {
      setGameState((previous) => ({
        ...previous,
        interventionId: id,
        toast: {
          id: Date.now(),
          message: "That intervention does not fit the root cause yet.",
        },
      }));
      return;
    }
    setGameState((previous) => ({
      ...previous,
      interventionId: id,
    }));
    completeIntervention(setGameState);
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

      <Hud
        sceneName={currentScene.name}
        sceneSubtitle={currentScene.subtitle}
        questStage={gameState.questStage}
        evidenceCount={gameState.collectedEvidenceIds.length}
        evidenceTotal={evidenceItems.length}
        hasArtifact={Boolean(gameState.earnedArtifact)}
        nextObjective={nextObjective}
        onOpenQuest={() => setOverlay("quest")}
        onOpenBackpack={() => setOverlay("backpack")}
        onOpenSettings={() => setOverlay("settings")}
        onInteract={interact}
        inputRef={inputRef}
      />

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
                gameState.dialogue.lineIndex
              ]
            }
            lineIndex={gameState.dialogue.lineIndex}
            totalLines={activeCharacter.dialogue[gameState.questStage].length}
            onAdvance={advanceDialogue}
            onClose={closeOverlay}
          />
        )}

      {gameState.overlay === "quest" && (
        <QuestLog
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
          evidence={activeEvidence}
          onContinue={closeEvidenceReview}
        />
      )}

      {gameState.overlay === "decision" && (
        <DecisionPanel
          diagnosisId={gameState.diagnosisId}
          interventionId={gameState.interventionId}
          onChooseDiagnosis={chooseDiagnosis}
          onChooseIntervention={chooseIntervention}
          onClose={closeOverlay}
        />
      )}

      {gameState.overlay === "canvas" && (
        <CanvasPanel
          artifact={gameState.earnedArtifact ?? earnedCanvas}
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

function getNextObjective(
  questStage: GameState["questStage"],
  evidenceCount: number,
  sceneId: GameState["player"]["sceneId"],
) {
  if (questStage === "briefing") {
    return sceneId === "operations"
      ? "Talk to Maya before collecting evidence."
      : "Enter Operations Suite and talk to Maya.";
  }
  if (questStage === "investigate") {
    return `Inspect evidence: ${evidenceCount}/3 collected.`;
  }
  if (questStage === "diagnose") {
    return "Press interact to make the diagnosis.";
  }
  if (questStage === "design") {
    return "Choose the intervention that fits the evidence.";
  }
  return "Review the earned canvas and business impact.";
}

function EvidencePanel({
  evidence,
  onContinue,
}: {
  evidence: (typeof evidenceItems)[number];
  onContinue: () => void;
}) {
  return (
    <section
      className="eq-overlay eq-panel eq-evidence"
      aria-label={evidence.title}
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Evidence Reviewed</p>
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
      </div>

      <button
        className="eq-primary-button mt-4"
        type="button"
        onClick={onContinue}
      >
        Continue investigation
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
          <p>Adjust movement without changing the mission.</p>
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
  diagnosisId,
  interventionId,
  onChooseDiagnosis,
  onChooseIntervention,
  onClose,
}: {
  diagnosisId: string | null;
  interventionId: string | null;
  onChooseDiagnosis: (id: string) => void;
  onChooseIntervention: (id: string) => void;
  onClose: () => void;
}) {
  const selectedDiagnosis = diagnosisOptions.find(
    (option) => option.id === diagnosisId,
  );
  const canChooseIntervention = selectedDiagnosis?.correct ?? false;

  return (
    <section
      className="eq-overlay eq-panel eq-decision"
      aria-label="Decision panel"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Diagnostic Decision</p>
          <h2>Is this really a training problem?</h2>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="eq-option-grid">
        <div>
          <h3>1. Diagnose the root cause</h3>
          {diagnosisOptions.map((option) => (
            <button
              className={`eq-choice ${diagnosisId === option.id ? "is-selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => onChooseDiagnosis(option.id)}
            >
              <span>{option.label}</span>
              {diagnosisId === option.id && <small>{option.explanation}</small>}
            </button>
          ))}
        </div>

        <div className={!canChooseIntervention ? "is-disabled" : ""}>
          <h3>2. Select the intervention</h3>
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
                <small>{option.explanation}</small>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CanvasPanel({
  artifact,
  onClose,
}: {
  artifact: NonNullable<GameState["earnedArtifact"]>;
  onClose: () => void;
}) {
  return (
    <section
      className="eq-overlay eq-panel eq-canvas"
      aria-label={artifact.title}
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Earned Artifact</p>
          <h2>{artifact.title}</h2>
          <p>{artifact.subtitle}</p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="eq-canvas-grid">
        {artifact.sections.map((section) => (
          <article className="eq-canvas-card" key={section.label}>
            <h3>{section.label}</h3>
            <p>{section.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
