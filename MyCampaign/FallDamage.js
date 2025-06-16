const SAVE_DC = 14;
const damageType = "bludgeoning";
const trapIcon = "icons/skills/movement/arrow-down-pink.webp";

new Dialog({
  title: "Fall Damage Prompt",
  content: `
    <form>
      <div class="form-group">
        <label>Height Fallen (in feet):</label>
        <input type="number" name="height" min="10" value="10" />
      </div>
    </form>
  `,
  buttons: {
    post: {
      label: "Post to Chat",
      callback: async (html) => {
        const height = parseInt(html.find('[name="height"]').val()) || 0;
        const diceCount = Math.min(20, Math.floor(height / 10));
        if (diceCount <= 0) {
          return ui.notifications.warn("Must fall at least 10 feet.");
        }

        const damageRoll = await new Roll(`${diceCount}d6`).evaluate({ async: true });

        const content = `
          <h2><img src="${trapIcon}" width="24" style="vertical-align:middle; margin-right:0.5em;"> Fall Damage</h2>
          <p><strong>Height:</strong> ${height} feet → <strong>${diceCount}d6</strong> ${damageType} damage rolled.</p>
          <p><strong>DC ${SAVE_DC} Dexterity Save</strong><br><hr>
             <em><strong>Success:</strong></em> Take Half damage<br>
             <em><strong>Fail:</strong></em> Take Full damage + Prone</p>
          <div style="display: flex; gap: 0.5em;">
            <button data-action="fall-save">Roll DEX Save</button>
            <button data-action="fall-damage">Roll Damage</button>
          </div>
        `;

        const msg = await ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content
        });

        Hooks.once("renderChatMessage", (message, htmlEl) => {
          if (message.id !== msg.id) return;

          htmlEl.find('[data-action="fall-save"]').on("click", async () => {
            const selected = canvas.tokens.controlled;
            if (!selected.length) return ui.notifications.warn("Please select a token.");
            const actor = selected[0].actor;
            if (!actor) return ui.notifications.warn("Selected token has no actor.");

            const roll = await actor.rollAbilitySave("dex", {
              flavor: "Fall Damage - Dexterity Save (DC 14)",
              fastForward: true
            });

            const passed = roll.total >= SAVE_DC;
            const result = passed
              ? `<p><strong>Success!</strong> Take half damage.</p>`
              : `<p><strong>Fail!</strong> Take full damage and fall <strong>prone</strong>.</p>`;

            ChatMessage.create({
              speaker: ChatMessage.getSpeaker(),
              content: `
                <h2>🛡️ Save Result</h2>
                <p>Dex Save Roll: <strong>${roll.total}</strong> vs DC <strong>${SAVE_DC}</strong></p>
                ${result}
              `
            });
          });

          htmlEl.find('[data-action="fall-damage"]').on("click", async () => {
            damageRoll.toMessage({
              flavor: "Fall Damage Roll",
              speaker: ChatMessage.getSpeaker()
            });
          });
        });
      }
    },
    cancel: { label: "Cancel" }
  }
}).render(true);
