import OBR from "./obr-sdk.js";

const TOOL_ID = "com.guilherme.ghost-move/tool";
const MODE_ID = "com.guilherme.ghost-move/mode";

const ICON_URL = new URL("../icon.svg", import.meta.url).href;

OBR.onReady(async () => {
  // Ferramenta principal — aparece na barra lateral do OBR
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [{ icon: ICON_URL, label: "Ghost Move" }],
    defaultMode: MODE_ID,
  });

  let dragOffset = { x: 0, y: 0 };
  let dragTarget = null;

  // Modo da ferramenta — define o comportamento do arrasto
  await OBR.tool.createMode({
    id: MODE_ID,
    icons: [
      {
        icon: ICON_URL,
        label: "Mover token furtivamente",
        filter: { activeTools: [TOOL_ID] },
      },
    ],
    cursors: [
      {
        cursor: "grab",
        filter: {
          target: [
            { key: "layer", value: "MAP", operator: "!=" },
            { key: "locked", value: false },
          ],
        },
      },
    ],

    onToolDragStart: async (_, event) => {
      const target = event.target;
      if (!target || target.locked || target.layer === "MAP") return;
      dragTarget = target;
      // Remove da seleção para suprimir o highlight e o nome do jogador
      await OBR.player.deselect([target.id]);
      dragOffset = {
        x: target.position.x - event.pointerPosition.x,
        y: target.position.y - event.pointerPosition.y,
      };
    },

    onToolDragMove: async (_, event) => {
      if (!dragTarget) return;
      await OBR.scene.items.updateItems([dragTarget.id], (items) => {
        items[0].position = {
          x: event.pointerPosition.x + dragOffset.x,
          y: event.pointerPosition.y + dragOffset.y,
        };
      });
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
          items[0].position = snapped;
        });
      } catch {
        // Sem grade ou snap indisponível — mantém posição livre
      }
      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },

    onToolDragCancel: async () => {
      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },
  });
});
