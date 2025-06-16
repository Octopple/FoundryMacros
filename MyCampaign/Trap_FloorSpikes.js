// Trap: Floor Spikes - Button-based saving throw and damage roll

const saveDC = 13;
const saveType = "dex";
const damageFormula = "2d10";
const trapIcon = "icons/environment/traps/cage-grey-steel.webp";

const html = `
  <h2><img src="${trapIcon}" width="24" style="vertical-align:middle; margin-right:0.5em;">Trap Triggered: Spikes</h2>
  <p>This trap requires a <strong>Dexterity Save (DC ${saveDC})</strong>.<br>If failed, the target takes <strong>${damageFormula}</strong> piercing damage.</p>
  <div style="display: flex; gap: 0.5em;">
    <button data-action="spike-save">Roll DEX Save</button>
    <button data-action="spike-damage">Roll Damage</button>
  </div>
`;

ChatMessage.create({
  speaker: { alias: "Trap" },
  content: html,
}).then(msg => {
  Hooks.once("renderChatMessage", (message, htmlEl) => {
    if (message.id !== msg.id) return;

    htmlEl.find('[data-action="spike-save"]').on("click", async () => {
      const selected = canvas.tokens.controlled;
      if (!selected.length) return ui.notifications.warn("Please select a token.");
      const actor = selected[0].actor;
      if (!actor) return ui.notifications.warn("Selected token has no actor.");

      await actor.rollAbilitySave(saveType, {
        dc: saveDC,
        flavor: "Floor Spikes - Dexterity Save",
        fastForward: true
      });
    });

    htmlEl.find('[data-action="spike-damage"]').on("click", async () => {
      const roll = await new Roll(damageFormula).evaluate({ async: true });
      roll.toMessage({ flavor: "Floor Spikes Damage", speaker: ChatMessage.getSpeaker() });
    });
  });
});