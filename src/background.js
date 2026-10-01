import OBR from "./obr-sdk.js";

const TOOL_ID = "com.guilherme.ghost-move/tool";
const MODE_ID = "com.guilherme.ghost-move/mode";

const ICON_URL = new URL("../icon.svg", import.meta.url).href;

OBR.onReady(async () => {
  // Ferramenta principal — registrada como "Pointer"
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [{ icon: ICON_URL, label: "Pointer" }],
    defaultMode: MODE_ID,
  });

  // Ativa automaticamente o Pointer ao inicializar para ficar em uso prioritário
  try {
    await OBR.tool.activateTool(TOOL_ID);
    await OBR.tool.activateMode(TOOL_ID, MODE_ID);
  } catch (e) {
    console.warn("[Pointer] Não foi possível ativar ferramenta como padrão:", e);
  }

  let dragOffset = { x: 0, y: 0 };
  let dragTarget = null;
  let isUpdating = false;
  let pendingPosition = null;

  // Função interna de atualização suave e fluida sem gargalo de rede/promises
  async function flushUpdate() {
    if (isUpdating || !pendingPosition || !dragTarget) return;
    isUpdating = true;
    const targetPos = pendingPosition;
    pendingPosition = null;

    try {
      await OBR.scene.items.updateItems([dragTarget.id], (items) => {
        if (items[0]) {
          items[0].position = targetPos;
        }
      });
    } catch (e) {
      console.error("[Pointer] Erro ao mover item:", e);
    } finally {
      isUpdating = false;
      // Se houver nova posição acumulada durante o update anterior, despacha imediatamente
      if (pendingPosition) {
        flushUpdate();
      }
    }
  }

  // Modo da ferramenta — define comportamento e cursores
  await OBR.tool.createMode({
    id: MODE_ID,
    icons: [
      {
        icon: ICON_URL,
        label: "Pointer",
        filter: { activeTools: [TOOL_ID] },
      },
    ],
    cursors: [
      // 1. Ao passar o mouse em cima de um token móvel: mão apontando (pointer)
      {
        cursor: "pointer",
        filter: {
          target: [
            { key: "layer", value: "MAP", operator: "!=" },
            { key: "locked", value: false },
          ],
        },
      },
      // 2. Cursor padrão em área vazia: default / ponteiro normal
      {
        cursor: "default",
      },
    ],

    onToolDragStart: async (_, event) => {
      const target = event.target;
      if (!target || target.locked || target.layer === "MAP") return;
      dragTarget = target;
      // Remove da seleção nativa do OBR para nunca exibir anel de seleção nem nome de jogador
      await OBR.player.deselect([target.id]);
      dragOffset = {
        x: target.position.x - event.pointerPosition.x,
        y: target.position.y - event.pointerPosition.y,
      };
      pendingPosition = null;
    },

    onToolDragMove: async (_, event) => {
      if (!dragTarget) return;
      pendingPosition = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };
      flushUpdate();
    },

    onToolDragEnd: async (_, event) => {
      if (!dragTarget) return;
      const rawPos = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };

      try {
        const snapped = await OBR.scene.grid.snapPosition(rawPos, 1, true, true);
        await OBR.scene.items.updateItems([dragTarget.id], (items) => {
          if (items[0]) {
            items[0].position = snapped;
          }
        });
      } catch {
        // Sem grade ou snap indisponível: mantém posição final
        await OBR.scene.items.updateItems([dragTarget.id], (items) => {
          if (items[0]) {
            items[0].position = rawPos;
          }
        });
      }

      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
      pendingPosition = null;
      isUpdating = false;
    },

    onToolDragCancel: async () => {
      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
      pendingPosition = null;
      isUpdating = false;
    },
  });
});
