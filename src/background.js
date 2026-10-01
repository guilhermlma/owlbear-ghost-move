import OBR from "./obr-sdk.js";

const TOOL_ID = "com.guilherme.ghost-move/tool";
const MODE_ID = "com.guilherme.ghost-move/mode";

const ICON_URL = new URL("../icon.svg", import.meta.url).href;

OBR.onReady(async () => {
  // Ferramenta principal — aparece na barra lateral do OBR
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [{ icon: ICON_URL, label: "Mouse" }],
    defaultMode: MODE_ID,
  });

  let dragOffset = { x: 0, y: 0 };
  let dragTarget = null;
  let updateInteraction = null;
  let stopInteraction = null;

  // Modo da ferramenta — define o comportamento do arrasto e cursores
  await OBR.tool.createMode({
    id: MODE_ID,
    icons: [
      {
        icon: ICON_URL,
        label: "Mouse",
        filter: { activeTools: [TOOL_ID] },
      },
    ],
    cursors: [
      {
        // Visual de apontar (Pointing Hand / pointer) ao passar o mouse em cima de um token móvel
        cursor: "pointer",
        filter: {
          target: [
            { key: "layer", value: "MAP", operator: "!=" },
            { key: "locked", value: false },
          ],
        },
      },
      {
        // Cursor padrão para quando estiver fora de tokens
        cursor: "default",
      },
    ],

    onToolDragStart: async (_, event) => {
      const target = event.target;
      if (!target || target.locked || target.layer === "MAP") return;
      dragTarget = target;

      // Garante que o token não está na seleção nativa (sem contorno colorido nem nome de jogador)
      await OBR.player.deselect([target.id]);

      dragOffset = {
        x: target.position.x - event.pointerPosition.x,
        y: target.position.y - event.pointerPosition.y,
      };

      // Inicia a interação fluida de item do Owlbear Rodeo (60fps suave sem picotar)
      try {
        const interaction = await OBR.interaction.startItemInteraction(target);
        updateInteraction = interaction[0];
        stopInteraction = interaction[1];
      } catch (e) {
        updateInteraction = null;
        stopInteraction = null;
      }
    },

    onToolDragMove: async (_, event) => {
      if (!dragTarget) return;

      const newPos = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };

      if (updateInteraction) {
        // Atualização em tempo real via startItemInteraction sem engasgos
        updateInteraction((draft) => {
          draft.position = newPos;
        });
      } else {
        // Fallback para updateItems
        OBR.scene.items.updateItems([dragTarget.id], (items) => {
          if (items[0]) {
            items[0].position = newPos;
          }
        });
      }
    },

    onToolDragEnd: async (_, event) => {
      if (!dragTarget) return;

      const rawPos = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };

      // Encerra a interação contínua
      if (stopInteraction) {
        try {
          stopInteraction();
        } catch {}
        updateInteraction = null;
        stopInteraction = null;
      }

      // Alinha à grade (snap) e grava a posição final persistente
      try {
        const snapped = await OBR.scene.grid.snapPosition(rawPos, 1, true, true);
        await OBR.scene.items.updateItems([dragTarget.id], (items) => {
          if (items[0]) {
            items[0].position = snapped;
          }
        });
      } catch {
        await OBR.scene.items.updateItems([dragTarget.id], (items) => {
          if (items[0]) {
            items[0].position = rawPos;
          }
        });
      }

      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },

    onToolDragCancel: async () => {
      if (stopInteraction) {
        try {
          stopInteraction();
        } catch {}
        updateInteraction = null;
        stopInteraction = null;
      }
      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },
  });
});
