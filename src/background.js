import OBR from "./obr-sdk.js";

const EXTENSION_ID = "com.guilherme.ghost-move";
const TOOL_ID = `${EXTENSION_ID}/tool`;
const MODE_ID = `${EXTENSION_ID}/mode`;

// Constrói a URL do ícone de forma robusta
function getIconUrl() {
  try {
    return new URL("../icon.svg", import.meta.url).href;
  } catch {
    return `${window.location.origin}/icon.svg`;
  }
}

const ICON_URL = getIconUrl();

OBR.onReady(async () => {
  // Registra a ferramenta principal na barra lateral
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [
      {
        icon: ICON_URL,
        label: "Ghost Move",
        filter: {
          activeTools: [],
        },
      },
    ],
    defaultMode: MODE_ID,
  });

  // Registra o modo da ferramenta que implementa o arrasto furtivo
  let dragOffset = { x: 0, y: 0 };
  let dragTarget = null;

  await OBR.tool.createMode({
    id: MODE_ID,
    icons: [
      {
        icon: ICON_URL,
        label: "Mover token furtivamente",
        filter: {
          activeTools: [TOOL_ID],
        },
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

      // Deseleciona o token para suprimir o contorno colorido e o nome do jogador
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
        // Sem grade ou snap não disponível — mantém posição livre
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
