import {
  characters,
  diagnosisOptions,
  earnedCanvas,
  evidenceItems,
  interventionOptions,
  scenes,
} from "@/game/levels";
import { type LoadedAssets, loadGameAssets, renderGame } from "@/game/renderer";
import type { GameState, OverlayKind } from "@/game/types";
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
    position: { x: 20.5, y: 15.2 },
    direction: "down",
    isMoving: false,
    sceneId: "lab",
    hasStarted: false,
  },
  questStage: "briefing",
  collectedEvidenceIds: [],
  diagnosisId: null,
  interventionId: null,
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
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const { inputRef, interact } = useGameLoop({ gameStateRef, setGameState });

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

  const closeOverlay = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      overlay: "none",
      dialogue: null,
    }));
  }, []);

  const setOverlay = useCallback((overlay: OverlayKind) => {
    setGameState((previous) => ({
      ...previous,
      overlay: previous.overlay === overlay ? "none" : overlay,
      dialogue: null,
    }));
  }, []);

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
        onOpenQuest={() => setOverlay("quest")}
        onOpenBackpack={() => setOverlay("backpack")}
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
