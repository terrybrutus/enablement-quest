import {
  initialPlayerPosition,
  npcs,
  quests,
  waypoints,
  zones,
} from "@/game/levels";
import { renderGame } from "@/game/renderer";
import type { GameState } from "@/game/types";
import { useGameLoop } from "@/game/useGameLoop";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { DialoguePanel } from "./DialoguePanel";
import { Hud } from "./Hud";
import { NotificationToast } from "./NotificationToast";
import { QuestLog } from "./QuestLog";
import { TitleScreen } from "./TitleScreen";

function createInitialState(): GameState {
  return {
    player: {
      position: {
        x: initialPlayerPosition.x * 48 + 24,
        y: initialPlayerPosition.y * 48 + 24,
      },
      currentZoneId: 1,
      activeQuests: [],
      completedQuestIds: [],
      artifacts: [],
    },
    zones,
    npcs,
    waypoints,
    quests,
    currentDialogue: null,
    showQuestLog: false,
    showArtifacts: false,
    showTitle: true,
    gameStarted: false,
    notification: null,
    notificationTime: 0,
  };
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useGameLoop(gameStateRef, setGameState, canvasRef);

  // Render loop separate from game logic
  useEffect(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderGame(ctx, canvas, gameStateRef.current);
        }
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const startGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, showTitle: false, gameStarted: true }));
  }, []);

  const currentZone = gameState.zones.find(
    (z) => z.id === gameState.player.currentZoneId,
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-background"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        tabIndex={0}
        data-ocid="game.canvas_target"
      />

      {gameState.showTitle && <TitleScreen onStart={startGame} />}

      {gameState.gameStarted && (
        <>
          <Hud zoneName={currentZone?.name ?? ""} />

          {gameState.currentDialogue && (
            <DialoguePanel
              npc={gameState.currentDialogue.npc}
              line={
                gameState.currentDialogue.npc.dialogue[
                  gameState.currentDialogue.lineIndex
                ]
              }
              lineIndex={gameState.currentDialogue.lineIndex}
              totalLines={gameState.currentDialogue.npc.dialogue.length}
              onAdvance={() => {
                setGameState((prev) => {
                  if (!prev.currentDialogue) return prev;
                  const nextIndex = prev.currentDialogue.lineIndex + 1;
                  if (nextIndex >= prev.currentDialogue.npc.dialogue.length) {
                    const npc = prev.currentDialogue.npc;
                    let newState = { ...prev, currentDialogue: null };
                    if (npc.questId) {
                      const quest = newState.quests.find(
                        (q) => q.id === npc.questId,
                      );
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
                    currentDialogue: {
                      ...prev.currentDialogue,
                      lineIndex: nextIndex,
                    },
                  };
                });
              }}
            />
          )}

          {gameState.showQuestLog && (
            <QuestLog
              quests={gameState.quests}
              waypoints={gameState.waypoints}
              onClose={() =>
                setGameState((prev) => ({ ...prev, showQuestLog: false }))
              }
            />
          )}

          {gameState.showArtifacts && (
            <ArtifactsPanel
              artifacts={gameState.player.artifacts}
              onClose={() =>
                setGameState((prev) => ({ ...prev, showArtifacts: false }))
              }
            />
          )}

          {gameState.notification && (
            <NotificationToast
              message={gameState.notification}
              onDismiss={() =>
                setGameState((prev) => ({ ...prev, notification: null }))
              }
            />
          )}
        </>
      )}
    </div>
  );
}
