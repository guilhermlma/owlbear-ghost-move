import OBR from "./obr-sdk.js";

const TOOL_ID = "com.guilherme.ghost-move/tool";
const MODE_ID = "com.guilherme.ghost-move/mode";

const ICON_URL = new URL("../icon.svg", import.meta.url).href;

OBR.onReady(async () => {
  // Ferramenta principal — aparece na barra lateral do OBR com o nome Mouse e ícone de ponteiro
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [{ icon: ICON_URL, label: "Mouse" }],
    defaultMode: MODE_ID,
  });

  let dragOffset = { x: 0, y: 0 };
  let dragTarget = null;
  let updateInteraction = null;
  let stopInteraction = null;

  // Modo da ferramenta — define o comportamento do arrasto e o cursor
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
        cursor: "pointer",
        filter: {
          target: [
            { key: "layer", value: "MAP", operator: "!=" },
            { key: "locked", value: false },
          ],
        },
      },
      {
        cursor: "default",
      },
    ],

    onToolDragStart: async (_, event) => {
      const target = event.target;
      if (!target || target.locked || target.layer === "MAP") return;
      dragTarget = target;

      // Suprime o contorno de seleção e o nome do jogador
      await OBR.player.deselect([target.id]);

      dragOffset = {
        x: target.position.x - event.pointerPosition.x,
        y: target.position.y - event.pointerPosition.y,
      };

      // Inicia a interação fluida nativa de 60fps sem engasgos de rede
      const interaction = await OBR.interaction.startItemInteraction(target);
      updateInteraction = interaction[0];
      stopInteraction = interaction[1];
    },

    onToolDragMove: (_, event) => {
      if (!dragTarget || !updateInteraction) return;

      const newPos = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };

      // Envia atualizações imediatas e leves mantendo o frame rate perfeito
      updateInteraction((draft) => {
        draft.position = newPos;
      });
    },

    onToolDragEnd: async (_, event) => {
      if (!dragTarget) return;

      // Finaliza o modo interativo temporário
      if (stopInteraction) {
        stopInteraction();
        stopInteraction = null;
        updateInteraction = null;
      }

      const rawPos = {
        x: event.pointerPosition.x + dragOffset.x,
        y: event.pointerPosition.y + dragOffset.y,
      };

      let finalPos = rawPos;
      try {
        finalPos = await OBR.scene.grid.snapPosition(rawPos, 1, true, true);
      } catch {
        // Sem grade ou snap indisponível — mantém posição livre
      }

      // Confirmação final da posição atômica na cena
      await OBR.scene.items.updateItems([dragTarget.id], (items) => {
        items[0].position = finalPos;
      });

      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },

    onToolDragCancel: async () => {
      if (stopInteraction) {
        stopInteraction();
        stopInteraction = null;
        updateInteraction = null;
      }
      dragTarget = null;
      dragOffset = { x: 0, y: 0 };
    },
  });
});
